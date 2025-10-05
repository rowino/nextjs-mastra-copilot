/**
 * Settings API Client
 *
 * API functions for user settings management using GraphQL
 */

import { createClient, cacheExchange, fetchExchange } from 'urql'
import {
  SETTINGS_QUERY,
  UPDATE_SETTINGS_MUTATION,
  RESET_SETTINGS_MUTATION,
} from '@/lib/graphql/operations'
import type {
  GetSettingsResponse,
  UpdateSettingsRequest,
  ResetSettingsResponse,
} from '@/app/contracts/settings'

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
 * Get current user's settings
 */
export async function getSettings(token: string): Promise<GetSettingsResponse> {
  const client = createGraphQLClient(token)
  const result = await client.query(SETTINGS_QUERY, {}).toPromise()

  if (result.error) {
    throw new Error(result.error.message)
  }

  if (!result.data?.settings) {
    throw new Error('Settings not found')
  }

  // Map GraphQL response to contract format
  return {
    id: parseInt(result.data.settings.id),
    user_id: parseInt(result.data.settings.userId),
    theme: result.data.settings.theme.toLowerCase() as 'light' | 'dark' | 'system',
    language: result.data.settings.language,
    timezone: result.data.settings.timezone,
    notification_preferences: {
      email: result.data.settings.notificationsEmail,
      push: result.data.settings.notificationsPush,
      sms: result.data.settings.notificationsSms,
    },
    created_at: result.data.settings.createdAt,
    updated_at: result.data.settings.updatedAt,
  }
}

/**
 * Update settings
 */
export async function updateSettings(
  token: string,
  data: UpdateSettingsRequest
): Promise<GetSettingsResponse> {
  const client = createGraphQLClient(token)

  // Map contract format to GraphQL input
  const input: Record<string, string | boolean> = {}
  if (data.theme) input.theme = data.theme.toUpperCase()
  if (data.language) input.language = data.language
  if (data.timezone) input.timezone = data.timezone
  if (data.notification_preferences) {
    if (data.notification_preferences.email !== undefined)
      input.notificationsEmail = data.notification_preferences.email
    if (data.notification_preferences.push !== undefined)
      input.notificationsPush = data.notification_preferences.push
    if (data.notification_preferences.sms !== undefined)
      input.notificationsSms = data.notification_preferences.sms
  }

  const result = await client
    .mutation(UPDATE_SETTINGS_MUTATION, {
      input,
    })
    .toPromise()

  if (result.error) {
    throw new Error(result.error.message)
  }

  if (!result.data?.updateSettings) {
    throw new Error('Failed to update settings')
  }

  // Map GraphQL response to contract format
  return {
    id: parseInt(result.data.updateSettings.id),
    user_id: parseInt(result.data.updateSettings.userId),
    theme: result.data.updateSettings.theme.toLowerCase() as 'light' | 'dark' | 'system',
    language: result.data.updateSettings.language,
    timezone: result.data.updateSettings.timezone,
    notification_preferences: {
      email: result.data.updateSettings.notificationsEmail,
      push: result.data.updateSettings.notificationsPush,
      sms: result.data.updateSettings.notificationsSms,
    },
    created_at: result.data.updateSettings.createdAt,
    updated_at: result.data.updateSettings.updatedAt,
  }
}

/**
 * Reset settings to defaults
 */
export async function resetSettings(token: string): Promise<ResetSettingsResponse> {
  const client = createGraphQLClient(token)
  const result = await client.mutation(RESET_SETTINGS_MUTATION, {}).toPromise()

  if (result.error) {
    throw new Error(result.error.message)
  }

  if (!result.data?.resetSettings) {
    throw new Error('Failed to reset settings')
  }

  return {
    message: 'Settings reset to defaults',
    settings: {
      id: parseInt(result.data.resetSettings.id),
      user_id: parseInt(result.data.resetSettings.userId),
      theme: result.data.resetSettings.theme.toLowerCase() as 'light' | 'dark' | 'system',
      language: result.data.resetSettings.language,
      timezone: result.data.resetSettings.timezone,
      notification_preferences: {
        email: result.data.resetSettings.notificationsEmail,
        push: result.data.resetSettings.notificationsPush,
        sms: result.data.resetSettings.notificationsSms,
      },
      created_at: result.data.resetSettings.createdAt,
      updated_at: result.data.resetSettings.updatedAt,
    },
  }
}
