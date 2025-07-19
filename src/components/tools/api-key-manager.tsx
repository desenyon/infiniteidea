'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { LoadingSpinner } from '@/components/ui/loading'
import { ApiKeyConfig, ExternalTool } from '@/types/external-tools'

interface ApiKeyManagerProps {
  toolId: string
  toolName: string
  tool: ExternalTool
}

interface SafeApiKey extends Omit<ApiKeyConfig, 'value'> {
  hasValue: boolean
}

export function ApiKeyManager({ toolId, toolName, tool }: ApiKeyManagerProps) {
  const [apiKeys, setApiKeys] = useState<SafeApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [newKey, setNewKey] = useState({
    name: '',
    description: '',
    keyType: 'api-key' as const,
    value: '',
    scopes: [] as string[],
    expiresAt: ''
  })

  useEffect(() => {
    loadApiKeys()
  }, [toolId])

  const loadApiKeys = async () => {
    try {
      const response = await fetch(`/api/tools/api-keys?toolId=${toolId}`)
      if (response.ok) {
        const data = await response.json()
        setApiKeys(data.apiKeys || [])
      }
    } catch (error) {
      console.error('Failed to load API keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddKey = async () => {
    if (!newKey.name || !newKey.value) {
      alert('Name and API key value are required')
      return
    }

    setAdding(true)
    try {
      const response = await fetch('/api/tools/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          toolId,
          ...newKey,
          expiresAt: newKey.expiresAt ? new Date(newKey.expiresAt).toISOString() : undefined
        })
      })

      if (response.ok) {
        await loadApiKeys()
        setShowAddModal(false)
        setNewKey({
          name: '',
          description: '',
          keyType: 'api-key',
          value: '',
          scopes: [],
          expiresAt: ''
        })
      } else {
        const error = await response.json()
        alert(`Failed to add API key: ${error.error}`)
      }
    } catch (error) {
      console.error('Add API key error:', error)
      alert('Failed to add API key')
    } finally {
      setAdding(false)
    }
  }

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) {
      return
    }

    setDeleting(keyId)
    try {
      const response = await fetch(`/api/tools/api-keys?toolId=${toolId}&keyId=${keyId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadApiKeys()
      } else {
        const error = await response.json()
        alert(`Failed to delete API key: ${error.error}`)
      }
    } catch (error) {
      console.error('Delete API key error:', error)
      alert('Failed to delete API key')
    } finally {
      setDeleting(null)
    }
  }

  const getKeyTypeIcon = (keyType: string) => {
    switch (keyType) {
      case 'api-key':
        return '🔑'
      case 'bearer-token':
        return '🎫'
      case 'oauth':
        return '🔐'
      default:
        return '🔧'
    }
  }

  const getToolSpecificFields = () => {
    switch (tool) {
      case ExternalTool.GITHUB_COPILOT:
        return (
          <div>
            <label className="block text-sm font-medium mb-1">
              Scopes (Optional)
            </label>
            <Input
              placeholder="repo, user, etc."
              value={newKey.scopes.join(', ')}
              onChange={(e) => setNewKey(prev => ({
                ...prev,
                scopes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              }))}
            />
            <p className="text-xs text-gray-500 mt-1">
              Comma-separated list of GitHub scopes
            </p>
          </div>
        )
      
      case ExternalTool.CURSOR:
        return (
          <div>
            <label className="block text-sm font-medium mb-1">
              Key Type
            </label>
            <select
              value={newKey.keyType}
              onChange={(e) => setNewKey(prev => ({
                ...prev,
                keyType: e.target.value as any
              }))}
              className="w-full p-2 border rounded-md"
            >
              <option value="api-key">API Key</option>
              <option value="bearer-token">Bearer Token</option>
            </select>
          </div>
        )
      
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <LoadingSpinner />
        <span className="ml-2">Loading API keys...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">API Keys for {toolName}</h4>
          <p className="text-sm text-gray-600">
            Manage API keys and authentication tokens
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          Add API Key
        </Button>
      </div>

      {apiKeys.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-500">No API keys configured</p>
          <p className="text-sm text-gray-400 mt-1">
            Add an API key to enable {toolName} integration
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {apiKeys.map((key) => (
            <Card key={key.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getKeyTypeIcon(key.keyType)}</span>
                  <div>
                    <h5 className="font-medium">{key.name}</h5>
                    {key.description && (
                      <p className="text-sm text-gray-600">{key.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-500">
                        Type: {key.keyType}
                      </span>
                      {key.hasValue && (
                        <span className="text-xs text-green-600">✓ Configured</span>
                      )}
                      {key.expiresAt && (
                        <span className="text-xs text-orange-600">
                          Expires: {new Date(key.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleDeleteKey(key.id)}
                  disabled={deleting === key.id}
                  variant="secondary"
                  size="sm"
                >
                  {deleting === key.id ? (
                    <LoadingSpinner className="w-4 h-4" />
                  ) : (
                    'Delete'
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add API Key Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={`Add API Key for ${toolName}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Name *
            </label>
            <Input
              placeholder="e.g., Production API Key"
              value={newKey.name}
              onChange={(e) => setNewKey(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <Input
              placeholder="Optional description"
              value={newKey.description}
              onChange={(e) => setNewKey(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          {getToolSpecificFields()}

          <div>
            <label className="block text-sm font-medium mb-1">
              API Key Value *
            </label>
            <Input
              type="password"
              placeholder="Enter your API key"
              value={newKey.value}
              onChange={(e) => setNewKey(prev => ({ ...prev, value: e.target.value }))}
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be encrypted and stored securely
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Expiration Date (Optional)
            </label>
            <Input
              type="date"
              value={newKey.expiresAt}
              onChange={(e) => setNewKey(prev => ({ ...prev, expiresAt: e.target.value }))}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              onClick={() => setShowAddModal(false)}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddKey}
              disabled={adding || !newKey.name || !newKey.value}
              className="flex-1"
            >
              {adding ? (
                <>
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                  Adding...
                </>
              ) : (
                'Add API Key'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}