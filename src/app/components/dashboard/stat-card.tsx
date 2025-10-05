/**
 * Stat Card Component
 *
 * Displays a single statistic with optional change indicator
 */

import type { StatWidgetData } from '@/app/contracts/dashboard'

interface StatCardProps {
  title: string
  description?: string
  data: StatWidgetData
}

export function StatCard({ title, description, data }: StatCardProps) {
  const getChangeColor = () => {
    if (!data.change_type) return 'text-gray-600'
    switch (data.change_type) {
      case 'increase':
        return 'text-green-600'
      case 'decrease':
        return 'text-red-600'
      case 'neutral':
        return 'text-gray-600'
    }
  }

  const getChangeIcon = () => {
    if (!data.change_type || data.change_type === 'neutral') return null
    if (data.change_type === 'increase') {
      return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      )
    }
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    )
  }

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
        <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
          <div className="flex items-baseline text-2xl font-semibold text-gray-900">
            {data.value}
          </div>

          {data.change !== undefined && (
            <div
              className={`inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium md:mt-2 lg:mt-0 ${getChangeColor()}`}
            >
              {getChangeIcon()}
              <span className="ml-1">{Math.abs(data.change)}%</span>
            </div>
          )}
        </dd>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
    </div>
  )
}
