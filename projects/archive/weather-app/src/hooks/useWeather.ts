import { useState, useCallback } from 'react';
import type { WeatherData } from '../types/weather';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

interface UseWeatherReturn {
  weather: WeatherData | null;
  isLoading: boolean;
  error: string | null;
  fetchWeather: (query: string) => Promise<void>;
  clearError: () => void;
}

export const useWeather = (): UseWeatherReturn => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async (query: string) => {
    if (!API_KEY) {
      setError('API key not configured. Please add VITE_OPENWEATHER_API_KEY to your .env file.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Determine if query is a zip code (US) or city name
      const isZipCode = /^\d{5}(-\d{4})?$/.test(query);
      const queryParam = isZipCode ? `zip=${query},US` : `q=${query}`;

      const response = await fetch(
        `${BASE_URL}?${queryParam}&appid=${API_KEY}&units=imperial`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('City not found. Please check the spelling and try again.');
        } else if (response.status === 401) {
          throw new Error('Invalid API key. Please check your configuration.');
        } else {
          throw new Error('Failed to fetch weather data. Please try again later.');
        }
      }

      const data: WeatherData = await response.json();
      setWeather(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
      setWeather(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { weather, isLoading, error, fetchWeather, clearError };
};
