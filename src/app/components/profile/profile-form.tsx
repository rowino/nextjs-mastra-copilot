'use client'

/**
 * Profile Form Component
 *
 * Edit profile information using Server Actions pattern with Zod validation
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UpdateProfileRequestSchema, type UpdateProfileRequest } from '@/app/contracts/profile'
import { useAuth } from '@/lib/auth/client'
import { updateProfile } from '@/lib/api/profile'
import { Button } from '@/app/components/ui/button'
import { useState, useEffect } from 'react'

interface ProfileFormProps {
  initialData?: {
    name: string
    bio?: string | null
  }
  onSuccess?: () => void
}

export function ProfileForm({ initialData, onSuccess }: ProfileFormProps) {
  const { session } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<UpdateProfileRequest>({
    resolver: zodResolver(UpdateProfileRequestSchema),
    defaultValues: {
      name: initialData?.name || '',
      bio: initialData?.bio || '',
    },
  })

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(isDirty)
  }, [isDirty])

  // Warn before navigating away with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  const onSubmit = async (data: UpdateProfileRequest) => {
    if (!session?.token) return

    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await updateProfile(session.token, data)
      setSuccess(true)
      setHasUnsavedChanges(false)
      reset(data) // Reset form with new values

      if (onSuccess) {
        onSuccess()
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          {...register('name')}
          id="name"
          type="text"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
          Bio
        </label>
        <textarea
          {...register('bio')}
          id="bio"
          rows={4}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Tell us about yourself..."
        />
        {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          Profile updated successfully!
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading || !hasUnsavedChanges}>
          {isLoading ? 'Saving...' : 'Save changes'}
        </Button>
      </div>

      {hasUnsavedChanges && (
        <p className="text-sm text-amber-600">You have unsaved changes</p>
      )}
    </form>
  )
}
