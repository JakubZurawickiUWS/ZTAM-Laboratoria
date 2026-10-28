import { useState, useEffect } from 'react';
import { fetchWeather } from './api/fetchWeather.js';
import './App.css';

// Zadanie 2 (dla chętnych) - kierunek wiatru jako strona świata
function getWindDirection(degrees) {
  const directions = [
    'N', 'NE', 'E', 'SE',
    'S', 'SW', 'W', 'NW'
  ];

  return directions[Math.round(degrees / 45) % 8];
}

function App() {
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Zadanie 3 - stan połączenia internetowego
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const updateStatus = () => {
      setOnline(navigator.onLine);
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  const search = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');

    try {
      const data = await fetchWeather(query);
      setWeather(data);
      setQuery('');
    } catch (err) {
      setWeather(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-container">
      <form onSubmit={search}>
        <input
          type="text"
          className="search"
          placeholder="Wpisz miasto..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>

      {loading && (
        <p className="message">Pobieranie danych...</p>
      )}

      {error && (
        <p className="message error">{error}</p>
      )}

      {/* Zadanie 3 - komunikat offline */}
      {!online && weather && (
        <p className="message">
          Brak połączenia — pokazuję ostatnio pobrane dane.
        </p>
      )}

      {weather && (
        <div className="city">
          <h2 className="city-name">
            <span>{weather.name}</span>
            <sup>{weather.sys.country}</sup>
          </h2>

          {/* Zadanie 1 - temperatura */}
          <div className="city-temp">
            {Math.round(weather.main.temp)}
            <sup>°C</sup>
          </div>

          {/* Zadanie 2 - szczegóły pogody */}
          <div className="info">
            <img
              className="city-icon"
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
            />

            <p>{weather.weather[0].description}</p>

            <p>
              Ciśnienie: {weather.main.pressure} hPa
            </p>

            <p>
              Wilgotność: {weather.main.humidity}%
            </p>

            <p>
              Prędkość wiatru: {weather.wind.speed} m/s
            </p>

            {weather.wind.gust != null && (
              <p>
                Porywy wiatru: {weather.wind.gust} m/s
              </p>
            )}

            <p>
              Kierunek wiatru:{' '}
              {weather.wind.deg != null
                ? `${weather.wind.deg}° (${getWindDirection(weather.wind.deg)})`
                : 'brak danych'}
            </p>

            {/* Zadanie 3 - godzina pomiaru */}
            <p>
              Godzina pomiaru:{' '}
              {new Date(weather.dt * 1000).toLocaleTimeString(
                'pl-PL',
                {
                  hour: '2-digit',
                  minute: '2-digit'
                }
              )}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
