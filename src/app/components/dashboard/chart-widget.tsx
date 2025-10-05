'use client'

/**
 * Chart Widget Component
 *
 * Displays chart data using a simple bar chart visualization
 */

import type { ChartWidgetData } from '@/app/contracts/dashboard'

interface ChartWidgetProps {
  title: string
  description?: string
  data: ChartWidgetData
}

export function ChartWidget({ title, description, data }: ChartWidgetProps) {
  // Find max value for scaling
  const maxValue = Math.max(
    ...data.datasets.flatMap((dataset) => dataset.data),
    1 // Minimum 1 to avoid division by zero
  )

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}

        <div className="mt-6">
          {/* Simple bar chart */}
          <div className="space-y-4">
            {data.datasets.map((dataset, datasetIdx) => (
              <div key={datasetIdx}>
                <p className="text-sm font-medium text-gray-700 mb-2">{dataset.label}</p>
                <div className="space-y-2">
                  {dataset.data.map((value, idx) => (
                    <div key={idx} className="flex items-center">
                      <div className="w-24 text-sm text-gray-600">{data.labels[idx]}</div>
                      <div className="flex-1 ml-4">
                        <div className="bg-gray-200 rounded-full h-6 relative">
                          <div
                            className="bg-blue-600 rounded-full h-6 flex items-center justify-end pr-2"
                            style={{
                              width: `${(value / maxValue) * 100}%`,
                              backgroundColor: dataset.backgroundColor || undefined,
                              borderColor: dataset.borderColor || undefined,
                            }}
                          >
                            <span className="text-xs text-white font-medium">{value}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
