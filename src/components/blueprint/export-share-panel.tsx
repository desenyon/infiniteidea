"use client"

import { useState } from 'react'
import { Project, ExportFormat } from '@/types'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface ExportSharePanelProps {
  project: Project
  onClose: () => void
}

interface ShareLink {
  shareUrl: string
  shareToken: string
  permissions: string
  expiresAt?: string
  allowedSections: string[]
  createdAt: string
}

export function ExportSharePanel({ project, onClose }: ExportSharePanelProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'share'>('export')
  const [isExporting, setIsExporting] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([])
  const [showShareForm, setShowShareForm] = useState(false)

  // Export state
  const [exportFormat, setExportFormat] = useState<ExportFormat>(ExportFormat.MARKDOWN)
  const [selectedSections, setSelectedSections] = useState<string[]>(['all'])

  // Share state
  const [shareForm, setShareForm] = useState({
    permissions: 'view',
    expiresAt: '',
    password: '',
    allowedSections: ['all'] as string[]
  })

  const availableSections = [
    { id: 'all', label: 'All Sections' },
    { id: 'productPlan', label: 'Product Plan' },
    { id: 'techStack', label: 'Technical Architecture' },
    { id: 'aiWorkflow', label: 'AI Workflow' },
    { id: 'roadmap', label: 'Development Roadmap' },
    { id: 'financialModel', label: 'Financial Model' }
  ]

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch(`/api/projects/${project.id}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format: exportFormat,
          sections: selectedSections.includes('all') ? undefined : selectedSections
        }),
      })

      if (exportFormat === ExportFormat.PDF) {
        const result = await response.json()
        if (result.success) {
          // Open PDF generation in new tab
          window.open(result.data.downloadUrl, '_blank')
        }
      } else {
        // Download file directly
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}.${exportFormat.toLowerCase()}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleCreateShareLink = async () => {
    setIsSharing(true)
    try {
      const response = await fetch(`/api/projects/${project.id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          permissions: shareForm.permissions,
          expiresAt: shareForm.expiresAt || undefined,
          password: shareForm.password || undefined,
          allowedSections: shareForm.allowedSections
        }),
      })

      const result = await response.json()

      if (result.success) {
        setShareLinks(prev => [result.data, ...prev])
        setShowShareForm(false)
        setShareForm({
          permissions: 'view',
          expiresAt: '',
          password: '',
          allowedSections: ['all']
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Share link creation failed:', error)
      alert('Failed to create share link. Please try again.')
    } finally {
      setIsSharing(false)
    }
  }

  const handleRevokeShareLink = async (shareToken: string) => {
    try {
      const response = await fetch(`/api/projects/${project.id}/share?token=${shareToken}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        setShareLinks(prev => prev.filter(link => link.shareToken !== shareToken))
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Failed to revoke share link:', error)
      alert('Failed to revoke share link. Please try again.')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Link copied to clipboard!')
    }).catch(() => {
      alert('Failed to copy link')
    })
  }

  return (
    <Modal onClose={onClose} title="Export & Share" size="lg">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'export'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Export
          </button>
          <button
            onClick={() => setActiveTab('share')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'share'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Share
          </button>
        </div>

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Format
              </label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={ExportFormat.MARKDOWN}>Markdown (.md)</option>
                <option value={ExportFormat.JSON}>JSON (.json)</option>
                <option value={ExportFormat.HTML}>HTML (.html)</option>
                <option value={ExportFormat.PDF}>PDF (.pdf)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sections to Include
              </label>
              <div className="space-y-2">
                {availableSections.map((section) => (
                  <label key={section.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedSections.includes(section.id)}
                      onChange={(e) => {
                        if (section.id === 'all') {
                          setSelectedSections(e.target.checked ? ['all'] : [])
                        } else {
                          setSelectedSections(prev => {
                            const filtered = prev.filter(s => s !== 'all')
                            if (e.target.checked) {
                              return [...filtered, section.id]
                            } else {
                              return filtered.filter(s => s !== section.id)
                            }
                          })
                        }
                      }}
                      className="mr-2"
                    />
                    {section.label}
                  </label>
                ))}
              </div>
            </div>

            <Button
              onClick={handleExport}
              disabled={isExporting || selectedSections.length === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isExporting ? 'Exporting...' : `Export as ${exportFormat}`}
            </Button>
          </div>
        )}

        {/* Share Tab */}
        {activeTab === 'share' && (
          <div className="space-y-4">
            {!showShareForm ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Share Links</h3>
                  <Button
                    onClick={() => setShowShareForm(true)}
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Create New Link
                  </Button>
                </div>

                {shareLinks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No share links created yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {shareLinks.map((link) => (
                      <div key={link.shareToken} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium">
                            {link.permissions} access
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(link.shareUrl)}
                            >
                              Copy Link
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRevokeShareLink(link.shareToken)}
                            >
                              Revoke
                            </Button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Sections: {link.allowedSections.join(', ')}
                          {link.expiresAt && (
                            <span> • Expires: {new Date(link.expiresAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Create Share Link</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowShareForm(false)}
                  >
                    Cancel
                  </Button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissions
                  </label>
                  <select
                    value={shareForm.permissions}
                    onChange={(e) => setShareForm(prev => ({ ...prev, permissions: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="view">View Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiration Date (Optional)
                  </label>
                  <Input
                    type="date"
                    value={shareForm.expiresAt}
                    onChange={(e) => setShareForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Protection (Optional)
                  </label>
                  <Input
                    type="password"
                    value={shareForm.password}
                    onChange={(e) => setShareForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Leave empty for no password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allowed Sections
                  </label>
                  <div className="space-y-2">
                    {availableSections.map((section) => (
                      <label key={section.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={shareForm.allowedSections.includes(section.id)}
                          onChange={(e) => {
                            if (section.id === 'all') {
                              setShareForm(prev => ({
                                ...prev,
                                allowedSections: e.target.checked ? ['all'] : []
                              }))
                            } else {
                              setShareForm(prev => {
                                const filtered = prev.allowedSections.filter(s => s !== 'all')
                                if (e.target.checked) {
                                  return { ...prev, allowedSections: [...filtered, section.id] }
                                } else {
                                  return { ...prev, allowedSections: filtered.filter(s => s !== section.id) }
                                }
                              })
                            }
                          }}
                          className="mr-2"
                        />
                        {section.label}
                      </label>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleCreateShareLink}
                  disabled={isSharing || shareForm.allowedSections.length === 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isSharing ? 'Creating...' : 'Create Share Link'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}