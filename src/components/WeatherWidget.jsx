import { useEffect, useState } from "react";

const LAT = 38.3498;
const LON = -81.6326;

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [updatedAt, setUpdatedAt] = useState("");

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 600000);
    return () => clearInterval(interval);
  }, []);

  async function fetchWeather() {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&hourly=temperature_2m,precipitation_probability,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FNew_York`
      );

      const data = await res.json();
      setWeather(data);
      setUpdatedAt(
        new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })
      );
    } catch (err) {
      console.error("Failed to fetch weather:", err);
    }
  }

  function condition(code) {
    const codes = {
      0: "Clear",
      1: "Mostly Clear",
      2: "Partly Cloudy",
      3: "Cloudy",
      45: "Fog",
      48: "Fog",
      51: "Light Drizzle",
      53: "Drizzle",
      55: "Heavy Drizzle",
      61: "Light Rain",
      63: "Rain",
      65: "Heavy Rain",
      71: "Light Snow",
      73: "Snow",
      75: "Heavy Snow",
      80: "Rain Showers",
      81: "Rain Showers",
      82: "Heavy Showers",
      95: "Thunderstorms",
    };

    return codes[code] || "Weather";
  }

  function icon(code) {
    if ([0, 1].includes(code)) return "☀️";
    if (code === 2) return "⛅";
    if (code === 3) return "☁️";
    if ([45, 48].includes(code)) return "🌫️";
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "🌧️";
    if ([71, 73, 75].includes(code)) return "❄️";
    if (code === 95) return "⛈️";
    return "🌤️";
  }

  if (!weather) {
    return (
      <div className="weather-dashboard">
        <h2>Charleston Weather</h2>
        <p>Loading weather...</p>
      </div>
    );
  }

  const current = weather.current;
  const daily = weather.daily;

  const currentHourIndex = weather.hourly.time.findIndex((time) => {
    return new Date(time) >= new Date();
  });

  const hourlyStart = currentHourIndex >= 0 ? currentHourIndex : 0;
  const hourly = weather.hourly.time.slice(hourlyStart, hourlyStart + 7);

  return (
    <section className="weather-dashboard">
      <div className="weather-title-row">
        <div>
          <h2>🌤️ Charleston Weather</h2>
          <p>
            Charleston, West Virginia • Last updated {updatedAt}
          </p>
        </div>
      </div>

      <div className="weather-main-grid">
        <div className="weather-current">
          <div className="weather-big-icon">
            {icon(current.weather_code)}
          </div>

          <div className="weather-current-temp">
            {Math.round(current.temperature_2m)}°
            <span>F</span>
          </div>

          <h3>{condition(current.weather_code)}</h3>

          <div className="weather-pills">
            <span>
              H: {Math.round(daily.temperature_2m_max[0])}°
            </span>

            <span>
              L: {Math.round(daily.temperature_2m_min[0])}°
            </span>

            <span>
              Rain: {daily.precipitation_probability_max[0] ?? 0}%
            </span>
          </div>
        </div>

        <div className="weather-stats">
          <div>
            <span>💧 Humidity</span>
            <strong>{current.relative_humidity_2m}%</strong>
          </div>

          <div>
            <span>💨 Wind</span>
            <strong>{Math.round(current.wind_speed_10m)} mph</strong>
          </div>

          <div>
            <span>🌡️ Feels Like</span>
            <strong>{Math.round(current.temperature_2m)}°</strong>
          </div>

          <div>
            <span>📍 Location</span>
            <strong>Charleston</strong>
          </div>
        </div>

        <div className="hourly-panel">
          <h3>Hourly Forecast</h3>

          <div className="hourly-row">
            {hourly.map((time, index) => {
              const realIndex = hourlyStart + index;

              return (
                <div className="hour-card" key={time}>
                  <strong>
                    {new Date(time).toLocaleTimeString([], {
                      hour: "numeric",
                    })}
                  </strong>

                  <span className="hour-icon">
                    {icon(weather.hourly.weather_code[realIndex])}
                  </span>

                  <b>
                    {Math.round(weather.hourly.temperature_2m[realIndex])}°
                  </b>

                  <small>
                    💧 {weather.hourly.precipitation_probability[realIndex] ?? 0}%
                  </small>

                  <small>
                    💨 {Math.round(weather.hourly.wind_speed_10m[realIndex])} mph
                  </small>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="five-day">
        <h3>5-Day Forecast</h3>

        <div className="forecast-grid">
          {daily.time.slice(0, 5).map((day, index) => (
            <div className="forecast-card" key={day}>
              <strong>
                {new Date(day).toLocaleDateString([], {
                  weekday: "short",
                })}
              </strong>

              <span className="forecast-icon">
                {icon(daily.weather_code[index])}
              </span>

              <p>{condition(daily.weather_code[index])}</p>

              <h4>
                {Math.round(daily.temperature_2m_max[index])}°
                <span>/ {Math.round(daily.temperature_2m_min[index])}°</span>
              </h4>

              <small>
                💧 {daily.precipitation_probability_max[index] ?? 0}%
              </small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}