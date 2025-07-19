import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ExportFormat } from "@/types"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const projectId = params.id
    const body = await request.json()
    const { format, sections } = body

    if (!format || !Object.values(ExportFormat).includes(format)) {
      return NextResponse.json(
        { error: "Invalid export format" },
        { status: 400 }
      )
    }

    // Fetch the project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" }, 
        { status: 404 }
      )
    }

    if (!project.blueprint) {
      return NextResponse.json(
        { error: "Project must have a completed blueprint to export" },
        { status: 400 }
      )
    }

    // Generate export content based on format
    let exportContent: string
    let mimeType: string
    let filename: string

    switch (format) {
      case ExportFormat.MARKDOWN:
        exportContent = generateMarkdownExport(project, sections)
        mimeType = 'text/markdown'
        filename = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}.md`
        break
      
      case ExportFormat.JSON:
        exportContent = generateJSONExport(project, sections)
        mimeType = 'application/json'
        filename = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`
        break
      
      case ExportFormat.HTML:
        exportContent = generateHTMLExport(project, sections)
        mimeType = 'text/html'
        filename = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}.html`
        break
      
      case ExportFormat.PDF:
        // For PDF, we'll return a URL to generate it client-side or use a service
        return NextResponse.json({
          success: true,
          data: {
            downloadUrl: `/api/projects/${projectId}/export/pdf`,
            format: ExportFormat.PDF,
            filename: `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
          }
        })
      
      default:
        return NextResponse.json(
          { error: "Unsupported export format" },
          { status: 400 }
        )
    }

    // Log export event
    await prisma.analytics.create({
      data: {
        userId: session.user.id,
        projectId: projectId,
        eventType: 'project_exported',
        eventData: { format, sections },
        success: true
      }
    })

    // Return the export content
    return new NextResponse(exportContent, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Export-Success': 'true'
      }
    })

  } catch (error) {
    console.error("Error exporting project:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to export project" 
      },
      { status: 500 }
    )
  }
}

function generateMarkdownExport(project: any, sections?: string[]): string {
  const blueprint = project.blueprint
  const includeSection = (section: string) => !sections || sections.includes(section)
  
  let content = `# ${project.name}\n\n`
  
  if (project.description) {
    content += `${project.description}\n\n`
  }
  
  content += `**Original Idea:** ${project.originalIdea}\n\n`
  content += `**Category:** ${project.category || 'Not specified'}\n\n`
  content += `**Complexity:** ${project.complexity || 'Not specified'}\n\n`
  content += `**Generated:** ${new Date(project.generatedAt).toLocaleDateString()}\n\n`
  content += `---\n\n`

  if (includeSection('productPlan') && blueprint.productPlan) {
    content += `## Product Plan\n\n`
    content += `### Target Audience\n`
    if (blueprint.productPlan.targetAudience?.primary) {
      content += `**Primary:** ${blueprint.productPlan.targetAudience.primary.demographics}\n`
      content += `**Pain Points:** ${blueprint.productPlan.targetAudience.primary.painPoints?.join(', ')}\n\n`
    }
    
    if (blueprint.productPlan.coreFeatures?.length > 0) {
      content += `### Core Features\n`
      blueprint.productPlan.coreFeatures.forEach((feature: any, index: number) => {
        content += `${index + 1}. **${feature.name}** - ${feature.description}\n`
      })
      content += `\n`
    }
    
    if (blueprint.productPlan.monetization) {
      content += `### Monetization Strategy\n`
      content += `**Model:** ${blueprint.productPlan.monetization.primary?.model}\n`
      content += `**Reasoning:** ${blueprint.productPlan.monetization.primary?.reasoning}\n\n`
    }
  }

  if (includeSection('techStack') && blueprint.techStack) {
    content += `## Technical Architecture\n\n`
    
    if (blueprint.techStack.frontend?.length > 0) {
      content += `### Frontend\n`
      blueprint.techStack.frontend.forEach((tech: any) => {
        content += `- **${tech.name}:** ${tech.reasoning}\n`
      })
      content += `\n`
    }
    
    if (blueprint.techStack.backend?.length > 0) {
      content += `### Backend\n`
      blueprint.techStack.backend.forEach((tech: any) => {
        content += `- **${tech.name}:** ${tech.reasoning}\n`
      })
      content += `\n`
    }
    
    if (blueprint.techStack.database?.length > 0) {
      content += `### Database\n`
      blueprint.techStack.database.forEach((tech: any) => {
        content += `- **${tech.name}:** ${tech.reasoning}\n`
      })
      content += `\n`
    }
  }

  if (includeSection('roadmap') && blueprint.roadmap) {
    content += `## Development Roadmap\n\n`
    content += `**Total Estimate:** ${blueprint.roadmap.totalEstimate} hours\n`
    content += `**Timeline:** ${blueprint.roadmap.timeline}\n\n`
    
    if (blueprint.roadmap.phases?.length > 0) {
      blueprint.roadmap.phases.forEach((phase: any, index: number) => {
        content += `### Phase ${index + 1}: ${phase.name}\n`
        content += `${phase.description}\n`
        content += `**Estimated Hours:** ${phase.estimatedHours}\n\n`
      })
    }
  }

  if (includeSection('financialModel') && blueprint.financialModel) {
    content += `## Financial Model\n\n`
    
    if (blueprint.financialModel.costs) {
      content += `### Cost Breakdown\n`
      content += `**Total Monthly:** $${blueprint.financialModel.costs.monthly}\n`
      content += `**Total Yearly:** $${blueprint.financialModel.costs.yearly}\n\n`
    }
    
    if (blueprint.financialModel.metrics) {
      content += `### Key Metrics\n`
      content += `**CAC:** $${blueprint.financialModel.metrics.cac}\n`
      content += `**LTV:** $${blueprint.financialModel.metrics.ltv}\n`
      content += `**LTV/CAC Ratio:** ${blueprint.financialModel.metrics.ltvCacRatio}\n\n`
    }
  }

  return content
}

