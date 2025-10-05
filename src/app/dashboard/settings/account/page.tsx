'use client'

/**
 * Account Settings Page
 *
 * Account management and deletion
 */

import { useState } from 'react'
import { useAuth } from '@/lib/auth/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/app/components/ui/button'

export default function AccountSettingsPage() {
  const { session, user, signOut } = useAuth()
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleDeleteAccount = async () => {
    if (!session?.token) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      const response = await fetch('/api/auth/user', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete account')
      }

      // Sign out and redirect
      await signOut()
      router.push('/')
    } catch (err) {
      console.error('[Account Settings] Delete error:', err)
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account')
      setIsDeleting(false)
    }
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Account</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account settings</p>
      </div>

      <div className="space-y-6">
        {/* Account Information */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Account Information</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.email || 'Not available'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.name || 'Not set'}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Delete Account */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Delete Account</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>
                Once you delete your account, you will lose all data associated with it. This action cannot be
                undone.
              </p>
            </div>
            <div className="mt-5">
              {!showDeleteConfirm ? (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                >
                  Delete Account
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-sm text-red-800 font-medium">
                      Are you absolutely sure? This action cannot be undone.
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowDeleteConfirm(false)
                        setDeleteError(null)
                      }}
                      disabled={isDeleting}
                    >
                      Cancel
                    </Button>
                  </div>
                  {deleteError && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <p className="text-sm text-red-800">{deleteError}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
