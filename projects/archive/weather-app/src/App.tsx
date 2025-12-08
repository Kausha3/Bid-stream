import { useEffect } from 'react';
import SearchBar from './components/SearchBar';
import WeatherCard from './components/WeatherCard';
import ErrorDisplay from './components/ErrorDisplay';
import { useWeather } from './hooks/useWeather';
import './App.css';

function App() {
  const { weather, isLoading, error, fetchWeather, clearError } = useWeather();

  // Fetch weather for a default city on mount
  useEffect(() => {
    fetchWeather('San Francisco');
  }, [fetchWeather]);

  const handleSearch = (query: string) => {
    clearError();
    fetchWeather(query);
  };

  return (
    <div className="app">
      <div className="app-container">
        <header className="app-header">
          <h1 className="app-title">
            <span className="title-icon">⛅</span>
            Weather App
          </h1>
          <p className="app-subtitle">Get real-time weather for any city</p>
        </header>

        <main className="app-main">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />

          {isLoading && !weather && (
            <div className="loading-container">
              <div className="loading-spinner large"></div>
              <p>Fetching weather data...</p>
            </div>
          )}

          {error && (
            <ErrorDisplay
              message={error}
              onRetry={() => weather && fetchWeather(weather.name)}
            />
          )}

          {weather && !error && (
            <WeatherCard weather={weather} />
          )}
        </main>

        <footer className="app-footer">
          <p>
            Powered by{' '}
            <a
              href="https://openweathermap.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              OpenWeatherMap
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
