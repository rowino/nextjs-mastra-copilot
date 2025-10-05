'use client'

/**
 * Notification Preferences Component
 *
 * Manages user notification settings
 */

import { useState } from 'react'
import { useAuth } from '@/lib/auth/client'
import { updateSettings } from '@/lib/api/settings'
import type { NotificationPreferences } from '@/app/contracts/settings'

interface NotificationPreferencesProps {
  currentPreferences: NotificationPreferences
  onPreferencesChange?: (preferences: NotificationPreferences) => void
}

export function NotificationPreferencesComponent({
  currentPreferences,
  onPreferencesChange,
}: NotificationPreferencesProps) {
  const { session } = useAuth()
  const [preferences, setPreferences] = useState(currentPreferences)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async (key: keyof NotificationPreferences) => {
    if (!session?.token) return

    const newPreferences = {
      ...preferences,
      [key]: !preferences[key],
    }

    setPreferences(newPreferences)
    setIsLoading(true)

    try {
      await updateSettings(session.token, { notification_preferences: newPreferences })

      if (onPreferencesChange) {
        onPreferencesChange(newPreferences)
      }
    } catch (err) {
      // Revert on error
      setPreferences(currentPreferences)
      console.error('[Notification Preferences] Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">Notification Preferences</label>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Email notifications</p>
            <p className="text-sm text-gray-500">Receive notifications via email</p>
          </div>
          <button
            type="button"
            onClick={() => handleToggle('email')}
            disabled={isLoading}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              preferences.email ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                preferences.email ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Push notifications</p>
            <p className="text-sm text-gray-500">Receive push notifications in browser</p>
          </div>
          <button
            type="button"
            onClick={() => handleToggle('push')}
            disabled={isLoading}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              preferences.push ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                preferences.push ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">SMS notifications</p>
            <p className="text-sm text-gray-500">Receive notifications via SMS</p>
          </div>
          <button
            type="button"
            onClick={() => handleToggle('sms')}
            disabled={isLoading}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              preferences.sms ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                preferences.sms ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
