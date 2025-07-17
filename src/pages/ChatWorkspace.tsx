import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import { ScrollArea } from '../components/ui/scroll-area'
import { 
  Send, 
  Bot, 
  Users, 
  Plus,
  Search,
  MoreVertical,
  Paperclip,
  Smile
} from 'lucide-react'
import { blink } from '../blink/client'

interface ChatWorkspaceProps {
  user: any
}

interface Message {
  id: string
  content: string
  userId: string
  userName: string
  timestamp: Date
  type: 'user' | 'ai' | 'system'
}

interface Channel {
  id: string
  name: string
  description: string
  memberCount: number
  isActive: boolean
}

export function ChatWorkspace({ user }: ChatWorkspaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [channels, setChannels] = useState<Channel[]>([])
  const [activeChannel, setActiveChannel] = useState<string>('general')
  const [onlineUsers, setOnlineUsers] = useState([])
  const [isAiTyping, setIsAiTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initializeChannels()
    loadMessages()
    
    // Setup realtime inline to avoid dependency issues
    let unsubscribe: (() => void) | undefined

    const initRealtime = async () => {
      try {
        unsubscribe = await blink.realtime.subscribe(`chat-${activeChannel}`, (message) => {
          if (message.type === 'chat') {
            const newMsg: Message = {
              id: message.id,
              content: message.data.content,
              userId: message.userId,
              userName: message.metadata?.displayName || 'Unknown User',
              timestamp: new Date(message.timestamp),
              type: message.data.type || 'user'
            }
            setMessages(prev => [...prev, newMsg])
          }
        })
      } catch (error) {
        console.error('Failed to setup realtime:', error)
      }
    }

    initRealtime()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [activeChannel])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeChannels = () => {
    setChannels([
      {
        id: 'general',
        name: 'General Discussion',
        description: 'General data stewardship discussions',
        memberCount: 12,
        isActive: true
      },
      {
        id: 'kyc-team',
        name: 'KYC Team',
        description: 'KYC data quality and compliance',
        memberCount: 8,
        isActive: true
      },
      {
        id: 'mdm-team',
        name: 'MDM Team',
        description: 'Master Data Management discussions',
        memberCount: 6,
        isActive: true
      },
      {
        id: 'ai-insights',
        name: 'AI Insights',
        description: 'AI-generated recommendations and insights',
        memberCount: 15,
        isActive: true
      }
    ])
  }

  const loadMessages = () => {
    // Simulate loading messages for the active channel
    const sampleMessages: Message[] = [
      {
        id: '1',
        content: 'Good morning team! I\'ve noticed some inconsistencies in the customer address data. Should we run a quality check?',
        userId: 'user1',
        userName: 'Sarah Johnson',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        type: 'user'
      },
      {
        id: '2',
        content: 'I can help analyze the address data inconsistencies. Based on my analysis, there are approximately 247 records with formatting issues in the postal code field. Would you like me to generate a detailed report?',
        userId: 'ai',
        userName: 'AI Assistant',
        timestamp: new Date(Date.now() - 55 * 60 * 1000),
        type: 'ai'
      },
      {
        id: '3',
        content: 'That would be great! Can you also check for duplicate entries while you\'re at it?',
        userId: 'user2',
        userName: 'Mike Chen',
        timestamp: new Date(Date.now() - 50 * 60 * 1000),
        type: 'user'
      },
      {
        id: '4',
        content: 'Absolutely! I\'ve identified 23 potential duplicate records based on name and address similarity. I\'ve created a summary report with recommendations for data cleansing.',
        userId: 'ai',
        userName: 'AI Assistant',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        type: 'ai'
      }
    ]
    setMessages(sampleMessages)
  }



  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    const messageData = {
      content: newMessage,
      type: 'user'
    }

    try {
      // Add message to local state immediately
      const tempMessage: Message = {
        id: Date.now().toString(),
        content: newMessage,
        userId: user.id,
        userName: user.displayName || user.email,
        timestamp: new Date(),
        type: 'user'
      }
      setMessages(prev => [...prev, tempMessage])

      // Send to realtime
      await blink.realtime.publish(`chat-${activeChannel}`, 'chat', messageData, {
        userId: user.id,
        metadata: { displayName: user.displayName || user.email }
      })

      setNewMessage('')

      // Simulate AI response for certain keywords
      if (newMessage.toLowerCase().includes('ai') || newMessage.toLowerCase().includes('analyze') || newMessage.toLowerCase().includes('help')) {
        setTimeout(() => {
          setIsAiTyping(true)
          setTimeout(async () => {
            const aiResponse = await generateAIResponse(newMessage)
            const aiMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: aiResponse,
              userId: 'ai',
              userName: 'AI Assistant',
              timestamp: new Date(),
              type: 'ai'
            }
            setMessages(prev => [...prev, aiMessage])
            setIsAiTyping(false)
          }, 2000)
        }, 500)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    try {
      const { text } = await blink.ai.generateText({
        prompt: `You are an AI assistant helping data stewards with KYC and MDM tasks. The user said: "${userMessage}". Provide a helpful, professional response focused on data quality, governance, and stewardship. Keep it concise and actionable.`,
        maxTokens: 150
      })
      return text
    } catch (error) {
      return "I'm here to help with your data stewardship tasks! Could you please rephrase your question?"
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="h-screen flex bg-background">
      {/* Channels Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Channels</h2>
            <Button size="sm" variant="ghost">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-1">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setActiveChannel(channel.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  activeChannel === channel.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm"># {channel.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {channel.memberCount}
                  </Badge>
                </div>
                <p className="text-xs opacity-75 mt-1 truncate">{channel.description}</p>
              </button>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {channels.find(c => c.id === activeChannel)?.memberCount || 0} members online
            </span>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-semibold text-foreground">
                # {channels.find(c => c.id === activeChannel)?.name || 'General Discussion'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {channels.find(c => c.id === activeChannel)?.description}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className={message.type === 'ai' ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                    {message.type === 'ai' ? <Bot className="h-4 w-4" /> : message.userName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm text-foreground">{message.userName}</span>
                    {message.type === 'ai' && (
                      <Badge variant="secondary" className="text-xs">AI</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{message.content}</p>
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
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm text-foreground">AI Assistant</span>
                    <Badge variant="secondary" className="text-xs">AI</Badge>
                  </div>
                  <div className="flex items-center space-x-1 mt-1">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">AI is typing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t border-border bg-card">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Smile className="h-4 w-4" />
                </Button>
              </div>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message # ${channels.find(c => c.id === activeChannel)?.name || 'channel'}`}
                className="min-h-[40px]"
              />
            </div>
            <Button onClick={sendMessage} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}