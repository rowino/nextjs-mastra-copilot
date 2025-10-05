"use client";

import { useCoAgent, useCopilotAction } from "@copilotkit/react-core";
import { CopilotKitCSSProperties, CopilotSidebar } from "@copilotkit/react-ui";
import { useState, useEffect } from "react";
import { AgentState as AgentStateSchema } from "@/mastra/agents";
import { z } from "zod";
import { WeatherToolResult } from "@/mastra/tools";
import { useAuth } from "@/lib/auth/client";
import { getDashboard } from "@/lib/api/dashboard";
import type { GetDashboardResponse } from "@/app/contracts/dashboard";

type AgentState = z.infer<typeof AgentStateSchema>;

export default function DashboardPage() {
  const [themeColor, setThemeColor] = useState("#6366f1");
  const { session, user } = useAuth();
  const [dashboard, setDashboard] = useState<GetDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      if (!session?.token) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await getDashboard(session.token);
        setDashboard(data);
      } catch (err) {
        console.error('[Dashboard] Error:', err);
        // Set dummy data on error
        setDashboard({
          user: {
            id: 1,
            name: user?.name || 'Guest',
            email: user?.email || 'guest@example.com',
            avatar_url: null,
          },
          stats: {
            total_logins: 42,
            last_login_at: new Date().toISOString(),
            account_age_days: 7,
            profile_completion: 85,
          },
          widgets: [
            // Stat widgets
            {
              id: 1,
              type: 'stat' as const,
              title: 'Total Logins',
              description: 'Number of times you logged in',
              data: { value: 42, change: '+5' },
            },
            {
              id: 2,
              type: 'stat' as const,
              title: 'Account Age',
              description: 'Days since account creation',
              data: { value: '7 days', change: '' },
            },
            {
              id: 3,
              type: 'stat' as const,
              title: 'Profile Completion',
              description: 'Percentage of profile fields filled',
              data: { value: '85%', change: '+10%' },
            },
            {
              id: 4,
              type: 'stat' as const,
              title: 'Active Projects',
              description: 'Total active projects',
              data: { value: 12, change: '+3' },
            },
            // Chart widgets
            {
              id: 5,
              type: 'chart' as const,
              title: 'Weekly Activity',
              description: 'Your activity over the past 7 days',
              data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                values: [12, 19, 15, 25, 22, 18, 24],
              },
            },
          ],
          recent_activity: [
            {
              id: 1,
              type: 'login' as const,
              description: 'Logged in from Chrome',
              created_at: new Date().toISOString(),
            },
            {
              id: 2,
              type: 'profile_update' as const,
              description: 'Updated profile information',
              created_at: new Date(Date.now() - 3600000).toISOString(),
            },
            {
              id: 3,
              type: 'settings_change' as const,
              description: 'Changed theme to dark mode',
              created_at: new Date(Date.now() - 7200000).toISOString(),
            },
          ],
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboard();
  }, [session, user]);

  // 🪁 Frontend Actions
  useCopilotAction({
    name: "setThemeColor",
    parameters: [{
      name: "themeColor",
      description: "The theme color to set. Make sure to pick nice colors.",
      required: true,
    }],
    handler({ themeColor }) {
      setThemeColor(themeColor);
    },
  });

  if (isLoading) {
    return (
      <main className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </main>
    );
  }

  return (
    <main style={{ "--copilot-kit-primary-color": themeColor } as CopilotKitCSSProperties} className="h-full">
      <DashboardContent themeColor={themeColor} dashboard={dashboard} />
      <CopilotSidebar
        clickOutsideToClose={false}
        defaultOpen={true}
        labels={{
          title: "AI Assistant",
          initial: "👋 Hi! I'm your dashboard assistant.\n\nTry:\n- \"Set theme to orange\"\n- \"Write a proverb about AI\"\n- \"Get weather in SF\""
        }}
      />
    </main>
  );
}

