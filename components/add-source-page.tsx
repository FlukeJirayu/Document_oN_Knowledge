'use client'

import { useState } from 'react'
import { Upload, FileText, Link2, Youtube, FileType, Sparkles, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { Document, SourceType } from '@/app/page'

interface AddSourcePageProps {
  onSourceAdd: (doc: Omit<Document, 'id' | 'uploadedAt'>) => void
}

export function AddSourcePage({ onSourceAdd }: AddSourcePageProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [sourcesUsed] = useState(0)
  const [processingFiles, setProcessingFiles] = useState<string[]>([])
  const [showUrlDialog, setShowUrlDialog] = useState(false)
  const [showTextDialog, setShowTextDialog] = useState(false)
  const [showYoutubeDialog, setShowYoutubeDialog] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [textInput, setTextInput] = useState('')
  const [youtubeInput, setYoutubeInput] = useState('')
  const sourcesLimit = 50

  const processFiles = async (files: File[]) => {
    const fileNames = files.map(f => f.name)
    setProcessingFiles(prev => [...prev, ...fileNames])
    
    // Process files sequentially instead of parallel to avoid ID conflicts
    for (const file of files) {
      try {
        let extractedText = ''
        
        if (file.type === 'application/pdf') {
          extractedText = await extractTextFromPDF(file)
        } else if (file.type === 'text/plain' || file.type === 'text/markdown') {
          extractedText = await file.text()
        }

        onSourceAdd({
          name: file.name,
          type: 'file',
          file: file,
          extractedText: extractedText
        })
        
        // Remove from processing list after successful add
        setProcessingFiles(prev => prev.filter(name => name !== file.name))
        
        // Small delay between files to ensure proper state updates
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error)
        setProcessingFiles(prev => prev.filter(name => name !== file.name))
      }
    }
  }

  const extractTextFromPDF = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Extracted text content from ${file.name}`)
      }, 1000)
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      processFiles(files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFiles(Array.from(files))
    }
    e.target.value = ''
  }

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return
    setIsProcessing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      onSourceAdd({
        name: new URL(urlInput).hostname,
        type: 'url',
        url: urlInput,
        extractedText: `Content from ${urlInput}`
      })
      setUrlInput('')
      setShowUrlDialog(false)
    } catch (error) {
      alert('ไม่สามารถดึงข้อมูลจาก URL นี้ได้')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleYoutubeSubmit = async () => {
    if (!youtubeInput.trim()) return
    setIsProcessing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const videoId = youtubeInput.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1]
      onSourceAdd({
        name: `YouTube: ${videoId || 'Video'}`,
        type: 'youtube',
        url: youtubeInput,
        extractedText: `Transcript from YouTube video`
      })
      setYoutubeInput('')
      setShowYoutubeDialog(false)
    } catch (error) {
      alert('ไม่สามารถดึงข้อมูลจาก YouTube นี้ได้')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTextSubmit = () => {
    if (!textInput.trim()) return
    onSourceAdd({
      name: `ข้อความที่วาง - ${new Date().toLocaleTimeString('th-TH')}`,
      type: 'text',
      text: textInput,
      extractedText: textInput
    })
    setTextInput('')
    setShowTextDialog(false)
  }

  const [isProcessing, setIsProcessing] = useState(false)

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                เพิ่มแหล่งที่มา
              </h1>
              <p className="text-muted-foreground text-base">
                แหล่งที่มาที่ช่วยให้คุณจัดการเอกสารและค้นหาข้อมูลได้อย่างมีประสิทธิภาพ
              </p>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Sparkles className="w-4 h-4 mr-2" />
              สำรวจแหล่งข้อมูล
            </Button>
          </div>
        </div>

        <div
          className={`mb-8 rounded-xl border-2 border-dashed transition-all ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border bg-card hover:border-primary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <label className="flex flex-col items-center justify-center py-20 cursor-pointer">
            <div className="mb-4 rounded-full bg-primary/10 p-6">
              {processingFiles.length > 0 ? (
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              ) : (
                <Upload className="w-10 h-10 text-primary" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {processingFiles.length > 0 ? 'กำลังประมวลผล...' : 'อัปโหลดแหล่งข้อมูล'}
            </h3>
            <p className="text-muted-foreground mb-4 text-center">
              {processingFiles.length > 0 
                ? `กำลังประมวลผล ${processingFiles.length} ไฟล์` 
                : 'ลากและวาง หรือเลือกไฟล์เพื่อออัปโหลด (รองรับหลายไฟล์)'}
            </p>
            {processingFiles.length > 0 && (
              <div className="text-xs text-muted-foreground max-w-md text-center">
                {processingFiles.map((name, i) => (
                  <div key={i} className="truncate">{name}</div>
                ))}
              </div>
            )}
            <input
              type="file"
              className="hidden"
              accept=".pdf,.txt,.md,.mp3,.docx"
              multiple
              onChange={handleFileSelect}
              disabled={processingFiles.length > 0}
            />
          </label>
        </div>

        <p className="text-sm text-muted-foreground text-center mb-12">
          ประเภทไฟล์ที่รองรับ: PDF, .txt, Markdown, เสียง (เช่น mp3), .docx | รองรับการอัปโหลดหลายไฟล์พร้อมกัน
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-blue-50 dark:bg-blue-950 p-4">
                <svg className="w-8 h-8" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-3">Google Workspace</h3>
              <Button variant="outline" className="w-full" disabled>
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"
                  />
                </svg>
                เร็วๆ นี้
              </Button>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <Link2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-3">ลิงค์</h3>
              <div className="flex flex-col gap-2 w-full">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowUrlDialog(true)}
                >
                  <Link2 className="w-4 h-4 mr-2" />
                  เว็บไซต์
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowYoutubeDialog(true)}
                >
                  <Youtube className="w-4 h-4 mr-2" />
                  YouTube
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-accent/10 p-4">
                <FileText className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-3">วางข้อความ</h3>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowTextDialog(true)}
              >
                <FileType className="w-4 h-4 mr-2" />
                ข้อความที่คัดลอก
              </Button>
            </div>
          </Card>
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              ขีดจำกัดแหล่งที่มา
            </span>
          </div>
          <div className="flex items-center gap-4 flex-1 max-w-xs ml-8">
            <Progress value={(sourcesUsed / sourcesLimit) * 100} className="flex-1" />
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              {sourcesUsed} / {sourcesLimit}
            </span>
          </div>
        </div>
      </div>

      {showUrlDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">เพิ่มจาก URL</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowUrlDialog(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="url-input">URL เว็บไซต์</Label>
                <Input
                  id="url-input"
                  type="url"
                  placeholder="https://example.com"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUrlSubmit()
                  }}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowUrlDialog(false)}>
                  ยกเลิก
                </Button>
                <Button onClick={handleUrlSubmit} disabled={!urlInput.trim() || isProcessing}>
                  {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  เพิ่ม
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {showYoutubeDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">เพิ่มจาก YouTube</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowYoutubeDialog(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="youtube-input">URL วิดีโอ YouTube</Label>
                <Input
                  id="youtube-input"
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={youtubeInput}
                  onChange={(e) => setYoutubeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleYoutubeSubmit()
                  }}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowYoutubeDialog(false)}>
                  ยกเลิก
                </Button>
                <Button onClick={handleYoutubeSubmit} disabled={!youtubeInput.trim() || isProcessing}>
                  {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  เพิ่ม
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {showTextDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">วางข้อความ</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowTextDialog(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="text-input">ข้อความ</Label>
                <Textarea
                  id="text-input"
                  placeholder="วางข้อความที่คุณต้องการเพิ่มเป็นแหล่งข้อมูล..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  rows={6}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowTextDialog(false)}>
                  ยกเลิก
                </Button>
                <Button onClick={handleTextSubmit} disabled={!textInput.trim()}>
                  เพิ่ม
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
