'use client'

/**
 * Profile Security Page
 *
 * Manage password and authentication settings
 */

import { PasswordForm } from '@/app/components/profile/password-form'

export default function ProfileSecurityPage() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Security</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your password and authentication</p>
      </div>

      <div className="space-y-6">
        {/* Change Password */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Change Password
            </h3>
            <PasswordForm />
          </div>
        </div>

        {/* Multi-Factor Authentication (Placeholder for future) */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Multi-Factor Authentication
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Add an extra layer of security to your account
            </p>
            <div className="mt-4">
              <button
                disabled
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-400 bg-gray-100 cursor-not-allowed"
              >
                Coming soon
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
