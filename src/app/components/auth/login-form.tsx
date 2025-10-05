'use client'

/**
 * Login Form Component
 *
 * Uses Better-Auth useAuth hook with Zod form validation (react-hook-form)
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoginRequestSchema, type LoginRequest } from '@/app/contracts/auth'
import { useAuth } from '@/lib/auth/client'
import { Button } from '@/app/components/ui/button'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, isLoading, error: authError } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(LoginRequestSchema),
    defaultValues: {
      remember: false,
    },
  })

  const onSubmit = async (data: LoginRequest) => {
    setServerError(null)

    try {
      await signIn(data)

      // Redirect to returnTo URL or dashboard on success
      const returnTo = searchParams.get('returnTo') || '/dashboard'
      router.push(returnTo)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Login failed')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

      <div className="flex items-center">
        <input {...register('remember')} id="remember" type="checkbox" className="mr-2" />
        <label htmlFor="remember" className="text-sm">
          Remember me
        </label>
      </div>

      {(serverError || authError) && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {serverError || authError}
        </div>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Signing in...' : 'Sign in'}
      </Button>

      <div className="text-center text-sm">
        <a href="/forgot-password" className="text-blue-600 hover:underline">
          Forgot password?
        </a>
      </div>
    </form>
  )
}
