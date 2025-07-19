'use client'

import React, { useState, useCallback } from 'react'
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Copy, 
  Trash2,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react'

import { WorkflowModule } from '@/types'
import { ModuleTemplate, ModuleConfiguration, MODULE_TEMPLATES } from './workflow-module-selector'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface WorkflowModuleConfigProps {
  module: WorkflowModule
  configuration: Record<string, any>
  onConfigurationChange: (config: Record<string, any>) => void
  onSave?: () => void
  onReset?: () => void
  onDuplicate?: () => void
  onDelete?: () => void
  className?: string
}

export function WorkflowModuleConfig({
  module,
  configuration,
  onConfigurationChange,
  onSave,
  onReset,
  onDuplicate,
  onDelete,
  className = '',
}: WorkflowModuleConfigProps) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Find the module template
  const template = MODULE_TEMPLATES.find(t => t.id === module.id)
  
  if (!template) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center gap-2 text-amber-600">
          <AlertCircle size={20} />
          <span>Module template not found: {module.id}</span>
        </div>
      </Card>
    )
  }

  const handleConfigChange = useCallback((key: string, value: any) => {
    const newConfig = { ...configuration, [key]: value }
    
    // Validate the field
    const fieldConfig = template.configuration[key]
    const errors = { ...validationErrors }
    
    if (fieldConfig?.required && (!value || (Array.isArray(value) && value.length === 0))) {
      errors[key] = `${fieldConfig.label} is required`
    } else if (fieldConfig?.validation) {
      const validation = fieldConfig.validation
      
      if (typeof value === 'number') {
        if (validation.min !== undefined && value < validation.min) {
          errors[key] = `Minimum value is ${validation.min}`
        } else if (validation.max !== undefined && value > validation.max) {
          errors[key] = `Maximum value is ${validation.max}`
        } else {
          delete errors[key]
        }
      } else if (typeof value === 'string' && validation.pattern) {
        const regex = new RegExp(validation.pattern)
        if (!regex.test(value)) {
          errors[key] = `Invalid format`
        } else {
          delete errors[key]
        }
      } else {
        delete errors[key]
      }
    } else {
      delete errors[key]
    }
    
    setValidationErrors(errors)
    setHasUnsavedChanges(true)
    onConfigurationChange(newConfig)
  }, [configuration, template.configuration, validationErrors, onConfigurationChange])

  const handleSave = useCallback(() => {
    if (Object.keys(validationErrors).length === 0) {
      setHasUnsavedChanges(false)
      onSave?.()
    }
  }, [validationErrors, onSave])

  const handleReset = useCallback(() => {
    // Reset to default values
    const defaultConfig: Record<string, any> = {}
    Object.entries(template.configuration).forEach(([key, config]) => {
      defaultConfig[key] = config.default
    })
    
    onConfigurationChange(defaultConfig)
    setHasUnsavedChanges(false)
    setValidationErrors({})
    onReset?.()
  }, [template.configuration, onConfigurationChange, onReset])

  const renderConfigField = (key: string, config: ModuleConfiguration[string]) => {
    const value = configuration[key] ?? config.default
    const hasError = validationErrors[key]

    const fieldClasses = `w-full px-3 py-2 border rounded-md text-sm ${
      hasError ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
    }`

    switch (config.type) {
      case 'boolean':
        return (
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => handleConfigChange(key, e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <div>
                <span className="font-medium text-gray-900">{config.label}</span>
                {config.required && <span className="text-red-500 ml-1">*</span>}
              </div>
            </label>
            {config.description && (
              <p className="text-sm text-gray-600 ml-7">{config.description}</p>
            )}
          </div>
        )

      case 'select':
        return (
          <div className="space-y-2">
            <label className="block">
              <span className="font-medium text-gray-900">
                {config.label}
                {config.required && <span className="text-red-500 ml-1">*</span>}
              </span>
              <select
                value={value}
                onChange={(e) => handleConfigChange(key, e.target.value)}
                className={fieldClasses}
              >
                {config.options?.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            {config.description && (
              <p className="text-sm text-gray-600">{config.description}</p>
            )}
            {hasError && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {hasError}
              </p>
            )}
          </div>
        )

      case 'multiselect':
        return (
          <div className="space-y-2">
            <label className="block">
              <span className="font-medium text-gray-900">
                {config.label}
                {config.required && <span className="text-red-500 ml-1">*</span>}
              </span>
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
              {config.options?.map(option => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value.includes(option.value)}
                    onChange={(e) => {
                      const newValue = e.target.checked
                        ? [...value, option.value]
                        : value.filter((v: any) => v !== option.value)
                      handleConfigChange(key, newValue)
                    }}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
            {config.description && (
              <p className="text-sm text-gray-600">{config.description}</p>
            )}
            {hasError && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {hasError}
              </p>
            )}
          </div>
        )

      case 'string':
        return (
          <div className="space-y-2">
            <label className="block">
              <span className="font-medium text-gray-900">
                {config.label}
                {config.required && <span className="text-red-500 ml-1">*</span>}
              </span>
              <input
                type="text"
                value={value}
                onChange={(e) => handleConfigChange(key, e.target.value)}
                className={fieldClasses}
                placeholder={config.description}
              />
            </label>
            {config.description && (
              <p className="text-sm text-gray-600">{config.description}</p>
            )}
            {hasError && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {hasError}
              </p>
            )}
          </div>
        )

      case 'number':
        return (
          <div className="space-y-2">
            <label className="block">
              <span className="font-medium text-gray-900">
                {config.label}
                {config.required && <span className="text-red-500 ml-1">*</span>}
              </span>
              <input
                type="number"
                value={value}
                onChange={(e) => handleConfigChange(key, Number(e.target.value))}
                className={fieldClasses}
                min={config.validation?.min}
                max={config.validation?.max}
              />
            </label>
            {config.description && (
              <p className="text-sm text-gray-600">{config.description}</p>
            )}
            {hasError && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {hasError}
              </p>
            )}
          </div>
        )

      default:
        return null
    }
  }

  const isValid = Object.keys(validationErrors).length === 0
  const Icon = template.icon

  return (
    <Card className={`${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Icon size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{template.name}</h3>
              <p className="text-sm text-gray-600">{template.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <div className="flex items-center gap-1 text-amber-600 text-sm">
                <AlertCircle size={14} />
                <span>Unsaved changes</span>
              </div>
            )}
            {isValid && !hasUnsavedChanges && (
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <CheckCircle size={14} />
                <span>Saved</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="p-4">
        <div className="space-y-6">
          {Object.entries(template.configuration).map(([key, config]) => (
            <div key={key}>
              {renderConfigField(key, config)}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={!hasUnsavedChanges}
            >
              <RotateCcw size={14} />
              Reset
            </Button>
            
            {onDuplicate && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDuplicate}
              >
                <Copy size={14} />
                Duplicate
              </Button>
            )}
            
            {onDelete && !template.required && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 size={14} />
                Remove
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={!isValid || !hasUnsavedChanges}
            >
              <Save size={14} />
              Save Configuration
            </Button>
          </div>
        </div>
      </div>

      {/* Module Info */}
      <div className="p-4 border-t border-gray-200 bg-blue-50">
        <div className="flex items-start gap-2">
          <Info size={16} className="text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Complexity:</strong> {template.estimatedComplexity}
              </div>
              <div>
                <strong>Est. Time:</strong> {template.estimatedTime}
              </div>
              {template.dependencies.length > 0 && (
                <div className="col-span-2">
                  <strong>Dependencies:</strong> {template.dependencies.join(', ')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}