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

  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id))
    
    // If deleting current document, go back to add page or select another doc
    if (selectedDocId === id) {
      const remainingDocs = documents.filter(doc => doc.id !== id)
      if (remainingDocs.length > 0) {
        setSelectedDocId(remainingDocs[0].id)
      } else {
        setSelectedDocId(null)
      }
    }
  }

  const handleRenameDocument = (id: string, newName: string) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === id ? { ...doc, name: newName } : doc
      )
    )
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
          onDeleteDocument={handleDeleteDocument}
          onRenameDocument={handleRenameDocument}
        />
      ) : (
        <AddSourcePage onSourceAdd={handleSourceAdd} />
      )}
    </div>
  )
}
