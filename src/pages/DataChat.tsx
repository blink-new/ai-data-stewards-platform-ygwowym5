import { useState } from 'react'
import { DataSourceManager } from '../components/DataSourceManager'
import { DataChatInterface } from '../components/DataChatInterface'

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

interface DataChatProps {
  user: any
}

export function DataChat({ user }: DataChatProps) {
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null)

  return (
    <div className="h-screen flex bg-background">
      {/* Data Sources Sidebar */}
      <div className="w-96 border-r border-border">
        <DataSourceManager
          onDataSourceSelect={setSelectedDataSource}
          selectedDataSource={selectedDataSource}
        />
      </div>

      {/* Chat Interface */}
      <div className="flex-1">
        <DataChatInterface
          dataSource={selectedDataSource}
          user={user}
        />
      </div>
    </div>
  )
}