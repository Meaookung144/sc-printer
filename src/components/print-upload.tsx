'use client'

import { useState, useRef } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import * as Select from '@radix-ui/react-select'
import * as Switch from '@radix-ui/react-switch'
import * as Slider from '@radix-ui/react-slider'

interface Printer {
  id: string
  name: string
  isOnline: boolean
  driverName: string | null
}

interface PrintUploadProps {
  printers: Printer[]
  onClose: () => void
}

interface PrintSettings {
  copies: number
  isDraft: boolean
  isColor: boolean
  orientation: 'portrait' | 'landscape'
  pages: string
  printerId: string
}

export function PrintUpload({ printers, onClose }: PrintUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [settings, setSettings] = useState<PrintSettings>({
    copies: 1,
    isDraft: false,
    isColor: false,
    orientation: 'portrait',
    pages: 'all',
    printerId: '',
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
      if (!allowedTypes.includes(selectedFile.type)) {
        alert('Please select a PDF, Word document, or text file.')
        return
      }
      setFile(selectedFile)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const droppedFile = event.dataTransfer.files[0]
    if (droppedFile) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
      if (!allowedTypes.includes(droppedFile.type)) {
        alert('Please select a PDF, Word document, or text file.')
        return
      }
      setFile(droppedFile)
    }
  }

  const handleUpload = async () => {
    if (!file || !settings.printerId) return

    setIsUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('settings', JSON.stringify(settings))

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        setUploadProgress(100)
        setTimeout(() => {
          onClose()
          window.location.reload()
        }, 1000)
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handlePrint = async () => {
    if (!file || !settings.printerId) return

    await handleUpload()

    try {
      const response = await fetch('/api/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          settings,
        }),
      })

      if (!response.ok) {
        throw new Error('Print failed')
      }
    } catch (error) {
      console.error('Print error:', error)
      alert('Print failed. Please try again.')
    }
  }

  const availablePrinters = printers.filter(p => p.isOnline)

  return (
    <Dialog.Root open onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white dark:bg-gray-800 p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg">
          <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
            Print Document
          </Dialog.Title>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Document
                </label>
                <div
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-red-500 transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {file ? (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-gray-600 dark:text-gray-400">
                        <svg className="mx-auto h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Drop file here or click to browse
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        PDF, Word, or Text files only
                      </div>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                />
              </div>

              {file && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    File preview not available for this format
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Printer
                </label>
                <Select.Root value={settings.printerId} onValueChange={(value) => setSettings(s => ({ ...s, printerId: value }))}>
                  <Select.Trigger className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <Select.Value placeholder="Select printer" />
                    <Select.Icon />
                  </Select.Trigger>
                  <Select.Content className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                    {availablePrinters.map((printer) => (
                      <Select.Item key={printer.id} value={printer.id} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                        <Select.ItemText>{printer.name}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Copies: {settings.copies}
                </label>
                <Slider.Root
                  value={[settings.copies]}
                  onValueChange={([value]) => setSettings(s => ({ ...s, copies: value }))}
                  max={10}
                  min={1}
                  step={1}
                  className="relative flex items-center select-none touch-none w-full h-5"
                >
                  <Slider.Track className="bg-gray-200 dark:bg-gray-600 relative grow rounded-full h-1">
                    <Slider.Range className="absolute bg-red-500 rounded-full h-full" />
                  </Slider.Track>
                  <Slider.Thumb className="block w-5 h-5 bg-white shadow-lg border border-gray-300 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500" />
                </Slider.Root>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Draft Mode</label>
                  <Switch.Root
                    checked={settings.isDraft}
                    onCheckedChange={(checked) => setSettings(s => ({ ...s, isDraft: checked }))}
                    className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full relative data-[state=checked]:bg-red-500"
                  >
                    <Switch.Thumb className="block w-4 h-4 bg-white rounded-full shadow-lg translate-x-1 will-change-transform data-[state=checked]:translate-x-6 transition-transform" />
                  </Switch.Root>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Color Print</label>
                  <Switch.Root
                    checked={settings.isColor}
                    onCheckedChange={(checked) => setSettings(s => ({ ...s, isColor: checked }))}
                    className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full relative data-[state=checked]:bg-red-500"
                  >
                    <Switch.Thumb className="block w-4 h-4 bg-white rounded-full shadow-lg translate-x-1 will-change-transform data-[state=checked]:translate-x-6 transition-transform" />
                  </Switch.Root>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Orientation
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSettings(s => ({ ...s, orientation: 'portrait' }))}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      settings.orientation === 'portrait'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                    }`}
                  >
                    Portrait
                  </button>
                  <button
                    onClick={() => setSettings(s => ({ ...s, orientation: 'landscape' }))}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      settings.orientation === 'landscape'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                    }`}
                  >
                    Landscape
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pages
                </label>
                <input
                  type="text"
                  value={settings.pages}
                  onChange={(e) => setSettings(s => ({ ...s, pages: e.target.value }))}
                  placeholder="all or 1-3,5,7-10"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {isUploading && (
            <div className="mt-4">
              <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 text-center">
                Uploading... {uploadProgress}%
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
            <Dialog.Close asChild>
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                disabled={isUploading}
              >
                Cancel
              </button>
            </Dialog.Close>
            <button
              onClick={handlePrint}
              disabled={!file || !settings.printerId || isUploading}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Processing...' : 'Print'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}