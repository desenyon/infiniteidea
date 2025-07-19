"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { motion } from "framer-motion"
import { 
  User, 
  Settings, 
  Bell, 
  Palette, 
  Download, 
  Zap, 
  Crown,
  Check,
  Loader2,
  Save
} from "lucide-react"

interface UserProfile {
  id: string
  name: string
  email: string
  image?: string
  subscription: string
  preferences: {
    theme: "light" | "dark"
    notifications: boolean
    autoSave: boolean
    defaultExportFormat: "pdf" | "markdown" | "json"
    aiProvider?: "openai" | "anthropic" | "auto"
    generationSpeed?: "fast" | "balanced" | "thorough"
  }
  createdAt: string
  _count: {
    projects: number
  }
}

interface SubscriptionInfo {
  currentTier: string
  limits: {
    maxProjects: number
    maxGenerationsPerMonth: number
    features: string[]
  }
  usage: {
    projectCount: number
    generationsThisMonth: number
  }
  memberSince: string
}

export default function SettingsPage() {
  const { user, isAuthenticated } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData()
    }
  }, [isAuthenticated])

  const fetchUserData = async () => {
    try {
      const [profileRes, subscriptionRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/user/subscription"),
      ])

      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setProfile(profileData.data)
      }

      if (subscriptionRes.ok) {
        const subscriptionData = await subscriptionRes.json()
        setSubscription(subscriptionData.data)
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.data)
      }
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreferenceChange = (key: string, value: any) => {
    if (!profile) return
    
    const updatedPreferences = {
      ...profile.preferences,
      [key]: value,
    }
    
    setProfile({
      ...profile,
      preferences: updatedPreferences,
    })
    
    updateProfile({ preferences: updatedPreferences })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-gray-400">Manage your account and preferences</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-white/5 rounded-2xl p-6">
                <nav className="space-y-2">
                  {[
                    { id: "profile", label: "Profile", icon: User },
                    { id: "preferences", label: "Preferences", icon: Settings },
                    { id: "subscription", label: "Subscription", icon: Crown },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? "bg-white text-black"
                          : "text-gray-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3"
            >
              <div className="bg-white/5 rounded-2xl p-8">
                {activeTab === "profile" && profile && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">Name</label>
                        <input
                          type="text"
                          value={profile.name || ""}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          onBlur={() => updateProfile({ name: profile.name })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                          type="email"
                          value={profile.email}
                          disabled
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-gray-400 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/5 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{profile._count.projects}</div>
                        <div className="text-sm text-gray-400">Projects Created</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{profile.subscription}</div>
                        <div className="text-sm text-gray-400">Current Plan</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {new Date(profile.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-400">Member Since</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "preferences" && profile && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-6">Preferences</h2>
                    
                    <div className="space-y-6">
                      {/* Theme */}
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Palette className="w-5 h-5" />
                          <div>
                            <div className="font-medium">Theme</div>
                            <div className="text-sm text-gray-400">Choose your preferred theme</div>
                          </div>
                        </div>
                        <select
                          value={profile.preferences.theme}
                          onChange={(e) => handlePreferenceChange("theme", e.target.value)}
                          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                        >
                          <option value="dark">Dark</option>
                          <option value="light">Light</option>
                        </select>
                      </div>

                      {/* Notifications */}
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Bell className="w-5 h-5" />
                          <div>
                            <div className="font-medium">Notifications</div>
                            <div className="text-sm text-gray-400">Receive email notifications</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handlePreferenceChange("notifications", !profile.preferences.notifications)}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            profile.preferences.notifications ? "bg-white" : "bg-white/20"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-black transition-transform ${
                              profile.preferences.notifications ? "translate-x-6" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>

                      {/* Auto Save */}
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Save className="w-5 h-5" />
                          <div>
                            <div className="font-medium">Auto Save</div>
                            <div className="text-sm text-gray-400">Automatically save your work</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handlePreferenceChange("autoSave", !profile.preferences.autoSave)}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            profile.preferences.autoSave ? "bg-white" : "bg-white/20"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-black transition-transform ${
                              profile.preferences.autoSave ? "translate-x-6" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>

                      {/* Default Export Format */}
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Download className="w-5 h-5" />
                          <div>
                            <div className="font-medium">Default Export Format</div>
                            <div className="text-sm text-gray-400">Preferred format for exports</div>
                          </div>
                        </div>
                        <select
                          value={profile.preferences.defaultExportFormat}
                          onChange={(e) => handlePreferenceChange("defaultExportFormat", e.target.value)}
                          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                        >
                          <option value="pdf">PDF</option>
                          <option value="markdown">Markdown</option>
                          <option value="json">JSON</option>
                        </select>
                      </div>

                      {/* AI Provider */}
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Zap className="w-5 h-5" />
                          <div>
                            <div className="font-medium">AI Provider</div>
                            <div className="text-sm text-gray-400">Preferred AI service</div>
                          </div>
                        </div>
                        <select
                          value={profile.preferences.aiProvider || "auto"}
                          onChange={(e) => handlePreferenceChange("aiProvider", e.target.value)}
                          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                        >
                          <option value="auto">Auto</option>
                          <option value="openai">OpenAI</option>
                          <option value="anthropic">Anthropic</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "subscription" && subscription && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-6">Subscription</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Current Plan */}
                      <div className="md:col-span-2 p-6 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3 mb-4">
                          <Crown className="w-6 h-6 text-yellow-400" />
                          <h3 className="text-xl font-bold">Current Plan: {subscription.currentTier}</h3>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Projects</span>
                            <span>
                              {subscription.usage.projectCount}
                              {subscription.limits.maxProjects > 0 && ` / ${subscription.limits.maxProjects}`}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Generations this month</span>
                            <span>
                              {subscription.usage.generationsThisMonth}
                              {subscription.limits.maxGenerationsPerMonth > 0 && ` / ${subscription.limits.maxGenerationsPerMonth}`}
                            </span>
                          </div>
                        </div>

                        <div className="mt-6">
                          <h4 className="font-medium mb-3">Features</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {subscription.limits.features.map((feature) => (
                              <div key={feature} className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-400" />
                                <span className="text-sm capitalize">{feature.replace("_", " ")}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Usage Stats */}
                      <div className="p-6 bg-white/5 rounded-lg">
                        <h3 className="text-lg font-bold mb-4">Usage</h3>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Projects</span>
                              <span>{subscription.usage.projectCount}</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2">
                              <div
                                className="bg-white rounded-full h-2 transition-all"
                                style={{
                                  width: subscription.limits.maxProjects > 0
                                    ? `${Math.min((subscription.usage.projectCount / subscription.limits.maxProjects) * 100, 100)}%`
                                    : "0%"
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isSaving && (
                  <div className="fixed bottom-4 right-4 bg-white text-black px-4 py-2 rounded-lg flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}