'use client'

/**
 * Profile Page
 *
 * View and edit user profile with AI assistance
 */

import { useAuth } from '@/lib/auth/client'
import { useEffect, useState } from 'react'
import { getProfile } from '@/lib/api/profile'
import { ProfileForm } from '@/app/components/profile/profile-form'
import { AvatarUpload } from '@/app/components/profile/avatar-upload'
import type { GetProfileResponse } from '@/app/contracts/profile'
import Link from 'next/link'
import { useCopilotAction } from '@copilotkit/react-core'

export default function ProfilePage() {
  const { session } = useAuth()
  const [profile, setProfile] = useState<GetProfileResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.token) {
        console.log('[Profile] No session token available', { session })
        setIsLoading(false)
        return
      }

      try {
        console.log('[Profile] Fetching with token:', session.token.substring(0, 20) + '...')
        const data = await getProfile(session.token)
        setProfile(data)
      } catch (err) {
        setError('Failed to load profile')
        console.error('[Profile] Error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [session])

  // CopilotKit action for profile completion analysis
  useCopilotAction({
    name: 'get-profile-completion',
    available: 'frontend',
    render: ({ result, status }) => {
      if (status === 'complete' && result) {
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Profile Analysis</h4>
            <div className="space-y-2">
              <p className="text-sm text-blue-800">
                Your profile is <strong>{result.completion_percentage}% complete</strong>
              </p>
              {result.recommendations.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-blue-900">Recommendations:</p>
                  <ul className="list-disc list-inside text-sm text-blue-800">
                    {result.recommendations.map((rec: string, idx: number) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )
      }
      return <></>
    },
  })

  // CopilotKit action for bio improvements
  useCopilotAction({
    name: 'suggest-bio-improvements',
    available: 'frontend',
    render: ({ result, status }) => {
      if (status === 'complete' && result) {
        return (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-medium text-green-900 mb-2">Bio Analysis</h4>
            <div className="space-y-2">
              <p className="text-sm text-green-800">
                Tone: <strong>{result.tone}</strong> | Length: <strong>{result.length_assessment}</strong>
              </p>
              <div>
                <p className="text-sm font-medium text-green-900">Suggestions:</p>
                <ul className="list-disc list-inside text-sm text-green-800">
                  {result.suggestions.map((suggestion: string, idx: number) => (
                    <li key={idx}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )
      }
      return <></>
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your profile information</p>
      </div>

      <div className="space-y-6">
        {/* Avatar Section */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Avatar</h3>
            <AvatarUpload
              currentAvatarUrl={profile?.avatar_url}
              onSuccess={() => {
                // Re-fetch profile after avatar upload
                if (session?.token) {
                  getProfile(session.token).then(setProfile).catch(console.error)
                }
              }}
            />
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Profile Information
            </h3>
            {profile && (
              <ProfileForm
                initialData={{
                  name: profile.name,
                  bio: profile.bio,
                }}
                onSuccess={() => {
                  // Re-fetch profile after update
                  if (session?.token) {
                    getProfile(session.token).then(setProfile).catch(console.error)
                  }
                }}
              />
            )}
          </div>
        </div>

        {/* Security Section Link */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Security</h3>
                <p className="mt-1 text-sm text-gray-500">Manage password and authentication</p>
              </div>
              <Link
                href="/dashboard/profile/security"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                Manage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
