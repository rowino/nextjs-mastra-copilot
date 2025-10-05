'use client'

/**
 * Theme Toggle Component
 *
 * Allows users to switch between light, dark, and system themes
 */

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/client'
import { updateSettings } from '@/lib/api/settings'

type Theme = 'light' | 'dark' | 'system'

interface ThemeToggleProps {
  currentTheme: Theme
  onThemeChange?: (theme: Theme) => void
}

export function ThemeToggle({ currentTheme, onThemeChange }: ThemeToggleProps) {
  const { session } = useAuth()
  const [theme, setTheme] = useState<Theme>(currentTheme)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement

    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      // System theme
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (isDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }, [theme])

  const handleThemeChange = async (newTheme: Theme) => {
    if (!session?.token) return

    setTheme(newTheme)
    setIsLoading(true)

    try {
      await updateSettings(session.token, { theme: newTheme })

      if (onThemeChange) {
        onThemeChange(newTheme)
      }
    } catch (err) {
      // Revert on error
      setTheme(currentTheme)
      console.error('[Theme Toggle] Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Theme</label>
      <div className="flex space-x-4">
        <button
          onClick={() => handleThemeChange('light')}
          disabled={isLoading}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            theme === 'light'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Light
        </button>
        <button
          onClick={() => handleThemeChange('dark')}
          disabled={isLoading}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            theme === 'dark'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Dark
        </button>
        <button
          onClick={() => handleThemeChange('system')}
          disabled={isLoading}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            theme === 'system'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          System
        </button>
      </div>
    </div>
  )
}
