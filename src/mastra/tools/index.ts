import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

interface GeocodingResponse {
  results: {
    latitude: number;
    longitude: number;
    name: string;
  }[];
}
interface WeatherResponse {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    wind_gusts_10m: number;
    weather_code: number;
  };
}

export type WeatherToolResult = z.infer<typeof WeatherToolResultSchema>;

const WeatherToolResultSchema = z.object({
  temperature: z.number(),
  feelsLike: z.number(),
  humidity: z.number(),
  windSpeed: z.number(),
  windGust: z.number(),
  conditions: z.string(),
  location: z.string(),
});

export const weatherTool = createTool({
  id: 'get-weather',
  description: 'Get current weather for a location',
  inputSchema: z.object({
    location: z.string().describe('City name'),
  }),
  outputSchema: WeatherToolResultSchema,
  execute: async ({ context }) => {
    return await getWeather(context.location);
  },
});

const getWeather = async (location: string) => {
  const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`;
  const geocodingResponse = await fetch(geocodingUrl);
  const geocodingData = (await geocodingResponse.json()) as GeocodingResponse;

  if (!geocodingData.results?.[0]) {
    throw new Error(`Location '${location}' not found`);
  }

  const { latitude, longitude, name } = geocodingData.results[0];

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,weather_code`;

  const response = await fetch(weatherUrl);
  const data = (await response.json()) as WeatherResponse;

  return {
    temperature: data.current.temperature_2m,
    feelsLike: data.current.apparent_temperature,
    humidity: data.current.relative_humidity_2m,
    windSpeed: data.current.wind_speed_10m,
    windGust: data.current.wind_gusts_10m,
    conditions: getWeatherCondition(data.current.weather_code),
    location: name,
  };
};

function getWeatherCondition(code: number): string {
  const conditions: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };
  return conditions[code] || 'Unknown';
}

// Profile tools
export const getProfileCompletionTool = createTool({
  id: 'get-profile-completion',
  description: 'Analyze profile completion percentage and provide recommendations',
  inputSchema: z.object({
    name: z.string().nullable(),
    bio: z.string().nullable(),
    location: z.string().nullable(),
    website: z.string().nullable(),
    avatar_url: z.string().nullable(),
  }),
  outputSchema: z.object({
    completion_percentage: z.number().min(0).max(100),
    missing_fields: z.array(z.string()),
    recommendations: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    const fields = [
      { key: 'name', label: 'Name' },
      { key: 'bio', label: 'Bio' },
      { key: 'location', label: 'Location' },
      { key: 'website', label: 'Website' },
      { key: 'avatar_url', label: 'Profile Picture' },
    ]

    const filledFields = fields.filter((field) => {
      const value = context[field.key as keyof typeof context]
      return value !== null && value !== ''
    })

    const completion_percentage = Math.round((filledFields.length / fields.length) * 100)
    const missing_fields = fields
      .filter((field) => {
        const value = context[field.key as keyof typeof context]
        return value === null || value === ''
      })
      .map((field) => field.label)

    const recommendations = []
    if (missing_fields.includes('Name')) {
      recommendations.push('Add your name to personalize your profile')
    }
    if (missing_fields.includes('Bio')) {
      recommendations.push('Write a bio to tell others about yourself')
    }
    if (missing_fields.includes('Profile Picture')) {
      recommendations.push('Upload a profile picture to make your profile more recognizable')
    }
    if (missing_fields.includes('Location')) {
      recommendations.push('Add your location to connect with people nearby')
    }
    if (missing_fields.includes('Website')) {
      recommendations.push('Share your website or portfolio link')
    }

    return {
      completion_percentage,
      missing_fields,
      recommendations,
    }
  },
})

export const suggestBioImprovementsTool = createTool({
  id: 'suggest-bio-improvements',
  description: 'Analyze user bio and suggest improvements',
  inputSchema: z.object({
    bio: z.string(),
  }),
  outputSchema: z.object({
    suggestions: z.array(z.string()),
    tone: z.enum(['professional', 'casual', 'creative', 'minimal']),
    length_assessment: z.enum(['too_short', 'good', 'too_long']),
  }),
  execute: async ({ context }) => {
    const bioLength = context.bio.length
    const suggestions = []

    // Length assessment
    let length_assessment: 'too_short' | 'good' | 'too_long'
    if (bioLength < 50) {
      length_assessment = 'too_short'
      suggestions.push('Consider expanding your bio to at least 50 characters')
    } else if (bioLength > 300) {
      length_assessment = 'too_long'
      suggestions.push('Try to keep your bio concise (under 300 characters)')
    } else {
      length_assessment = 'good'
    }

    // Tone detection (simple heuristic)
    const hasEmojis = /[\u{1F300}-\u{1F9FF}]/u.test(context.bio)
    const hasProfessionalWords = /(experienced|professional|expert|specialist)/i.test(context.bio)
    const hasCreativeWords = /(creative|passionate|innovative|enthusiast)/i.test(context.bio)

    let tone: 'professional' | 'casual' | 'creative' | 'minimal'
    if (hasProfessionalWords) {
      tone = 'professional'
    } else if (hasCreativeWords) {
      tone = 'creative'
    } else if (hasEmojis || bioLength < 100) {
      tone = 'casual'
    } else {
      tone = 'minimal'
    }

    // General suggestions
    if (!context.bio.includes('.') && bioLength > 50) {
      suggestions.push('Add punctuation to improve readability')
    }
    if (suggestions.length === 0) {
      suggestions.push('Your bio looks great!')
    }

    return {
      suggestions,
      tone,
      length_assessment,
    }
  },
})