import type { WeatherData } from '../types/weather';

interface WeatherCardProps {
  weather: WeatherData;
}

const WeatherCard = ({ weather }: WeatherCardProps) => {
  const iconUrl = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`;

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getWindDirection = (deg: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
  };

  return (
    <div className="weather-card">
      <div className="weather-header">
        <h2 className="city-name">
          {weather.name}, {weather.sys.country}
        </h2>
        <p className="weather-description">{weather.weather[0].description}</p>
      </div>

      <div className="weather-main">
        <img src={iconUrl} alt={weather.weather[0].description} className="weather-icon" />
        <div className="temperature">
          <span className="temp-value">{Math.round(weather.main.temp)}</span>
          <span className="temp-unit">°F</span>
        </div>
      </div>

      <div className="weather-feels-like">
        Feels like {Math.round(weather.main.feels_like)}°F
      </div>

      <div className="weather-details">
        <div className="detail-item">
          <span className="detail-icon">💧</span>
          <div className="detail-info">
            <span className="detail-value">{weather.main.humidity}%</span>
            <span className="detail-label">Humidity</span>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-icon">💨</span>
          <div className="detail-info">
            <span className="detail-value">
              {Math.round(weather.wind.speed)} mph {getWindDirection(weather.wind.deg)}
            </span>
            <span className="detail-label">Wind</span>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-icon">👁️</span>
          <div className="detail-info">
            <span className="detail-value">
              {(weather.visibility / 1609).toFixed(1)} mi
            </span>
            <span className="detail-label">Visibility</span>
          </div>
        </div>

        <div className="detail-item">
          <span className="detail-icon">🌡️</span>
          <div className="detail-info">
            <span className="detail-value">{weather.main.pressure} hPa</span>
            <span className="detail-label">Pressure</span>
          </div>
        </div>
      </div>

      <div className="weather-sun">
        <div className="sun-item">
          <span className="sun-icon">🌅</span>
          <span className="sun-time">{formatTime(weather.sys.sunrise)}</span>
          <span className="sun-label">Sunrise</span>
        </div>
        <div className="sun-item">
          <span className="sun-icon">🌇</span>
          <span className="sun-time">{formatTime(weather.sys.sunset)}</span>
          <span className="sun-label">Sunset</span>
        </div>
      </div>

      <div className="weather-range">
        <span>L: {Math.round(weather.main.temp_min)}°</span>
        <span>H: {Math.round(weather.main.temp_max)}°</span>
      </div>
    </div>
  );
};

export default WeatherCard;
