'use client'

/**
 * Register Form Component
 *
 * Uses Better-Auth useAuth hook with Zod form validation (react-hook-form)
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { RegisterRequestSchema, type RegisterRequest } from '@/app/contracts/auth'
import { useAuth } from '@/lib/auth/client'
import { Button } from '@/app/components/ui/button'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function RegisterForm() {
  const router = useRouter()
  const { signUp, isLoading, error: authError } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterRequest>({
    resolver: zodResolver(RegisterRequestSchema),
  })

  const onSubmit = async (data: RegisterRequest) => {
    setServerError(null)
    setSuccess(false)

    try {
      await signUp(data)

      // Show success message
      setSuccess(true)

      // Redirect to verification page after 2 seconds
      setTimeout(() => {
        router.push('/verify-email')
      }, 2000)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Registration failed')
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
        <p className="font-medium">Registration successful!</p>
        <p className="text-sm mt-1">Please check your email to verify your account.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Name
        </label>
        <input
          {...register('name')}
          id="name"
          type="text"
          className="w-full px-3 py-2 border rounded-md"
          placeholder="John Doe"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          {...register('email')}
          id="email"
          type="email"
          className="w-full px-3 py-2 border rounded-md"
          placeholder="you@example.com"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <input
          {...register('password')}
          id="password"
          type="password"
          className="w-full px-3 py-2 border rounded-md"
          placeholder="••••••••"
        />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
      </div>

      <div>
        <label htmlFor="password_confirmation" className="block text-sm font-medium mb-1">
          Confirm Password
        </label>
        <input
          {...register('password_confirmation')}
          id="password_confirmation"
          type="password"
          className="w-full px-3 py-2 border rounded-md"
          placeholder="••••••••"
        />
        {errors.password_confirmation && (
          <p className="text-red-500 text-sm mt-1">{errors.password_confirmation.message}</p>
        )}
      </div>

      {(serverError || authError) && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {serverError || authError}
        </div>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Creating account...' : 'Create account'}
      </Button>

      <div className="text-center text-sm">
        Already have an account?{' '}
        <a href="/login" className="text-blue-600 hover:underline">
          Sign in
        </a>
      </div>
    </form>
  )
}
