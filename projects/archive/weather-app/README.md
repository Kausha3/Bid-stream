# Weather App

A React application that fetches real-time weather data from OpenWeatherMap API.

## Features

- **City/Zip Code Search**: Search by city name (e.g., "New York", "London, UK") or US zip code
- **Real-time Weather Data**: Temperature, humidity, wind speed, visibility, pressure
- **Sunrise/Sunset Times**: Display local sunrise and sunset times
- **Error Handling**: Graceful handling of API errors with user-friendly messages
- **Responsive Design**: Works on desktop and mobile devices
- **Loading States**: Visual feedback during API calls

## Tech Stack

- React 19 + TypeScript
- Vite (build tool)
- OpenWeatherMap API
- CSS3 with CSS Variables

## Key Learning Concepts

1. **Async/Await & Promises**: Handling asynchronous API calls
2. **Custom Hooks**: `useWeather` hook encapsulates all weather fetching logic
3. **Error Boundaries**: Try/catch blocks for robust error handling
4. **Environment Variables**: Secure API key storage with Vite's `import.meta.env`
5. **TypeScript Interfaces**: Strong typing for API responses

## Setup

1. Get a free API key from [OpenWeatherMap](https://openweathermap.org/api)

2. Create a `.env` file in the project root:
   ```
   VITE_OPENWEATHER_API_KEY=your_api_key_here
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── components/
│   ├── WeatherCard.tsx    # Main weather display component
│   ├── SearchBar.tsx      # Search input with form handling
│   └── ErrorDisplay.tsx   # Error state display
├── hooks/
│   └── useWeather.ts      # Custom hook for weather API
├── types/
│   └── weather.ts         # TypeScript interfaces
├── App.tsx                # Main application component
└── App.css                # Styles
```

## API Reference

This app uses the OpenWeatherMap Current Weather API:
- Endpoint: `https://api.openweathermap.org/data/2.5/weather`
- Documentation: https://openweathermap.org/current

## The Secret Sauce

**Error Handling**: APIs fail. This app wraps fetch calls in try/catch blocks and displays user-friendly error messages instead of cryptic errors. A "City not found" message is much better than a stack trace!
