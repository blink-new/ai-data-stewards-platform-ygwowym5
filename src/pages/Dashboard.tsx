import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Progress } from '../components/ui/progress'
import { 
  Database, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  MessageSquare,
  BarChart3,
  Clock,
  Activity
} from 'lucide-react'
import { blink } from '../blink/client'

interface DashboardProps {
  user: any
}

export function Dashboard({ user }: DashboardProps) {
  const [stats, setStats] = useState({
    totalRecords: 0,
    qualityScore: 0,
    activeIssues: 0,
    resolvedToday: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Simulate loading dashboard data
      setStats({
        totalRecords: 1247832,
        qualityScore: 94,
        activeIssues: 23,
        resolvedToday: 15
      })

      setRecentActivity([
        {
          id: 1,
          type: 'data_quality',
          message: 'Data quality check completed for Customer KYC dataset',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          status: 'success'
        },
        {
          id: 2,
          type: 'collaboration',
          message: 'Sarah Johnson commented on MDM issue #1247',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          status: 'info'
        },
        {
          id: 3,
          type: 'ai_insight',
          message: 'AI detected potential duplicate records in Account Master',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          status: 'warning'
        },
        {
          id: 4,
          type: 'resolution',
          message: 'Data lineage issue resolved for Transaction dataset',
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          status: 'success'
        }
      ])
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'data_quality': return <BarChart3 className="h-4 w-4" />
      case 'collaboration': return <MessageSquare className="h-4 w-4" />
      case 'ai_insight': return <Activity className="h-4 w-4" />
      case 'resolution': return <CheckCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'error': return 'text-red-600'
      default: return 'text-blue-600'
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
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.displayName || 'Data Steward'}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            System Healthy
          </Badge>
          <Button variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecords.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Quality Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.qualityScore}%</div>
            <Progress value={stats.qualityScore} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Excellent quality maintained
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.activeIssues}</div>
            <p className="text-xs text-muted-foreground">
              -5 from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolvedToday}</div>
            <p className="text-xs text-muted-foreground">
              Great team effort!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your data stewardship activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity: any) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                <div className={`mt-0.5 ${getStatusColor(activity.status)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.timestamp.toLocaleTimeString()} • {activity.timestamp.toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Start AI Chat Session
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Run Data Quality Check
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Database className="h-4 w-4 mr-2" />
              Browse Data Catalog
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Collaborate with Team
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Data Quality Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Data Quality Overview</CardTitle>
          <CardDescription>Current status of your data quality metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completeness</span>
                <span className="text-sm text-muted-foreground">96%</span>
              </div>
              <Progress value={96} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Accuracy</span>
                <span className="text-sm text-muted-foreground">92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Consistency</span>
                <span className="text-sm text-muted-foreground">98%</span>
              </div>
              <Progress value={98} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}