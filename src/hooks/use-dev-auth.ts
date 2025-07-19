import { useEffect, useState } from 'react'

interface DevUser {
  id: string
  email: string
  name: string
}

/**
 * Development authentication hook
 * Provides a mock user session when NEXT_PUBLIC_ENABLE_DEV_AUTH is true
 */
export function useDevAuth() {
  const [devUser, setDevUser] = useState<DevUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const isDevMode = process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH === "true" && process.env.NODE_ENV === "development"
    
    if (isDevMode) {
      // Simulate loading time
      setTimeout(() => {
        setDevUser({
          id: 'dev-user-id',
          email: process.env.NEXT_PUBLIC_DEV_USER_EMAIL || 'dev@example.com',
          name: process.env.NEXT_PUBLIC_DEV_USER_NAME || 'Development User'
        })
        setIsLoading(false)
      }, 100)
    } else {
      setIsLoading(false)
    }
  }, [])

  return {
    user: devUser,
    isLoading,
    isDevMode: process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH === "true" && process.env.NODE_ENV === "development"
  }
}