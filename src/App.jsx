import { useState, useEffect } from "react";
import "./index.css";

const api = "4f0dda0a93aa460aa36123842250911";

function App() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState(null);

  // Получаем геопозицию
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Ваш браузер не поддерживает Geolocation API");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ latitude, longitude });
      },
      () => setError("Не удалось получить вашу геопозицию")
    );
  }, []);

  // Получаем погоду
  useEffect(() => {
    if (!city.trim() && !coords) return;

    async function getData() {
      setLoading(true);
      try {
        const query = city.trim()
          ? city
          : `${coords.latitude},${coords.longitude}`;
        const res = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${api}&q=${query}&lang=ru`
        );
        const data = await res.json();

        if (data.error) {
          setError(data.error.message);
          setWeatherData(null);
          return;
        }
        setWeatherData(data);
        setError(null);
      } catch {
        setError("Ошибка при загрузке данных о погоде.");
      } finally {
        setLoading(false);
      }
    }

    getData();
  }, [city, coords]);

  return (
    <div className="app">
      <div className="widget-container">
        <h1 className="app-title">Погода</h1>

        <div className="search-container">
          <input
            type="text"
            placeholder="Введите название города..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="search-input"
          />
        </div>

        {loading ? (
          <div className="loader"></div>
        ) : error ? (
          <p className="error-text">{error}</p>
        ) : weatherData ? (
          <div className="weather-card">
            <h2>
              {weatherData.location.name}, {weatherData.location.country}
            </h2>
            <img
              src={weatherData.current.condition.icon}
              alt="icon"
              className="weather-icon"
            />
            <p className="temperature">
              {Math.round(weatherData.current.temp_c)}°C
            </p>
            <p className="condition">{weatherData.current.condition.text}</p>
            <div className="weather-details">
              <p>💧 Влажность: {weatherData.current.humidity}%</p>
              <p>💨 Ветер: {weatherData.current.wind_kph} км/ч</p>
            </div>
          </div>
        ) : (
          <p className="info-text">
            Введите город или разрешите доступ к геолокации 🌍
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
