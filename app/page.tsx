'use client'

import { useState } from 'react'
import { AddSourcePage } from '@/components/add-source-page'
import { MainInterface } from '@/components/main-interface'

export type SourceType = 'file' | 'url' | 'text' | 'youtube'

export interface Document {
  id: string
  name: string
  type: SourceType
  file?: File
  url?: string
  text?: string
  extractedText?: string
  uploadedAt: Date
}

export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)

  const handleSourceAdd = (doc: Omit<Document, 'id' | 'uploadedAt'>) => {
    const newDoc: Document = {
      ...doc,
      id: Date.now().toString(),
      uploadedAt: new Date()
    }
    setDocuments(prev => [...prev, newDoc])
    setSelectedDocId(newDoc.id)
  }

  const selectedDoc = documents.find(doc => doc.id === selectedDocId)

  return (
    <div className="min-h-screen">
      {selectedDoc ? (
        <MainInterface 
          document={selectedDoc}
          allDocuments={documents}
          onBack={() => setSelectedDocId(null)}
          onSelectDocument={(id) => setSelectedDocId(id)}
        />
      ) : (
        <AddSourcePage onSourceAdd={handleSourceAdd} />
      )}
    </div>
  )
}