// Helper function to get appropriate icon for widget
function getWidgetIcon(title: string, index: number): string {
  const titleLower = title.toLowerCase();

  // Match by title keywords
  if (titleLower.includes('project')) return '📊';
  if (titleLower.includes('task')) return '✅';
  if (titleLower.includes('user')) return '👥';
  if (titleLower.includes('message') || titleLower.includes('notification')) return '💬';
  if (titleLower.includes('revenue') || titleLower.includes('sales') || titleLower.includes('money')) return '💰';
  if (titleLower.includes('performance') || titleLower.includes('speed')) return '⚡';
  if (titleLower.includes('storage') || titleLower.includes('file')) return '💾';
  if (titleLower.includes('security') || titleLower.includes('alert')) return '🔒';

  // Default icons by index
  const defaultIcons = ['📊', '📈', '💼', '🎯', '⭐', '🔥', '💡', '🚀'];
  return defaultIcons[index % defaultIcons.length];
}

function DashboardContent({
  themeColor,
  dashboard
}: {
  themeColor: string;
  dashboard: GetDashboardResponse | null;
}) {
  const {state, setState} = useCoAgent<AgentState>({
    name: "weatherAgent",
    initialState: {
      proverbs: [
        "AI agents are the future of interactive applications.",
      ],
    },
  })

  useCopilotAction({
    name: "weatherTool",
    description: "Get the weather for a given location.",
    available: "frontend",
    parameters: [
      { name: "location", type: "string", required: true },
    ],
    render: ({ args, result, status }) => {
      return <WeatherCard
        location={args.location}
        themeColor={themeColor}
        result={result}
        status={status}
      />
    },
  });

  useCopilotAction({
    name: "updateWorkingMemory",
    available: "frontend",
    render: ({ args }) => {
      return <div style={{ backgroundColor: themeColor }} className="rounded-2xl max-w-md w-full text-white p-4">
        <p>✨ Memory updated</p>
        <details className="mt-2">
          <summary className="cursor-pointer text-white">See updates</summary>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }} className="overflow-x-auto text-sm bg-white/20 p-4 rounded-lg mt-2">
            {JSON.stringify(args, null, 2)}
          </pre>
        </details>
      </div>
    },
  });

  return (
    <div className="h-full min-h-screen w-full bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Welcome back, <span className="font-semibold">{dashboard?.user.name || 'Guest'}</span>!</p>
          </div>
          <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-700">Online</span>
          </div>
        </div>

        {/* Stats Grid - fully dynamic from backend widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboard?.widgets
            ?.filter((w) => w.type === 'stat')
            .slice(0, 8)
            .map((widget, index) => (
              <StatCard
                key={widget.id}
                title={widget.title}
                value={widget.data.value}
                change={widget.data.change}
                themeColor={themeColor}
                icon={getWidgetIcon(widget.title, index)}
              />
            ))}

          {/* Fallback empty state if no stat widgets */}
          {(!dashboard?.widgets || dashboard.widgets.filter(w => w.type === 'stat').length === 0) && (
            <>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
                <div className="text-center text-gray-400 py-4">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-sm">No stat widgets configured</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Charts and Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Widgets - dynamically render all chart type widgets */}
          {dashboard?.widgets
            ?.filter((w) => w.type === 'chart')
            .slice(0, 2)
            .map((widget, index) => (
              <div
                key={widget.id}
                className={`${index === 0 ? 'lg:col-span-2' : 'lg:col-span-1'} bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-shadow`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{widget.title}</h2>
                    {widget.description && (
                      <p className="text-sm text-gray-500 mt-1">{widget.description}</p>
                    )}
                  </div>
                  <div className="text-3xl">📊</div>
                </div>
                <SimpleBarChart
                  data={widget.data}
                  themeColor={themeColor}
                />
              </div>
            ))}

          {/* Recent Activity - always show even if no chart widgets */}
          {(!dashboard?.widgets?.some(w => w.type === 'chart') ||
            dashboard?.widgets?.filter(w => w.type === 'chart').length < 2) && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
                <div className="text-2xl">⚡</div>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {dashboard?.recent_activity?.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
                {(!dashboard?.recent_activity || dashboard.recent_activity.length === 0) && (
                  <p className="text-gray-400 text-center py-8 text-sm">No recent activity</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Standalone Recent Activity if we have 2+ chart widgets */}
        {(dashboard?.widgets?.filter(w => w.type === 'chart').length ?? 0) >= 2 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
              <div className="text-2xl">⚡</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {dashboard?.recent_activity?.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
              {(!dashboard?.recent_activity || dashboard.recent_activity.length === 0) && (
                <p className="text-gray-400 text-center py-8 text-sm col-span-full">No recent activity</p>
              )}
            </div>
          </div>
        )}

        {/* List Widgets - render any list type widgets */}
        {(dashboard?.widgets?.filter(w => w.type === 'list').length ?? 0) > 0 && dashboard && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dashboard.widgets
              .filter(w => w.type === 'list')
              .slice(0, 4)
              .map((widget) => (
                <div
                  key={widget.id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-shadow"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{widget.title}</h2>
                      {widget.description && (
                        <p className="text-sm text-gray-500 mt-1">{widget.description}</p>
                      )}
                    </div>
                    <div className="text-3xl">📋</div>
                  </div>
                  <div className="space-y-2">
                    {widget.data?.items?.map((item: { id?: string | number; title: string; subtitle?: string; timestamp?: string }, idx: number) => (
                      <div
                        key={item.id || idx}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{item.title}</p>
                          {item.subtitle && (
                            <p className="text-sm text-gray-500 truncate">{item.subtitle}</p>
                          )}
                        </div>
                        {item.timestamp && (
                          <span className="text-xs text-gray-400 ml-2">{item.timestamp}</span>
                        )}
                      </div>
                    ))}
                    {(!widget.data?.items || widget.data.items.length === 0) && (
                      <p className="text-gray-400 text-center py-4 text-sm">No items</p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* AI Proverbs Section */}
        <div className="bg-gradient-to-br from-white/90 to-purple-50/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI Proverbs</h2>
              <p className="text-gray-600 mt-1 text-sm">Wisdom from your AI assistant</p>
            </div>
            <div className="text-3xl">💭</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.proverbs?.map((proverb, index) => (
              <div
                key={index}
                style={{ borderLeftColor: themeColor }}
                className="bg-white/70 backdrop-blur-sm p-5 rounded-xl border-l-4 shadow-md relative group hover:shadow-lg transition-all transform hover:-translate-y-1"
              >
                <p className="pr-8 text-gray-800 leading-relaxed">{proverb}</p>
                <button
                  onClick={() => setState({
                    ...state,
                    proverbs: state.proverbs?.filter((_, i) => i !== index),
                  })}
                  className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity
                    bg-red-500 hover:bg-red-600 text-white rounded-full h-7 w-7 flex items-center justify-center text-sm shadow-lg"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          {state.proverbs?.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤖</div>
              <p className="text-gray-400 italic text-lg">
                No proverbs yet. Ask the assistant to add some!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  themeColor,
  icon
}: {
  title: string;
  value: string | number;
  change?: string;
  themeColor: string;
  icon: string;
}) {
  return (
    <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-white/20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-purple-100/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-extrabold mt-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {change}
              </span>
            </div>
          )}
        </div>
        <div
          style={{ backgroundColor: themeColor }}
          className="text-4xl w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all"
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function SimpleBarChart({
  data,
  themeColor
}: {
  data: { labels: string[]; values: number[] };
  themeColor: string;
}) {
  const max = Math.max(...data.values);

  return (
    <div className="space-y-4">
      {data.labels.map((label, index) => (
        <div key={label} className="group flex items-center gap-4">
          <div className="w-14 text-sm font-semibold text-gray-700">{label}</div>
          <div className="flex-1 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl h-10 overflow-hidden shadow-inner">
            <div
              style={{
                width: `${(data.values[index] / max) * 100}%`,
                background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`
              }}
              className="h-full flex items-center justify-end pr-3 text-white text-sm font-bold transition-all duration-500 group-hover:brightness-110 shadow-md"
            >
              {data.values[index]}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityItem({
  activity
}: {
  activity: {
    id: number;
    type: string;
    description: string;
    created_at: string;
  };
}) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'login':
        return '🔐';
      case 'logout':
        return '🚪';
      case 'profile_update':
        return '👤';
      case 'settings_change':
        return '⚙️';
      case 'password_change':
        return '🔑';
      case 'account_deletion':
        return '🗑️';
      case 'failed_login':
        return '⚠️';
      default:
        return '📌';
    }
  };

  const timeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="group flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl hover:from-blue-50 hover:to-purple-50/30 transition-all border border-gray-200/50 hover:border-blue-200/50 hover:shadow-md transform hover:-translate-x-1">
      <div className="text-3xl transform group-hover:scale-110 transition-transform">{getIcon(activity.type)}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 leading-relaxed">{activity.description}</p>
        <p className="text-xs text-gray-500 mt-1.5 font-medium">{timeAgo(activity.created_at)}</p>
      </div>
    </div>
  );
}

function WeatherCard({
  location,
  themeColor,
  result,
  status
}: {
  location?: string,
  themeColor: string,
  result: WeatherToolResult,
  status: "inProgress" | "executing" | "complete"
}) {
  if (status !== "complete") {
    return (
      <div
        className="rounded-xl shadow-xl mt-6 mb-4 max-w-md w-full"
        style={{ backgroundColor: themeColor }}
      >
        <div className="bg-white/20 p-4 w-full">
          <p className="text-white animate-pulse">Loading weather for {location}...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{ backgroundColor: themeColor }}
      className="rounded-xl shadow-xl mt-6 mb-4 max-w-md w-full"
    >
      <div className="bg-white/20 p-4 w-full">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white capitalize">{location}</h3>
            <p className="text-white">Current Weather</p>
          </div>
          <WeatherIcon conditions={result.conditions} />
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div className="text-3xl font-bold text-white">
            <span className="">
              {result.temperature}° C
            </span>
            <span className="text-sm text-white/50">
              {" / "}
              {((result.temperature * 9) / 5 + 32).toFixed(1)}° F
            </span>
          </div>
          <div className="text-sm text-white">{result.conditions}</div>
        </div>

        <div className="mt-4 pt-4 border-t border-white">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-white text-xs">Humidity</p>
              <p className="text-white font-medium">{result.humidity}%</p>
            </div>
            <div>
              <p className="text-white text-xs">Wind</p>
              <p className="text-white font-medium">{result.windSpeed} mph</p>
            </div>
            <div>
              <p className="text-white text-xs">Feels Like</p>
              <p className="text-white font-medium">{result.feelsLike}°</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WeatherIcon({ conditions }: { conditions: string }) {
  if (!conditions) return null;

  if (
    conditions.toLowerCase().includes("clear") ||
    conditions.toLowerCase().includes("sunny")
  ) {
    return <SunIcon />;
  }

  if (
    conditions.toLowerCase().includes("rain") ||
    conditions.toLowerCase().includes("drizzle") ||
    conditions.toLowerCase().includes("snow") ||
    conditions.toLowerCase().includes("thunderstorm")
  ) {
    return <RainIcon />;
  }

  if (
    conditions.toLowerCase().includes("fog") ||
    conditions.toLowerCase().includes("cloud") ||
    conditions.toLowerCase().includes("overcast")
  ) {
    return <CloudIcon />;
  }

  return <CloudIcon />;
}

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-14 h-14 text-yellow-200">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeWidth="2" stroke="currentColor" />
    </svg>
  );
}

function RainIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-14 h-14 text-blue-200">
      <path d="M7 15a4 4 0 0 1 0-8 5 5 0 0 1 10 0 4 4 0 0 1 0 8H7z" fill="currentColor" opacity="0.8"/>
      <path d="M8 18l2 4M12 18l2 4M16 18l2 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

function CloudIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-14 h-14 text-gray-200">
      <path d="M7 15a4 4 0 0 1 0-8 5 5 0 0 1 10 0 4 4 0 0 1 0 8H7z" fill="currentColor"/>
    </svg>
  );
}
