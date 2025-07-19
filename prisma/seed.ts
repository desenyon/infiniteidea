import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create sample templates
  const templates = [
    {
      name: 'E-commerce Platform',
      description: 'Complete e-commerce solution with payment processing, inventory management, and user accounts',
      category: 'E-commerce',
      templateData: {
        features: ['Product catalog', 'Shopping cart', 'Payment processing', 'User accounts', 'Order management'],
        techStack: {
          frontend: 'Next.js + TypeScript',
          backend: 'Node.js + Express',
          database: 'PostgreSQL',
          payment: 'Stripe'
        }
      }
    },
    {
      name: 'SaaS Dashboard',
      description: 'Modern SaaS application with subscription management, analytics, and team collaboration',
      category: 'SaaS',
      templateData: {
        features: ['User authentication', 'Subscription billing', 'Analytics dashboard', 'Team management', 'API integration'],
        techStack: {
          frontend: 'React + TypeScript',
          backend: 'Node.js + Prisma',
          database: 'PostgreSQL',
          auth: 'NextAuth.js'
        }
      }
    },
    {
      name: 'Mobile App Backend',
      description: 'RESTful API backend for mobile applications with real-time features',
      category: 'Mobile',
      templateData: {
        features: ['REST API', 'Real-time messaging', 'Push notifications', 'File uploads', 'User management'],
        techStack: {
          backend: 'Node.js + Express',
          database: 'MongoDB',
          realtime: 'Socket.io',
          storage: 'AWS S3'
        }
      }
    }
  ]

  for (const template of templates) {
    await prisma.template.create({
      data: template
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log(`📊 Created ${templates.length} templates`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })