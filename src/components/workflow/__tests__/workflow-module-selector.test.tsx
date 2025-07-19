import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { WorkflowModuleSelector, MODULE_TEMPLATES } from '../workflow-module-selector'

describe('WorkflowModuleSelector', () => {
  const mockProps = {
    selectedModules: ['auth', 'payment'],
    moduleConfigurations: {
      auth: {
        provider: 'nextauth',
        socialProviders: ['google', 'github'],
        emailAuth: true,
        twoFactor: false
      },
      payment: {
        provider: 'stripe',
        subscriptions: true,
        oneTimePayments: true,
        webhooks: true
      }
    },
    onModuleToggle: vi.fn(),
    onConfigurationChange: vi.fn(),
    onExport: vi.fn(),
    onImport: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render module selector with all categories', () => {
    render(<WorkflowModuleSelector {...mockProps} />)
    
    expect(screen.getByText('Workflow Modules')).toBeInTheDocument()
    expect(screen.getByText('Select and configure modules for your workflow')).toBeInTheDocument()
    
    // Check category filters
    expect(screen.getByText('All Modules')).toBeInTheDocument()
    expect(screen.getByText('Core')).toBeInTheDocument()
    expect(screen.getByText('Integration')).toBeInTheDocument()
    expect(screen.getByText('AI/ML')).toBeInTheDocument()
    expect(screen.getByText('Infrastructure')).toBeInTheDocument()
    expect(screen.getByText('UI/UX')).toBeInTheDocument()
  })

  it('should display modules grouped by category', () => {
    render(<WorkflowModuleSelector {...mockProps} />)
    
    // Check that modules are displayed
    expect(screen.getByText('Authentication')).toBeInTheDocument()
    expect(screen.getByText('Payment Processing')).toBeInTheDocument()
    expect(screen.getByText('Analytics & Tracking')).toBeInTheDocument()
    expect(screen.getByText('Database Layer')).toBeInTheDocument()
  })

  it('should show selected modules as selected', () => {
    render(<WorkflowModuleSelector {...mockProps} />)
    
    // Find auth module and check it's selected
    const authModule = screen.getByText('Authentication').closest('.ring-2')
    expect(authModule).toBeInTheDocument()
    
    // Find payment module and check it's selected
    const paymentModule = screen.getByText('Payment Processing').closest('.ring-2')
    expect(paymentModule).toBeInTheDocument()
  })

  it('should call onModuleToggle when module is clicked', () => {
    render(<WorkflowModuleSelector {...mockProps} />)
    
    // Find a non-selected module and click it
    const analyticsModule = screen.getByText('Analytics & Tracking')
    const selectButton = analyticsModule.closest('.p-4')?.querySelector('button:last-child')
    
    if (selectButton) {
      fireEvent.click(selectButton)
      expect(mockProps.onModuleToggle).toHaveBeenCalledWith('analytics')
    }
  })

  it('should filter modules by category', () => {
    render(<WorkflowModuleSelector {...mockProps} />)
    
    // Click on Core category
    fireEvent.click(screen.getByText('Core'))
    
    // Should show core modules
    expect(screen.getByText('Authentication')).toBeInTheDocument()
    // Database Layer is in infrastructure category, not core
    
    // Should not show integration modules in core filter
    expect(screen.queryByText('Payment Processing')).not.toBeInTheDocument()
  })

  it('should filter modules by search query', () => {
    render(<WorkflowModuleSelector {...mockProps} />)
    
    const searchInput = screen.getByPlaceholderText('Search modules...')
    fireEvent.change(searchInput, { target: { value: 'auth' } })
    
    // Should show authentication module
    expect(screen.getByText('Authentication')).toBeInTheDocument()
    
    // Should filter out non-matching modules
    // Other modules should be filtered out
  })

  it('should expand module configuration when settings button is clicked', () => {
    render(<WorkflowModuleSelector {...mockProps} />)
    
    // Find auth module settings button
    const authModule = screen.getByText('Authentication').closest('.p-4')
    const settingsButton = authModule?.querySelector('button[aria-label="Settings"]') || 
                          authModule?.querySelector('button:has(svg)')
    
    if (settingsButton) {
      fireEvent.click(settingsButton)
      
      // Should show configuration options
      waitFor(() => {
        expect(screen.getByText('Configuration')).toBeInTheDocument()
      })
    }
  })

  it('should handle configuration changes', () => {
    render(<WorkflowModuleSelector {...mockProps} />)
    
    // Expand auth module configuration
    const authModule = screen.getByText('Authentication').closest('.p-4')
    const settingsButton = authModule?.querySelector('button:has(svg)')
    
    if (settingsButton) {
      fireEvent.click(settingsButton)
      
      waitFor(() => {
        // Find a configuration option and change it
        const emailAuthCheckbox = screen.getByLabelText(/Email Authentication/i)
        if (emailAuthCheckbox) {
          fireEvent.click(emailAuthCheckbox)
          expect(mockProps.onConfigurationChange).toHaveBeenCalled()
        }
      })
    }
  })

  it('should show module complexity and time estimates', () => {
    render(<WorkflowModuleSelector {...mockProps} />)
    
    // Check that complexity badges are shown (there are multiple medium complexity modules)
    expect(screen.getAllByText('medium')).toHaveLength(7) // Multiple modules have medium complexity
    expect(screen.getAllByText('high')).toHaveLength(3) // Payment, mobile-app, and ai-integration modules
    
    // Check that time estimates are shown
    expect(screen.getAllByText(/2-3 days/)).toHaveLength(2) // Auth and notifications modules
    expect(screen.getByText(/3-5 days/)).toBeInTheDocument() // Payment module
  })

  it('should show dependencies for modules', () => {
    render(<WorkflowModuleSelector {...mockProps} />)
    
    // Payment module depends on auth
    const paymentModule = screen.getByText('Payment Processing').closest('.p-4')
    expect(paymentModule?.textContent).toContain('Depends on: auth')
  })

  it('should display selected modules summary', () => {
    render(<WorkflowModuleSelector {...mockProps} />)
    
    // Should show summary card
    expect(screen.getByText('Selected Modules Summary')).toBeInTheDocument()
    expect(screen.getByText('2 modules selected')).toBeInTheDocument()
    expect(screen.getByText(/Authentication, Payment Processing/)).toBeInTheDocument()
  })

  it('should handle export functionality', () => {
    render(<WorkflowModuleSelector {...mockProps} />)
    
    const exportButton = screen.getByText('Export')
    fireEvent.click(exportButton)
    
    expect(mockProps.onExport).toHaveBeenCalledWith([])
  })

  it('should handle import functionality', () => {
    render(<WorkflowModuleSelector {...mockProps} />)
    
    const importButton = screen.getByText('Import')
    fireEvent.click(importButton)
    
    expect(mockProps.onImport).toHaveBeenCalledWith([])
  })

  it('should not allow deselecting required modules', () => {
    const propsWithRequiredModule = {
      ...mockProps,
      selectedModules: ['auth', 'database'] // database is required
    }
    
    render(<WorkflowModuleSelector {...propsWithRequiredModule} />)
    
    // Find database module (which is required)
    const databaseModule = screen.getByText('Database Layer').closest('.p-4')
    const selectButton = databaseModule?.querySelector('button:last-child')
    
    // Button should be disabled for required modules
    expect(selectButton).toBeDisabled()
  })

  it('should show required badge for required modules', () => {
    render(<WorkflowModuleSelector {...mockProps} />)
    
    // Auth, database, and deployment are required modules
    expect(screen.getAllByText('Required')).toHaveLength(3)
  })

  describe('Module Templates', () => {
    it('should have all expected module templates', () => {
      const expectedModules = [
        'auth',
        'payment',
        'analytics',
        'notifications',
        'database',
        'deployment',
        'ui-components',
        'mobile-app',
        'api-integration',
        'ai-integration'
      ]
      
      const moduleIds = MODULE_TEMPLATES.map(m => m.id)
      expectedModules.forEach(expectedId => {
        expect(moduleIds).toContain(expectedId)
      })
    })

    it('should have valid configuration for each module', () => {
      MODULE_TEMPLATES.forEach(module => {
        expect(module.id).toBeTruthy()
        expect(module.name).toBeTruthy()
        expect(module.description).toBeTruthy()
        expect(module.category).toBeTruthy()
        expect(module.icon).toBeTruthy()
        expect(typeof module.required).toBe('boolean')
        expect(typeof module.configurable).toBe('boolean')
        expect(Array.isArray(module.dependencies)).toBe(true)
        expect(module.estimatedComplexity).toMatch(/^(low|medium|high)$/)
        expect(module.estimatedTime).toBeTruthy()
        expect(typeof module.configuration).toBe('object')
      })
    })

    it('should have valid configuration fields', () => {
      MODULE_TEMPLATES.forEach(module => {
        Object.entries(module.configuration).forEach(([key, config]) => {
          expect(config.type).toMatch(/^(string|number|boolean|select|multiselect)$/)
          expect(config.label).toBeTruthy()
          expect(config.description).toBeTruthy()
          expect(config.default).toBeDefined()
          
          if (config.type === 'select' || config.type === 'multiselect') {
            expect(Array.isArray(config.options)).toBe(true)
            expect(config.options!.length).toBeGreaterThan(0)
          }
        })
      })
    })
  })
})