function generateJSONExport(project: any, sections?: string[]): string {
  const exportData: any = {
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      originalIdea: project.originalIdea,
      category: project.category,
      complexity: project.complexity,
      status: project.status,
      generatedAt: project.generatedAt,
      createdAt: project.createdAt
    }
  }

  if (project.blueprint) {
    exportData.blueprint = {}
    
    if (!sections || sections.includes('productPlan')) {
      exportData.blueprint.productPlan = project.blueprint.productPlan
    }
    
    if (!sections || sections.includes('techStack')) {
      exportData.blueprint.techStack = project.blueprint.techStack
    }
    
    if (!sections || sections.includes('aiWorkflow')) {
      exportData.blueprint.aiWorkflow = project.blueprint.aiWorkflow
    }
    
    if (!sections || sections.includes('roadmap')) {
      exportData.blueprint.roadmap = project.blueprint.roadmap
    }
    
    if (!sections || sections.includes('financialModel')) {
      exportData.blueprint.financialModel = project.blueprint.financialModel
    }
  }

  return JSON.stringify(exportData, null, 2)
}

function generateHTMLExport(project: any, sections?: string[]): string {
  const blueprint = project.blueprint
  const includeSection = (section: string) => !sections || sections.includes(section)
  
  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.name} - Blueprint</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2, h3 { color: #333; }
        h1 { border-bottom: 2px solid #007acc; padding-bottom: 10px; }
        h2 { border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 30px; }
        .meta { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .feature { margin: 10px 0; padding: 10px; border-left: 3px solid #007acc; background: #f9f9f9; }
        .tech-item { margin: 8px 0; }
        .phase { margin: 15px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        ul { padding-left: 20px; }
        .export-info { font-size: 12px; color: #666; text-align: center; margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px; }
    </style>
</head>
<body>
    <h1>${project.name}</h1>
    
    <div class="meta">
        <p><strong>Description:</strong> ${project.description || 'Not provided'}</p>
        <p><strong>Original Idea:</strong> ${project.originalIdea}</p>
        <p><strong>Category:</strong> ${project.category || 'Not specified'}</p>
        <p><strong>Complexity:</strong> ${project.complexity || 'Not specified'}</p>
        <p><strong>Generated:</strong> ${new Date(project.generatedAt).toLocaleDateString()}</p>
    </div>
  `

  if (includeSection('productPlan') && blueprint.productPlan) {
    html += `
    <h2>Product Plan</h2>
    <h3>Target Audience</h3>
    `
    if (blueprint.productPlan.targetAudience?.primary) {
      html += `
      <p><strong>Primary:</strong> ${blueprint.productPlan.targetAudience.primary.demographics}</p>
      <p><strong>Pain Points:</strong> ${blueprint.productPlan.targetAudience.primary.painPoints?.join(', ')}</p>
      `
    }
    
    if (blueprint.productPlan.coreFeatures?.length > 0) {
      html += `<h3>Core Features</h3>`
      blueprint.productPlan.coreFeatures.forEach((feature: any) => {
        html += `<div class="feature"><strong>${feature.name}</strong> - ${feature.description}</div>`
      })
    }
  }

  if (includeSection('techStack') && blueprint.techStack) {
    html += `<h2>Technical Architecture</h2>`
    
    if (blueprint.techStack.frontend?.length > 0) {
      html += `<h3>Frontend</h3>`
      blueprint.techStack.frontend.forEach((tech: any) => {
        html += `<div class="tech-item"><strong>${tech.name}:</strong> ${tech.reasoning}</div>`
      })
    }
    
    if (blueprint.techStack.backend?.length > 0) {
      html += `<h3>Backend</h3>`
      blueprint.techStack.backend.forEach((tech: any) => {
        html += `<div class="tech-item"><strong>${tech.name}:</strong> ${tech.reasoning}</div>`
      })
    }
  }

  html += `
    <div class="export-info">
        <p>Exported from Desenyon: InfiniteIdea on ${new Date().toLocaleDateString()}</p>
    </div>
</body>
</html>
  `

  return html
}