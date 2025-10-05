/**
 * Dashboard API Client
 *
 * API functions for dashboard data using GraphQL
 */

import { createClient, cacheExchange, fetchExchange } from 'urql'
import { DASHBOARD_QUERY, DASHBOARD_STATS_QUERY } from '@/lib/graphql/operations'
import type { GetDashboardResponse, GetStatsResponse } from '@/app/contracts/dashboard'

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
 * Get complete dashboard data
 */
export async function getDashboard(token: string): Promise<GetDashboardResponse> {
  const client = createGraphQLClient(token)
  const result = await client.query(DASHBOARD_QUERY, {}).toPromise()

  if (result.error) {
    throw new Error(result.error.message)
  }

  if (!result.data?.dashboard) {
    throw new Error('Dashboard not found')
  }

  const { dashboard } = result.data

  // Map GraphQL response to contract format
  return {
    user: {
      id: parseInt(dashboard.user.id),
      name: dashboard.user.name,
      email: dashboard.user.email,
      avatar_url: null, // User type doesn't have avatarUrl in GraphQL
    },
    stats: {
      total_logins: dashboard.stats.totalLogins,
      last_login_at: dashboard.stats.lastLoginAt || null,
      account_age_days: dashboard.stats.accountAgeInDays,
      profile_completion: 0, // Not available in GraphQL schema
    },
    widgets: dashboard.widgets.map((w) => ({
      id: parseInt(w.id),
      type: w.type.toLowerCase() as 'stat' | 'chart' | 'list',
      title: w.title,
      description: '', // Not available in GraphQL schema
      data: w.data,
    })),
    recent_activity: dashboard.recentActivities.map((a) => ({
      id: parseInt(a.id),
      type: a.type.toLowerCase() as
        | 'login'
        | 'logout'
        | 'profile_update'
        | 'settings_change'
        | 'password_change'
        | 'account_deletion'
        | 'failed_login',
      description: a.description,
      created_at: a.createdAt,
    })),
  }
}

/**
 * Get user statistics only
 */
export async function getStats(token: string): Promise<GetStatsResponse> {
  const client = createGraphQLClient(token)
  const result = await client.query(DASHBOARD_STATS_QUERY, {}).toPromise()

  if (result.error) {
    throw new Error(result.error.message)
  }

  if (!result.data?.dashboardStats) {
    throw new Error('Stats not found')
  }

  // Map GraphQL response to contract format
  return {
    total_logins: result.data.dashboardStats.totalLogins,
    last_login_at: result.data.dashboardStats.lastLoginAt || null,
    account_age_days: result.data.dashboardStats.accountAgeInDays,
    profile_completion: 0, // Not available in GraphQL schema
  }
}
