import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Progress } from '../components/ui/progress'
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Database,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'
import { blink } from '../blink/client'

interface DataAnalysisProps {
  user: any
}

interface DataQualityMetric {
  id: string
  name: string
  score: number
  trend: 'up' | 'down' | 'stable'
  issues: number
  lastChecked: Date
}

interface DataSource {
  id: string
  name: string
  type: string
  status: 'healthy' | 'warning' | 'error'
  recordCount: number
  lastSync: Date
}

export function DataAnalysis({ user }: DataAnalysisProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [qualityMetrics, setQualityMetrics] = useState<DataQualityMetric[]>([])
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [loading, setLoading] = useState(true)
  const [analysisResults, setAnalysisResults] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    loadAnalysisData()
  }, [])

  const loadAnalysisData = async () => {
    try {
      // Simulate loading data quality metrics
      setQualityMetrics([
        {
          id: '1',
          name: 'Customer Data Completeness',
          score: 94,
          trend: 'up',
          issues: 12,
          lastChecked: new Date(Date.now() - 30 * 60 * 1000)
        },
        {
          id: '2',
          name: 'Address Data Accuracy',
          score: 87,
          trend: 'down',
          issues: 45,
          lastChecked: new Date(Date.now() - 45 * 60 * 1000)
        },
        {
          id: '3',
          name: 'KYC Document Validity',
          score: 98,
          trend: 'stable',
          issues: 3,
          lastChecked: new Date(Date.now() - 15 * 60 * 1000)
        },
        {
          id: '4',
          name: 'Transaction Data Consistency',
          score: 91,
          trend: 'up',
          issues: 23,
          lastChecked: new Date(Date.now() - 60 * 60 * 1000)
        }
      ])

      setDataSources([
        {
          id: '1',
          name: 'Customer Master Database',
          type: 'PostgreSQL',
          status: 'healthy',
          recordCount: 1247832,
          lastSync: new Date(Date.now() - 10 * 60 * 1000)
        },
        {
          id: '2',
          name: 'KYC Documents Store',
          type: 'MongoDB',
          status: 'warning',
          recordCount: 89456,
          lastSync: new Date(Date.now() - 25 * 60 * 1000)
        },
        {
          id: '3',
          name: 'Transaction History',
          type: 'MySQL',
          status: 'healthy',
          recordCount: 5678901,
          lastSync: new Date(Date.now() - 5 * 60 * 1000)
        },
        {
          id: '4',
          name: 'External Credit Bureau',
          type: 'API',
          status: 'error',
          recordCount: 234567,
          lastSync: new Date(Date.now() - 120 * 60 * 1000)
        }
      ])
    } catch (error) {
      console.error('Failed to load analysis data:', error)
    } finally {
      setLoading(false)
    }
  }

  const runAIAnalysis = async () => {
    if (!searchQuery.trim()) return

    setIsAnalyzing(true)
    try {
      const { text } = await blink.ai.generateText({
        prompt: `As a data stewardship AI assistant, analyze the following data quality concern: "${searchQuery}". Provide insights on:
        1. Potential root causes
        2. Impact on data governance
        3. Recommended remediation steps
        4. Prevention strategies
        
        Focus on KYC and MDM best practices. Be specific and actionable.`,
        maxTokens: 300
      })
      setAnalysisResults(text)
    } catch (error) {
      setAnalysisResults('Unable to generate analysis at this time. Please try again later.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-600" />
      case 'down': return <TrendingDown className="h-3 w-3 text-red-600" />
      default: return <Activity className="h-3 w-3 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Data Analysis</h1>
          <p className="text-muted-foreground">Monitor data quality and run AI-powered analysis</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={loadAnalysisData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* AI Analysis Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>AI-Powered Analysis</span>
          </CardTitle>
          <CardDescription>
            Ask AI to analyze data quality issues and get actionable insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Describe a data quality issue or ask for analysis..."
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && runAIAnalysis()}
            />
            <Button onClick={runAIAnalysis} disabled={isAnalyzing || !searchQuery.trim()}>
              {isAnalyzing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {analysisResults && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">AI Analysis Results:</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{analysisResults}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="quality" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quality">Data Quality</TabsTrigger>
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="quality" className="space-y-6">
          {/* Quality Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {qualityMetrics.map((metric) => (
              <Card key={metric.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                    {getTrendIcon(metric.trend)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{metric.score}%</span>
                      <Badge variant={metric.score >= 95 ? 'default' : metric.score >= 85 ? 'secondary' : 'destructive'}>
                        {metric.score >= 95 ? 'Excellent' : metric.score >= 85 ? 'Good' : 'Needs Attention'}
                      </Badge>
                    </div>
                    <Progress value={metric.score} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{metric.issues} issues</span>
                      <span>{metric.lastChecked.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Quality Report */}
          <Card>
            <CardHeader>
              <CardTitle>Quality Issues Summary</CardTitle>
              <CardDescription>Recent data quality issues requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-red-50 border border-red-200">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-red-900">Critical: Missing KYC Documents</h4>
                    <p className="text-sm text-red-700">247 customer records missing required identification documents</p>
                    <p className="text-xs text-red-600 mt-1">Detected 2 hours ago • Affects compliance reporting</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-yellow-900">Warning: Address Format Inconsistency</h4>
                    <p className="text-sm text-yellow-700">1,234 records with non-standardized address formats</p>
                    <p className="text-xs text-yellow-600 mt-1">Detected 4 hours ago • May impact mail delivery</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900">Info: Duplicate Detection Complete</h4>
                    <p className="text-sm text-blue-700">Found 23 potential duplicate customer records</p>
                    <p className="text-xs text-blue-600 mt-1">Completed 1 hour ago • Ready for review</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dataSources.map((source) => (
              <Card key={source.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{source.name}</CardTitle>
                    {getStatusIcon(source.status)}
                  </div>
                  <CardDescription>{source.type}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Records</span>
                    <span className="font-medium">{source.recordCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last Sync</span>
                    <span className="font-medium">{source.lastSync.toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant={source.status === 'healthy' ? 'default' : source.status === 'warning' ? 'secondary' : 'destructive'}>
                      {source.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Quality Trends</span>
                </CardTitle>
                <CardDescription>Data quality performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Overall Quality Score</span>
                    <span className="font-medium">92.5% ↑ 2.1%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Issues Resolved This Week</span>
                    <span className="font-medium">47 ↑ 12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">New Issues Detected</span>
                    <span className="font-medium">23 ↓ 8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Resolution Time</span>
                    <span className="font-medium">2.3 hours ↓ 0.5h</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5" />
                  <span>Issue Categories</span>
                </CardTitle>
                <CardDescription>Breakdown of data quality issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Missing Data</span>
                    </div>
                    <span className="font-medium">35%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Format Issues</span>
                    </div>
                    <span className="font-medium">28%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Duplicates</span>
                    </div>
                    <span className="font-medium">22%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Validation Errors</span>
                    </div>
                    <span className="font-medium">15%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}