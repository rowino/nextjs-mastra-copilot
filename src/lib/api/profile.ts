/**
 * Profile API Client
 *
 * API functions for profile management using GraphQL
 */

import { createClient, cacheExchange, fetchExchange } from 'urql'
import {
  PROFILE_QUERY,
  UPDATE_PROFILE_MUTATION,
  UPLOAD_AVATAR_MUTATION,
  DELETE_AVATAR_MUTATION,
  CHANGE_PASSWORD_MUTATION,
} from '@/lib/graphql/operations'
import type {
  GetProfileResponse,
  UpdateProfileRequest,
  UploadAvatarResponse,
  ChangePasswordRequest,
} from '@/app/contracts/profile'

const GRAPHQL_URL = process.env.NEXT_PUBLIC_LARAVEL_GRAPHQL_URL || 'http://localhost:8000/graphql'

function createGraphQLClient(token: string) {
  return createClient({
    url: GRAPHQL_URL,
    exchanges: [cacheExchange, fetchExchange],
    fetchOptions: {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  })
}

/**
 * Get current user's profile
 */
export async function getProfile(token: string): Promise<GetProfileResponse> {
  const client = createGraphQLClient(token)
  const result = await client.query(PROFILE_QUERY, {}).toPromise()

  if (result.error) {
    throw new Error(result.error.message)
  }

  if (!result.data?.profile) {
    throw new Error('Profile not found')
  }

  // Map GraphQL response to contract format
  return {
    id: parseInt(result.data.profile.id),
    user_id: parseInt(result.data.profile.userId),
    name: result.data.profile.name,
    email: result.data.profile.email,
    avatar_url: result.data.profile.avatarUrl || null,
    bio: result.data.profile.bio || null,
    created_at: result.data.profile.createdAt,
    updated_at: result.data.profile.updatedAt,
  }
}

/**
 * Update profile information
 */
export async function updateProfile(
  token: string,
  data: UpdateProfileRequest
): Promise<GetProfileResponse> {
  const client = createGraphQLClient(token)
  const result = await client
    .mutation(UPDATE_PROFILE_MUTATION, {
      input: data,
    })
    .toPromise()

  if (result.error) {
    throw new Error(result.error.message)
  }

  if (!result.data?.updateProfile) {
    throw new Error('Failed to update profile')
  }

  // Map GraphQL response to contract format
  return {
    id: parseInt(result.data.updateProfile.id),
    user_id: parseInt(result.data.updateProfile.userId),
    name: result.data.updateProfile.name,
    email: result.data.updateProfile.email,
    avatar_url: result.data.updateProfile.avatarUrl || null,
    bio: result.data.updateProfile.bio || null,
    created_at: result.data.updateProfile.createdAt,
    updated_at: result.data.updateProfile.updatedAt,
  }
}

/**
 * Upload avatar image
 */
export async function uploadAvatar(token: string, file: File): Promise<UploadAvatarResponse> {
  const client = createGraphQLClient(token)
  const result = await client
    .mutation(UPLOAD_AVATAR_MUTATION, {
      avatar: file,
    })
    .toPromise()

  if (result.error) {
    throw new Error(result.error.message)
  }

  if (!result.data?.uploadAvatar) {
    throw new Error('Failed to upload avatar')
  }

  return {
    message: 'Avatar uploaded successfully',
    avatar_url: result.data.uploadAvatar.avatarUrl || '',
  }
}

/**
 * Delete avatar image
 */
export async function deleteAvatar(token: string): Promise<void> {
  const client = createGraphQLClient(token)
  const result = await client.mutation(DELETE_AVATAR_MUTATION, {}).toPromise()

  if (result.error) {
    throw new Error(result.error.message)
  }
}

/**
 * Change password
 */
export async function changePassword(token: string, data: ChangePasswordRequest): Promise<void> {
  const client = createGraphQLClient(token)

  // Map contract field names to GraphQL field names
  const input = {
    currentPassword: data.current_password,
    password: data.password,
    passwordConfirmation: data.password_confirmation,
  }

  const result = await client
    .mutation(CHANGE_PASSWORD_MUTATION, {
      input,
    })
    .toPromise()

  if (result.error) {
    throw new Error(result.error.message)
  }
}
