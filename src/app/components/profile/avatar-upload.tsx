'use client'

/**
 * Avatar Upload Component
 *
 * Handles avatar image upload with preview
 */

import { useState } from 'react'
import { useAuth } from '@/lib/auth/client'
import { uploadAvatar, deleteAvatar } from '@/lib/api/profile'
import { Button } from '@/app/components/ui/button'

interface AvatarUploadProps {
  currentAvatarUrl?: string | null
  onSuccess?: (newAvatarUrl: string) => void
}

export function AvatarUpload({ currentAvatarUrl, onSuccess }: AvatarUploadProps) {
  const { session } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !session?.token) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (4MB max)
    if (file.size > 4 * 1024 * 1024) {
      setError('Image must be less than 4MB')
      return
    }

    setError(null)
    setIsUploading(true)

    // Show preview immediately
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)

    try {
      const result = await uploadAvatar(session.token, file)

      if (onSuccess) {
        onSuccess(result.avatar_url)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar')
      setPreviewUrl(currentAvatarUrl || null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!session?.token || !currentAvatarUrl) return

    setIsDeleting(true)
    setError(null)

    try {
      await deleteAvatar(session.token)
      setPreviewUrl(null)

      if (onSuccess) {
        onSuccess('')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete avatar')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        {/* Avatar Preview */}
        <div className="relative">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Avatar"
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-3xl text-gray-400">?</span>
            </div>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
            </div>
          )}
        </div>

        {/* Upload/Delete Controls */}
        <div className="flex-1 space-y-2">
          <div className="flex space-x-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploading}
                onClick={(e) => {
                  e.preventDefault()
                  ;(e.currentTarget.previousElementSibling as HTMLInputElement)?.click()
                }}
              >
                {isUploading ? 'Uploading...' : 'Change avatar'}
              </Button>
            </label>

            {previewUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Remove'}
              </Button>
            )}
          </div>

          <p className="text-xs text-gray-500">
            JPG, PNG or GIF. Max size 4MB.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
