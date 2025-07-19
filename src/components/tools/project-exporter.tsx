'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { LoadingSpinner } from '@/components/ui/loading'
import { ProjectExportFormat } from '@/types/external-tools'

interface ProjectExporterProps {
  projectId: string
  projectName: string
  blueprint: any
  onExportComplete?: (result: any) => void
}

interface ExportFormat {
  format: ProjectExportFormat
  name: string
  description: string
  fileExtension: string
  icon: string
}

export function ProjectExporter({ projectId, projectName, blueprint, onExportComplete }: ProjectExporterProps) {
  const [showExportModal, setShowExportModal] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<ProjectExportFormat>(ProjectExportFormat.ZIP)
  const [exportOptions, setExportOptions] = useState({
    includeFiles: ['**/*'],
    excludeFiles: ['node_modules/**', '.git/**', 'dist/**', '.next/**'],
    includePrompts: true,
    includeDocumentation: true,
    includeTests: true,
    compressionLevel: 6
  })

  const exportFormats: ExportFormat[] = [
    {
      format: ProjectExportFormat.ZIP,
      name: 'ZIP Archive',
      description: 'Compressed archive with all project files',
      fileExtension: '.zip',
      icon: '📦'
    },
    {
      format: ProjectExportFormat.TAR_GZ,
      name: 'TAR.GZ Archive',
      description: 'Compressed tar archive',
      fileExtension: '.tar.gz',
      icon: '📦'
    },
    {
      format: ProjectExportFormat.FOLDER,
      name: 'Folder Structure',
      description: 'Organized folder structure',
      fileExtension: '',
      icon: '📁'
    },
    {
      format: ProjectExportFormat.VSCODE_WORKSPACE,
      name: 'VS Code Workspace',
      description: 'VS Code workspace with project files',
      fileExtension: '.code-workspace',
      icon: '💻'
    },
    {
      format: ProjectExportFormat.CURSOR_PROJECT,
      name: 'Cursor Project',
      description: 'Cursor IDE project with AI settings',
      fileExtension: '.cursor',
      icon: '🎯'
    }
  ]

  const handleExport = async () => {
    setExporting(true)
    
    try {
      const response = await fetch(`/api/projects/${projectId}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          format: selectedFormat,
          options: exportOptions
        })
      })

      const result = await response.json()

      if (result.success) {
        // Trigger download
        if (result.downloadUrl) {
          const link = document.createElement('a')
          link.href = result.downloadUrl
          link.download = result.fileName || `${projectName}-export.${selectedFormat}`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }

        onExportComplete?.(result)
        setShowExportModal(false)
        
        // Show success message
        alert(`Project exported successfully as ${result.fileName}`)
      } else {
        alert(`Export failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export project')
    } finally {
      setExporting(false)
    }
  }

  const getFormatIcon = (format: ProjectExportFormat) => {
    const formatConfig = exportFormats.find(f => f.format === format)
    return formatConfig?.icon || '📄'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">Export Project</h4>
          <p className="text-sm text-gray-600">
            Download your project in various formats for different coding environments
          </p>
        </div>
        <Button onClick={() => setShowExportModal(true)}>
          Export Project
        </Button>
      </div>

      {/* Export Configuration Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title={`Export ${projectName}`}
      >
        <div className="space-y-6">
          {/* Format Selection */}
          <div>
            <h5 className="font-medium mb-3">Choose Export Format</h5>
            <div className="grid grid-cols-1 gap-3">
              {exportFormats.map((format) => (
                <label
                  key={format.format}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedFormat === format.format
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="exportFormat"
                    value={format.format}
                    checked={selectedFormat === format.format}
                    onChange={(e) => setSelectedFormat(e.target.value as ProjectExportFormat)}
                    className="sr-only"
                  />
                  <span className="text-2xl mr-3">{format.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{format.name}</div>
                    <div className="text-sm text-gray-600">{format.description}</div>
                    {format.fileExtension && (
                      <div className="text-xs text-gray-500 mt-1">
                        File extension: {format.fileExtension}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div>
            <h5 className="font-medium mb-3">Export Options</h5>
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={exportOptions.includePrompts}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    includePrompts: e.target.checked
                  }))}
                  className="rounded"
                />
                <span className="text-sm">Include AI coding prompts</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={exportOptions.includeDocumentation}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    includeDocumentation: e.target.checked
                  }))}
                  className="rounded"
                />
                <span className="text-sm">Include documentation files</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={exportOptions.includeTests}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    includeTests: e.target.checked
                  }))}
                  className="rounded"
                />
                <span className="text-sm">Include test files</span>
              </label>
            </div>
          </div>

          {/* File Filters */}
          <div>
            <h5 className="font-medium mb-3">File Filters</h5>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Exclude Files (patterns)
                </label>
                <textarea
                  value={exportOptions.excludeFiles.join('\n')}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    excludeFiles: e.target.value.split('\n').filter(Boolean)
                  }))}
                  placeholder="node_modules/**&#10;.git/**&#10;dist/**"
                  className="w-full p-2 border rounded-md text-sm"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  One pattern per line. Use glob patterns like *.log or folder/**
                </p>
              </div>
            </div>
          </div>

          {/* Compression Level for ZIP/TAR.GZ */}
          {(selectedFormat === ProjectExportFormat.ZIP || selectedFormat === ProjectExportFormat.TAR_GZ) && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Compression Level: {exportOptions.compressionLevel}
              </label>
              <input
                type="range"
                min="1"
                max="9"
                value={exportOptions.compressionLevel}
                onChange={(e) => setExportOptions(prev => ({
                  ...prev,
                  compressionLevel: parseInt(e.target.value)
                }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Faster</span>
                <span>Smaller</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              onClick={() => setShowExportModal(false)}
              variant="secondary"
              className="flex-1"
              disabled={exporting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={exporting}
              className="flex-1"
            >
              {exporting ? (
                <>
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  {getFormatIcon(selectedFormat)} Export
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}