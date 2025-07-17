import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { 
  Upload, 
  Database, 
  FileText, 
  Table, 
  Trash2, 
  Eye,
  Plus,
  Search,
  Filter
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

interface DataSourceManagerProps {
  onDataSourceSelect?: (dataSource: DataSource) => void
  selectedDataSource?: DataSource | null
}

export function DataSourceManager({ onDataSourceSelect, selectedDataSource }: DataSourceManagerProps) {
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showUploadDialog, setShowUploadDialog] = useState(false)

  useEffect(() => {
    loadDataSources()
  }, [])

  const loadDataSources = async () => {
    try {
      const user = await blink.auth.me()
      const storageKey = `dataSources_${user.id}`
      const stored = localStorage.getItem(storageKey)
      const sources = stored ? JSON.parse(stored).map((ds: any) => ({
        ...ds,
        uploadedAt: new Date(ds.uploadedAt)
      })) : []
      setDataSources(sources)
    } catch (error) {
      console.error('Failed to load data sources:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveDataSources = async (sources: DataSource[]) => {
    try {
      const user = await blink.auth.me()
      const storageKey = `dataSources_${user.id}`
      localStorage.setItem(storageKey, JSON.stringify(sources))
    } catch (error) {
      console.error('Failed to save data sources:', error)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const user = await blink.auth.me()
      
      // Upload file to storage
      const { publicUrl } = await blink.storage.upload(
        file,
        `data-sources/${user.id}/${file.name}`,
        { upsert: true }
      )

      // Extract text content from file
      const extractedText = await blink.data.extractFromBlob(file, {
        chunking: true,
        chunkSize: 2000
      })

      // Determine file type
      const fileType = file.name.split('.').pop()?.toLowerCase()
      let dataType: 'csv' | 'json' | 'excel' | 'database' = 'csv'
      
      if (fileType === 'json') dataType = 'json'
      else if (fileType === 'xlsx' || fileType === 'xls') dataType = 'excel'
      else if (fileType === 'csv') dataType = 'csv'

      // Analyze the data structure using AI
      const analysisResult = await blink.ai.generateObject({
        prompt: `Analyze this data file content and extract key information:
        
        File: ${file.name}
        Content preview: ${Array.isArray(extractedText) ? extractedText.slice(0, 3).join('\n') : extractedText.substring(0, 1000)}
        
        Please provide:
        1. Estimated record count
        2. Column names (if structured data)
        3. Brief description of the data
        4. Data quality assessment`,
        schema: {
          type: 'object',
          properties: {
            recordCount: { type: 'number' },
            columns: { 
              type: 'array', 
              items: { type: 'string' } 
            },
            description: { type: 'string' },
            dataQuality: { type: 'string' }
          },
          required: ['recordCount', 'columns', 'description']
        }
      })

      // Create new data source
      const newDataSource: DataSource = {
        id: `ds_${Date.now()}`,
        name: file.name,
        type: dataType,
        size: file.size,
        uploadedAt: new Date(),
        status: 'ready',
        recordCount: analysisResult.object.recordCount,
        columns: analysisResult.object.columns,
        description: analysisResult.object.description,
        fileUrl: publicUrl,
        userId: user.id
      }

      const updatedSources = [newDataSource, ...dataSources]
      setDataSources(updatedSources)
      await saveDataSources(updatedSources)
      setShowUploadDialog(false)
      
      // Auto-select the newly uploaded data source
      if (onDataSourceSelect) {
        onDataSourceSelect(newDataSource)
      }
    } catch (error) {
      console.error('Failed to upload data source:', error)
    } finally {
      setUploading(false)
    }
  }

  const deleteDataSource = async (id: string) => {
    try {
      const updatedSources = dataSources.filter(ds => ds.id !== id)
      setDataSources(updatedSources)
      await saveDataSources(updatedSources)
    } catch (error) {
      console.error('Failed to delete data source:', error)
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'csv': return <Table className="h-4 w-4" />
      case 'json': return <FileText className="h-4 w-4" />
      case 'excel': return <Table className="h-4 w-4" />
      case 'database': return <Database className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredDataSources = dataSources.filter(ds =>
    ds.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ds.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Data Sources</span>
          </CardTitle>
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Source
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Data Source</DialogTitle>
                <DialogDescription>
                  Upload a CSV, JSON, or Excel file to analyze with AI
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file-upload">Select File</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv,.json,.xlsx,.xls"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Supported formats: CSV, JSON, Excel (.xlsx, .xls)
                  </p>
                </div>
                {uploading && (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-sm">Processing file...</span>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search data sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="p-4 space-y-3">
            {filteredDataSources.length === 0 ? (
              <div className="text-center py-8">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Data Sources</h3>
                <p className="text-muted-foreground mb-4">
                  Upload your first data file to start analyzing with AI
                </p>
                <Button onClick={() => setShowUploadDialog(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Data
                </Button>
              </div>
            ) : (
              filteredDataSources.map((dataSource) => (
                <div
                  key={dataSource.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    selectedDataSource?.id === dataSource.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => onDataSourceSelect?.(dataSource)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="text-muted-foreground mt-1">
                        {getFileIcon(dataSource.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-foreground truncate">
                            {dataSource.name}
                          </h4>
                          <Badge className={getStatusColor(dataSource.status)}>
                            {dataSource.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {dataSource.description || 'No description available'}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>{formatFileSize(dataSource.size)}</span>
                          {dataSource.recordCount && (
                            <span>{dataSource.recordCount.toLocaleString()} records</span>
                          )}
                          <span>{dataSource.uploadedAt.toLocaleDateString()}</span>
                        </div>
                        {dataSource.columns && dataSource.columns.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {dataSource.columns.slice(0, 3).map((column, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {column}
                              </Badge>
                            ))}
                            {dataSource.columns.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{dataSource.columns.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm" onClick={(e) => {
                        e.stopPropagation()
                        window.open(dataSource.fileUrl, '_blank')
                      }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={(e) => {
                        e.stopPropagation()
                        deleteDataSource(dataSource.id)
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}