'use client'

/**
 * Appearance Settings Page
 *
 * Theme and language customization
 */

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/client'
import { getSettings } from '@/lib/api/settings'
import { ThemeToggle } from '@/app/components/settings/theme-toggle'
import { LanguageSelector } from '@/app/components/settings/language-selector'

export default function AppearanceSettingsPage() {
  const { session } = useAuth()
  const [settings, setSettings] = useState<{ theme: 'light' | 'dark' | 'system'; language: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSettings() {
      if (!session?.token) return

      try {
        const data = await getSettings(session.token)
        setSettings({
          theme: data.theme,
          language: data.language,
        })
      } catch (err) {
        console.error('[Appearance Settings] Load error:', err)
        setError('Failed to load settings')
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [session?.token])

  if (isLoading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (error || !settings) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">{error || 'Failed to load settings'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Appearance</h1>
        <p className="mt-1 text-sm text-gray-500">Customize theme, language, and display preferences</p>
      </div>

      <div className="space-y-6">
        {/* Theme */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <ThemeToggle
              currentTheme={settings.theme}
              onThemeChange={(theme) => setSettings({ ...settings, theme })}
            />
          </div>
        </div>

        {/* Language */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <LanguageSelector
              currentLanguage={settings.language}
              onLanguageChange={(language) => setSettings({ ...settings, language })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
