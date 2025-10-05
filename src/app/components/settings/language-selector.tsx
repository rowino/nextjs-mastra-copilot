'use client'

/**
 * Language Selector Component
 *
 * Allows users to select their preferred language
 */

import { useState } from 'react'
import { useAuth } from '@/lib/auth/client'
import { updateSettings } from '@/lib/api/settings'

interface LanguageSelectorProps {
  currentLanguage: string
  onLanguageChange?: (language: string) => void
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'ja', name: '日本語' },
  { code: 'zh', name: '中文' },
]

export function LanguageSelector({ currentLanguage, onLanguageChange }: LanguageSelectorProps) {
  const { session } = useAuth()
  const [language, setLanguage] = useState(currentLanguage)
  const [isLoading, setIsLoading] = useState(false)

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value
    if (!session?.token) return

    setLanguage(newLanguage)
    setIsLoading(true)

    try {
      await updateSettings(session.token, { language: newLanguage })

      if (onLanguageChange) {
        onLanguageChange(newLanguage)
      }
    } catch (err) {
      // Revert on error
      setLanguage(currentLanguage)
      console.error('[Language Selector] Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <label htmlFor="language" className="block text-sm font-medium text-gray-700">
        Language
      </label>
      <select
        id="language"
        value={language}
        onChange={handleLanguageChange}
        disabled={isLoading}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  )
}
