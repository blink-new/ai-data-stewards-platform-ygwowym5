import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { 
  Send, 
  Bot, 
  Database,
  FileText,
  BarChart3,
  Copy,
  Sparkles
} from 'lucide-react'
import { blink } from '../blink/client'

interface DataSource {
  id: string
  name: string
  type: 'csv' | 'json' | 'excel' | 'database'
  size: number
  uploadedAt: Date
  status: 'processing' | 'ready' | 'error'
  recordCount?: number
  columns?: string[]
  description?: string
  fileUrl?: string
  userId: string
}

interface ChatMessage {
  id: string
  content: string
  type: 'user' | 'ai'
  timestamp: Date
  dataSource?: DataSource
  analysis?: {
    charts?: any[]
    insights?: string[]
    summary?: string
  }
}

interface DataChatInterfaceProps {
  dataSource: DataSource | null
  user: any
}

export function DataChatInterface({ dataSource, user }: DataChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isAiTyping, setIsAiTyping] = useState(false)
  const [dataContent, setDataContent] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadDataContent = async () => {
      if (!dataSource?.fileUrl) return
      
      try {
        // Extract content from the data source file
        const content = await blink.data.extractFromUrl(dataSource.fileUrl)
        setDataContent(Array.isArray(content) ? content.join('\n') : content)
      } catch (error) {
        console.error('Failed to load data content:', error)
      }
    }

    const initializeChat = () => {
      if (!dataSource) return

      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        content: `Hello! I'm ready to help you analyze "${dataSource.name}". This dataset contains ${dataSource.recordCount?.toLocaleString() || 'unknown'} records with ${dataSource.columns?.length || 0} columns.

Here are some things you can ask me:
• "Summarize this data"
• "What are the key insights?"
• "Show me data quality issues"
• "Find patterns or trends"
• "Generate a report"

What would you like to know about your data?`,
        type: 'ai',
        timestamp: new Date(),
        dataSource
      }

      setMessages([welcomeMessage])
    }

    if (dataSource) {
      loadDataContent()
      initializeChat()
    }
  }, [dataSource])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !dataSource) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage,
      type: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setNewMessage('')
    setIsAiTyping(true)

    try {
      // Generate AI response with data context
      const response = await blink.ai.generateText({
        prompt: `You are a data analysis AI assistant helping a data steward analyze their dataset.

Dataset Information:
- Name: ${dataSource.name}
- Type: ${dataSource.type}
- Records: ${dataSource.recordCount || 'unknown'}
- Columns: ${dataSource.columns?.join(', ') || 'unknown'}
- Description: ${dataSource.description || 'No description'}

Data Sample (first 2000 characters):
${dataContent.substring(0, 2000)}

User Question: "${newMessage}"

Please provide a helpful, detailed analysis response. If the user is asking for:
- Summary: Provide key statistics and overview
- Insights: Identify patterns, trends, and notable findings  
- Quality issues: Point out missing data, inconsistencies, duplicates
- Specific analysis: Answer based on the data content
- Reports: Structure findings in a clear format

Be specific and reference actual data when possible. Keep responses professional and actionable for data stewardship tasks.`,
        maxTokens: 500
      })

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.text,
        type: 'ai',
        timestamp: new Date(),
        dataSource
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Failed to generate AI response:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm having trouble analyzing your data right now. Please try rephrasing your question or check your data source.",
        type: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsAiTyping(false)
    }
  }

  const generateDataReport = async () => {
    if (!dataSource) return

    setIsAiTyping(true)
    try {
      const response = await blink.ai.generateText({
        prompt: `Generate a comprehensive data quality and analysis report for this dataset:

Dataset: ${dataSource.name}
Type: ${dataSource.type}
Records: ${dataSource.recordCount || 'unknown'}
Columns: ${dataSource.columns?.join(', ') || 'unknown'}

Data Sample:
${dataContent.substring(0, 3000)}

Please provide a structured report with:
1. Executive Summary
2. Data Overview (structure, size, key fields)
3. Data Quality Assessment (completeness, accuracy, consistency)
4. Key Insights and Patterns
5. Recommendations for Data Stewards
6. Potential Issues and Risks

Format as a professional report suitable for data governance teams.`,
        maxTokens: 800
      })

      const reportMessage: ChatMessage = {
        id: Date.now().toString(),
        content: response.text,
        type: 'ai',
        timestamp: new Date(),
        dataSource
      }

      setMessages(prev => [...prev, reportMessage])
    } catch (error) {
      console.error('Failed to generate report:', error)
    } finally {
      setIsAiTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const copyMessageContent = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  if (!dataSource) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <Database className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-medium text-foreground">No Data Source Selected</h3>
              <p className="text-muted-foreground">
                Select a data source from the sidebar to start chatting with your data
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{dataSource.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {dataSource.recordCount?.toLocaleString()} records • {dataSource.columns?.length} columns
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={generateDataReport}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {dataSource.status}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <Separator />

      {/* Messages */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className={message.type === 'ai' ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                    {message.type === 'ai' ? <Bot className="h-4 w-4" /> : user?.displayName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-sm text-foreground">
                      {message.type === 'ai' ? 'AI Data Analyst' : (user?.displayName || 'You')}
                    </span>
                    {message.type === 'ai' && (
                      <Badge variant="secondary" className="text-xs">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 relative group">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{message.content}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => copyMessageContent(message.content)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {isAiTyping && (
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-sm text-foreground">AI Data Analyst</span>
                    <Badge variant="secondary" className="text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI
                    </Badge>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-muted-foreground">Analyzing your data...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      <Separator />

      {/* Input */}
      <CardContent className="p-4">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your data..."
              className="min-h-[40px]"
              disabled={isAiTyping}
            />
          </div>
          <Button onClick={sendMessage} disabled={!newMessage.trim() || isAiTyping}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2 mt-2">
          <p className="text-xs text-muted-foreground">
            Try: "Summarize this data" • "Find data quality issues" • "Show key insights"
          </p>
        </div>
      </CardContent>
    </Card>
  )
}