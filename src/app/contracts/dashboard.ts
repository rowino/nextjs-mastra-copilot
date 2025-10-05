/**
 * Dashboard API Contracts (Laravel API)
 *
 * Zod schemas for dashboard data endpoints:
 * - Get dashboard overview (dummy/placeholder data)
 * - Get user stats
 *
 * Note: This is a starter template, so dashboard data is primarily
 * placeholder/dummy data to demonstrate the UI structure.
 */

import { z } from 'zod'

//=============================================================================
// Shared Schemas
//=============================================================================

/**
 * User statistics for dashboard display
 */
export const UserStatsSchema = z.object({
  total_logins: z.number().int().nonnegative(),
  last_login_at: z.string().nullable(), // ISO 8601 timestamp
  account_age_days: z.number().int().nonnegative(),
  profile_completion: z.number().min(0).max(100),
})

export type UserStats = z.infer<typeof UserStatsSchema>

/**
 * Generic widget data structure for dashboard tiles
 */
export const WidgetSchema = z.object({
  id: z.number().int(),
  type: z.enum(['stat', 'chart', 'list']),
  title: z.string(),
  description: z.string().optional(),
  data: z.any(), // Flexible structure for different widget types
})

export type Widget = z.infer<typeof WidgetSchema>

/**
 * Recent activity log entries
 */
export const ActivitySchema = z.object({
  id: z.number(),
  type: z.enum([
    'login',
    'logout',
    'profile_update',
    'settings_change',
    'password_change',
    'account_deletion',
    'failed_login',
  ]),
  description: z.string(),
  created_at: z.string(), // ISO 8601 timestamp
})

export type Activity = z.infer<typeof ActivitySchema>

//=============================================================================
// GET /api/dashboard
//=============================================================================

/**
 * Returns complete dashboard data including user info, stats, widgets, and activity
 */
export const GetDashboardResponseSchema = z.object({
  user: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
    avatar_url: z.string().url().nullable(),
  }),
  stats: UserStatsSchema,
  widgets: z.array(WidgetSchema),
  recent_activity: z.array(ActivitySchema),
})

export type GetDashboardResponse = z.infer<typeof GetDashboardResponseSchema>

//=============================================================================
// GET /api/dashboard/stats
//=============================================================================

/**
 * Returns only user statistics
 */
export const GetStatsResponseSchema = UserStatsSchema

export type GetStatsResponse = z.infer<typeof GetStatsResponseSchema>

//=============================================================================
// Widget Data Type Examples (for reference)
//=============================================================================

/**
 * Stat widget data (single metric display)
 */
export const StatWidgetDataSchema = z.object({
  value: z.union([z.string(), z.number()]),
  change: z.number().optional(), // Percentage change from previous period
  change_type: z.enum(['increase', 'decrease', 'neutral']).optional(),
})

export type StatWidgetData = z.infer<typeof StatWidgetDataSchema>

/**
 * Chart widget data (for line/bar charts)
 */
export const ChartWidgetDataSchema = z.object({
  labels: z.array(z.string()),
  datasets: z.array(z.object({
    label: z.string(),
    data: z.array(z.number()),
    backgroundColor: z.string().optional(),
    borderColor: z.string().optional(),
  })),
})

export type ChartWidgetData = z.infer<typeof ChartWidgetDataSchema>

/**
 * List widget data (for recent items)
 */
export const ListWidgetDataSchema = z.object({
  items: z.array(z.object({
    id: z.union([z.string(), z.number()]),
    title: z.string(),
    subtitle: z.string().optional(),
    timestamp: z.string().optional(),
  })),
})

export type ListWidgetData = z.infer<typeof ListWidgetDataSchema>

//=============================================================================
// Error Response (all endpoints) - Laravel standard error format
//=============================================================================

export const DashboardErrorResponseSchema = z.object({
  message: z.string(),
  errors: z.record(z.array(z.string())).optional(),
})

export type DashboardErrorResponse = z.infer<typeof DashboardErrorResponseSchema>
