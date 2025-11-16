'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Plus, Search, Send, ZoomIn, ZoomOut, FileText, Eye, EyeOff, Loader2, Sparkles, Link2, Youtube, FileType, GripVertical, MessageSquare, X, MoreVertical, Trash2, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Document } from '@/app/page'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: string[]
}

interface MainInterfaceProps {
  document: Document
  allDocuments: Document[]
  onBack: () => void
  onSelectDocument: (id: string) => void
  onDeleteDocument?: (id: string) => void
  onRenameDocument?: (id: string, newName: string) => void
}

export function MainInterface({ document, allDocuments, onBack, onSelectDocument, onDeleteDocument, onRenameDocument }: MainInterfaceProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(100)
  const [message, setMessage] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [pdfUrl, setPdfUrl] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatWidth, setChatWidth] = useState(400)
  const [isResizing, setIsResizing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const resizeRef = useRef<HTMLDivElement>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const totalPages = 15
  const [activeMenuDocId, setActiveMenuDocId] = useState<string | null>(null)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [renamingDocId, setRenamingDocId] = useState<string | null>(null)
  const [newDocumentName, setNewDocumentName] = useState('')

  useEffect(() => {
    if (document.type === 'file' && document.file?.type === 'application/pdf') {
      setPdfLoading(true)
      
      const url = URL.createObjectURL(document.file)
      setPdfUrl(url)
      
      setTimeout(() => {
        setPdfLoading(false)
      }, 1500)
      
      return () => {
        URL.revokeObjectURL(url)
      }
    } else {
      setPdfUrl('')
      setPdfLoading(false)
    }
  }, [document])

  useEffect(() => {
    setCurrentPage(1)
  }, [document.id])

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [chatMessages])

  useEffect(() => {
    console.log('[v0] Document changed to:', document.id, document.name)
  }, [document.id, document.name])

  const handleSendMessage = async () => {
    if (!message.trim() || isGenerating) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    setMessage('')
    setIsGenerating(true)
    setChatOpen(true)

    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAIResponse(userMessage.content, document),
        timestamp: new Date(),
        sources: [document.name]
      }
      setChatMessages(prev => [...prev, aiMessage])
      setIsGenerating(false)
    }, 1500)
  }

  const generateAIResponse = (question: string, doc: Document): string => {
    const responses = [
      `จากการวิเคราะห์เอกสาร "${doc.name}" ฉันพบว่า ${question.toLowerCase().includes('อะไร') ? 'ข้อมูลที่เกี่ยวข้องคือ' : 'คำตอบคือ'} ${doc.extractedText?.substring(0, 100) || 'ข้อมูลที่น่าสนใจ'}...`,
      `ตามข้อมูลในเอกสาร "${doc.name}" ${question.toLowerCase().includes('อย่างไร') ? 'กระบวนการทำงาน' : 'รายละเอียด'}สามารถอธิบายได้ว่า...`,
      `เอกสาร "${doc.name}" ระบุไว้ว่า ${question.toLowerCase().includes('ที่ไหน') ? 'สถานที่' : 'ข้อมูล'}ที่คุณถามนั้น...`
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'เมื่อสักครู่'
    if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} วันที่แล้ว`
  }

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'url': return Link2
      case 'youtube': return Youtube
      case 'text': return FileType
      default: return FileText
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      const container = resizeRef.current?.parentElement
      if (!container) return
      
      const containerRect = container.getBoundingClientRect()
      const newWidth = containerRect.right - e.clientX
      
      if (newWidth >= 300 && newWidth <= containerRect.width - 400) {
        setChatWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      window.document.addEventListener('mousemove', handleMouseMove)
      window.document.addEventListener('mouseup', handleMouseUp)
      window.document.body.style.cursor = 'ew-resize'
      window.document.body.style.userSelect = 'none'
    }

    return () => {
      window.document.removeEventListener('mousemove', handleMouseMove)
      window.document.removeEventListener('mouseup', handleMouseUp)
      window.document.body.style.cursor = ''
      window.document.body.style.userSelect = ''
    }
  }, [isResizing])

  const filteredDocuments = searchQuery.trim() 
    ? allDocuments.filter(doc => 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.extractedText?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allDocuments

  const handleDocumentClick = (docId: string) => {
    console.log('[v0] Document clicked:', docId)
    console.log('[v0] Current document:', document.id)
    console.log('[v0] Calling onSelectDocument with:', docId)
    onSelectDocument(docId)
  }

  const handleDeleteDocument = (docId: string) => {
    if (onDeleteDocument) {
      onDeleteDocument(docId)
    }
    setActiveMenuDocId(null)
  }

  const handleOpenRenameDialog = (docId: string, currentName: string) => {
    setRenamingDocId(docId)
    setNewDocumentName(currentName)
    setRenameDialogOpen(true)
    setActiveMenuDocId(null)
  }

  const handleConfirmRename = () => {
    if (renamingDocId && newDocumentName.trim() && onRenameDocument) {
      onRenameDocument(renamingDocId, newDocumentName.trim())
    }
    setRenameDialogOpen(false)
    setRenamingDocId(null)
    setNewDocumentName('')
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {sidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed lg:static inset-y-0 left-0 w-80 z-50 lg:z-auto border-r border-border bg-card flex flex-col transform transition-transform duration-300 lg:transform-none">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">แหล่งข้อมูล</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                >
                  <EyeOff className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={onBack}>
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่ม
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsSearching(!isSearching)}
                >
                  <Search className="w-4 h-4 mr-2" />
                  ค้นหา
                </Button>
              </div>

              {isSearching && (
                <div className="mt-3">
                  <Input
                    placeholder="ค้นหาเอกสาร..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
              )}
            </div>

            <ScrollArea className="flex-1 p-4">
              {isSearching && searchQuery && (
                <div className="mb-3 px-1">
                  <p className="text-xs text-muted-foreground">
                    พบ {filteredDocuments.length} รายการ
                  </p>
                </div>
              )}
              
              <div className="space-y-2 overflow-y-auto px-1" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                {filteredDocuments.length > 0 ? (
                  filteredDocuments.map((doc) => {
                    const Icon = getSourceIcon(doc.type)
                    const isSelected = doc.id === document.id
                    return (
                      <Card 
                        key={doc.id}
                        className={`p-3 transition-all duration-200 cursor-pointer hover:shadow-md active:scale-[0.98] ${
                          isSelected
                            ? 'bg-primary/5 border-primary hover:bg-primary/10 shadow-sm' 
                            : 'hover:bg-accent/5 border-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-2 w-full">
                          <div 
                            className="flex-1 flex items-start gap-2.5 min-w-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              e.preventDefault()
                              handleDocumentClick(doc.id)
                            }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                e.stopPropagation()
                                handleDocumentClick(doc.id)
                              }
                            }}
                          >
                            <div className={`rounded-lg p-2 shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-primary/15' 
                                : 'bg-primary/10'
                            }`}>
                              <Icon className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0 overflow-hidden">
                              <h3 
                                className="font-medium text-sm text-foreground mb-0.5 leading-tight line-clamp-2" 
                                title={doc.name}
                              >
                                {doc.name}
                              </h3>
                              <p className="text-xs text-muted-foreground leading-tight truncate">
                                {formatRelativeTime(doc.uploadedAt)}
                              </p>
                            </div>
                          </div>
                          
                          <Popover 
                            open={activeMenuDocId === doc.id}
                            onOpenChange={(open) => setActiveMenuDocId(open ? doc.id : null)}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0 hover:bg-accent"
                                onClick={(e) => {
                                  e.stopPropagation()
                                }}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-56 p-2" align="end">
                              <div className="space-y-1">
                                <Button
                                  variant="ghost"
                                  className="w-full justify-start text-sm hover:bg-accent"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleOpenRenameDialog(doc.id, doc.name)
                                  }}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  เปลี่ยนชื่อแหล่งข้อมูล
                                </Button>
                                <Button
                                  variant="ghost"
                                  className="w-full justify-start text-sm text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteDocument(doc.id)
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  ลบแหล่งข้อมูลออก
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </Card>
                    )
                  })
                ) : (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      ไม่พบเอกสารที่ตรงกับการค้นหา
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-16 border-b border-border bg-card px-4 lg:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => setSidebarOpen(true)}
              >
                <Eye className="w-4 h-4" />
              </Button>
            )}
            <h1 className="text-base lg:text-lg font-semibold text-foreground truncate mb-0.5 leading-tight">
              {document.name}
            </h1>
          </div>
          
          {chatMessages.length > 0 && (
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden shrink-0 ml-2"
              onClick={() => setChatOpen(!chatOpen)}
            >
              {chatOpen ? <X className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-hidden flex relative">
          <div 
            className={`flex flex-col bg-muted/30 transition-all duration-300 w-full lg:w-auto ${
              chatOpen && chatMessages.length > 0 ? 'hidden lg:flex' : 'flex'
            }`}
            style={{ 
              width: chatMessages.length > 0 && window.innerWidth >= 1024 ? `calc(100% - ${chatWidth}px)` : '100%' 
            }}
          >
            {document.type === 'file' && document.file?.type === 'application/pdf' && (
              <div className="bg-card border-b border-border p-3 flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium text-foreground min-w-[100px] text-center">
                    หน้า {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <div className="h-6 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setZoom(Math.max(50, zoom - 10))}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium text-foreground min-w-[60px] text-center">
                    {zoom}%
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setZoom(Math.min(200, zoom + 10))}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            <ScrollArea className="flex-1">
              <div className="flex items-center justify-center p-6">
                {document.type === 'file' && document.file?.type === 'application/pdf' ? (
                  <div className="w-full max-w-5xl">
                    {pdfLoading ? (
                      <div className="bg-white shadow-2xl rounded-lg p-12 flex items-center justify-center" style={{ minHeight: '800px' }}>
                        <div className="text-center">
                          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                          <p className="text-muted-foreground">กำลังโหลด PDF...</p>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="bg-white shadow-2xl rounded-lg overflow-hidden"
                        style={{ 
                          width: '100%',
                          height: '900px'
                        }}
                      >
                        <iframe
                          src={`${pdfUrl}#page=${currentPage}&zoom=${zoom}`}
                          className="w-full h-full border-0"
                          title={document.name}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className="bg-white shadow-2xl rounded-lg overflow-hidden transition-all"
                    style={{ width: `${(zoom / 100) * 800}px` }}
                  >
                    <div className="aspect-[8.5/11] flex items-center justify-center bg-white p-12">
                      <div className="text-center">
                        <FileText className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                          {document.name}
                        </h2>
                        <p className="text-gray-500 mb-6">
                          {document.type === 'url' && 'เนื้อหาจาก URL'}
                          {document.type === 'text' && 'ข้อความที่วาง'}
                          {document.type === 'youtube' && 'YouTube Transcript'}
                        </p>
                        <div className="space-y-3 text-left max-w-md mx-auto">
                          {document.extractedText && (
                            <p className="text-sm text-gray-600 line-clamp-6">
                              {document.extractedText}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {chatMessages.length > 0 && (
            <>
              <div
                ref={resizeRef}
                onMouseDown={handleMouseDown}
                className="hidden lg:block w-2 bg-border hover:bg-primary/20 cursor-ew-resize flex items-center justify-center group transition-colors relative z-10"
              >
                <div className="h-12 w-1 bg-muted-foreground/30 group-hover:bg-primary/50 rounded-full transition-colors" />
              </div>

              <div 
                className={`
                  fixed lg:static top-0 bottom-0 right-0 z-50 lg:z-auto
                  bg-card border-l border-border overflow-hidden flex flex-col
                  transition-transform duration-300 ease-in-out
                  ${chatOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
                `}
                style={{ 
                  width: window.innerWidth >= 1024 ? `${chatWidth}px` : '100%'
                }}
              >
                <div className="px-4 py-3 border-b border-border bg-muted/50 flex items-center gap-2 shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">การสนทนา</h3>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {chatMessages.length} ข้อความ
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden h-8 w-8 -mr-2"
                    onClick={() => setChatOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div 
                  ref={chatScrollRef}
                  className="flex-1 p-4 overflow-y-auto"
                >
                  <div className="space-y-4">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3 lg:px-4 py-2.5 lg:py-3 ${
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted border border-border'
                          }`}
                        >
                          {msg.role === 'assistant' && (
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-primary" />
                              <span className="text-xs font-semibold text-primary">AI Assistant</span>
                            </div>
                          )}
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          {msg.sources && (
                            <div className="mt-2 pt-2 border-t border-border/50">
                              <p className="text-xs text-muted-foreground">
                                แหล่งอ้างอิง: {msg.sources.join(', ')}
                              </p>
                            </div>
                          )}
                          <p className={`text-xs mt-1.5 lg:mt-2 ${
                            msg.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}>
                            {msg.timestamp.toLocaleTimeString('th-TH', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isGenerating && (
                      <div className="flex justify-start">
                        <div className="bg-muted border border-border rounded-2xl px-3 lg:px-4 py-2.5 lg:py-3">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 lg:w-5 h-4 lg:h-5 animate-spin text-primary" />
                            <span className="text-sm text-muted-foreground">กำลังสร้างคำตอบ...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-border bg-card p-3 lg:p-4 shrink-0">
                  <div className="flex gap-2 lg:gap-3">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="ถามคำถาม..."
                      className="h-10 text-sm flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      disabled={isGenerating}
                    />
                    <Button
                      size="icon"
                      className="h-10 w-10 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={handleSendMessage}
                      disabled={!message.trim() || isGenerating}
                    >
                      {isGenerating ? (
                        <Loader2 className="w-4 lg:w-5 h-4 lg:h-5 animate-spin" />
                      ) : (
                        <Send className="w-4 lg:w-5 h-4 lg:h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {chatMessages.length === 0 && (
          <div className="border-t border-border bg-card p-3 lg:p-4 shrink-0">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="flex-1 relative">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="ถามคำถามเกี่ยวกับเอกสารนี้..."
                    className="h-10 lg:h-12 text-sm lg:text-base"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    disabled={isGenerating}
                  />
                </div>
                <Button
                  size="icon"
                  className="h-10 w-10 lg:h-12 lg:w-12 bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 lg:w-5 h-4 lg:h-5 animate-spin" />
                  ) : (
                    <Send className="w-4 lg:w-5 h-4 lg:h-5" />
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2 lg:mt-3 px-1">
                <p className="text-xs lg:text-sm text-muted-foreground">
                  แหล่งข้อมูล {allDocuments.length} รายการ
                </p>
                <p className="text-xs text-muted-foreground hidden lg:block">
                  กด Enter เพื่อส่ง
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เปลี่ยนชื่อแหล่งข้อมูล</DialogTitle>
            <DialogDescription>
              กรุณากรอกชื่อใหม่สำหรับเอกสารนี้
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newDocumentName}
              onChange={(e) => setNewDocumentName(e.target.value)}
              placeholder="ชื่อเอกสาร"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleConfirmRename()
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button 
              onClick={handleConfirmRename}
              disabled={!newDocumentName.trim()}
            >
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
