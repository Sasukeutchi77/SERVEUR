import { type FormEvent, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Droplets, Gauge, LocateFixed, MapPin, Search, Sunrise, Sunset, Thermometer, Wind } from 'lucide-react';

type Units = 'celsius' | 'fahrenheit';

type Location = {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
};

type Weather = {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
    is_day: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
    weather_code: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    sunrise: string[];
    sunset: string[];
  };
  timezone: string;
};

const DEFAULT_LOCATION: Location = {
  name: 'London',
  country: 'United Kingdom',
  latitude: 51.5074,
  longitude: -0.1278,
};

const weatherLabel = (code: number): [string, string] => {
  if (code === 0) return ['Clear sky', '☀️'];
  if ([1, 2].includes(code)) return ['Partly cloudy', '⛅'];
  if (code === 3) return ['Overcast', '☁️'];
  if ([45, 48].includes(code)) return ['Foggy', '🌫️'];
  if ([51, 53, 55, 56, 57].includes(code)) return ['Drizzle', '🌦️'];
  if ([61, 63, 65, 66, 67].includes(code)) return ['Rain', '🌧️'];
  if ([71, 73, 75, 77].includes(code)) return ['Snow', '❄️'];
  if ([80, 81, 82].includes(code)) return ['Rain showers', '🌦️'];
  if ([95, 96, 99].includes(code)) return ['Thunderstorm', '⛈️'];
  return ['Mixed conditions', '🌤️'];
};

const dayName = (date: string, index: number) =>
  index === 0 ? 'Today' : new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date(`${date}T12:00:00`));

const formatTemp = (value: number, units: Units) =>
  `${Math.round(units === 'fahrenheit' ? (value * 9) / 5 + 32 : value)}°`;

async function findLocation(query: string): Promise<Location> {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`,
  );

  if (!response.ok) throw new Error('Unable to search for that location.');

  const data = await response.json();
  const result = data.results?.[0];

  if (!result) throw new Error('No location found. Try another city.');

  return {
    name: result.name,
    country: result.country,
    latitude: result.latitude,
    longitude: result.longitude,
  };
}

async function loadWeather(location: Location, units: Units): Promise<Weather> {
  const temperatureUnit = units === 'fahrenheit' ? 'fahrenheit' : 'celsius';

  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    timezone: 'auto',
    temperature_unit: temperatureUnit,
    forecast_days: '7',
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day',
    hourly: 'temperature_2m,precipitation_probability,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset',
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!response.ok) throw new Error('Weather data is temporarily unavailable.');

  return response.json();
}

export default function App() {
  const [query, setQuery] = useState(DEFAULT_LOCATION.name);
  const [location, setLocation] = useState<Location>(DEFAULT_LOCATION);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [units, setUnits] = useState<Units>('celsius');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(
    async (nextLocation: Location, nextUnits: Units = units) => {
      setLoading(true);
      setError('');

      try {
        const nextWeather = await loadWeather(nextLocation, nextUnits);
        setWeather(nextWeather);
        setLocation(nextLocation);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    },
    [units],
  );

  useEffect(() => {
    void refresh(DEFAULT_LOCATION);
  }, [refresh]);

  const submitSearch = async (event: FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;

    try {
      const foundLocation = await findLocation(query.trim());
      await refresh(foundLocation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to find location.');
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const reverse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${coords.latitude}&longitude=${coords.longitude}&count=1&language=en&format=json`,
          );

          if (!reverse.ok) throw new Error('Location lookup failed.');

          const payload = await reverse.json();
          const result = payload.results?.[0];

          await refresh({
            name: result?.name ?? 'Your location',
            country: result?.country ?? '',
            latitude: coords.latitude,
            longitude: coords.longitude,
          });
        } catch {
          setError('Unable to load weather for your location.');
        }
      },
      () => setError('Location permission was not granted.'),
    );
  };

  const hourly = useMemo(() => {
    if (!weather) return [];
    const now = new Date();

    return weather.hourly.time
      .map((time, index) => ({ time, index }))
      .filter(({ time }) => new Date(time) >= now)
      .slice(0, 8);
  }, [weather]);

  const currentLabel = weather ? weatherLabel(weather.current.weather_code) : ['', ''];

  const changeUnits = (nextUnits: Units) => {
    setUnits(nextUnits);
    void refresh(location, nextUnits);
  };

  return (
    <div className="weather-app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">☼</div>
          <div>
            <strong>Atmos</strong>
            <span>Weather, beautifully clear.</span>
          </div>
        </div>

        <form className="search" onSubmit={submitSearch}>
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search city..."
            aria-label="Search city"
          />
          <button type="submit">Search</button>
        </form>

        <div className="top-actions">
          <button
            className="icon-button"
            onClick={useCurrentLocation}
            title="Use my location"
            aria-label="Use my location"
          >
            <LocateFixed size={19} />
          </button>

          <div className="unit-toggle">
            <button className={units === 'celsius' ? 'active' : ''} onClick={() => changeUnits('celsius')}>
              °C
            </button>
            <button className={units === 'fahrenheit' ? 'active' : ''} onClick={() => changeUnits('fahrenheit')}>
              °F
            </button>
          </div>
        </div>
      </header>

      <main className="content">
        {error && <div className="error" role="alert">{error}</div>}
        {loading && <div className="loading">Loading forecast…</div>}

        {!loading && weather && (
          <>
            <section className="hero-card">
              <div className="hero-heading">
                <div>
                  <p className="eyebrow">
                    <MapPin size={15} /> {location.name}, {location.country}
                  </p>
                  <h1>Good morning.</h1>
                  <p className="muted">Here&apos;s your local forecast for the week ahead.</p>
                </div>

                <div className="date">
                  {new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())}
                </div>
              </div>

              <div className="current">
                <div className="weather-symbol">{currentLabel[1]}</div>
                <div className="temperature">{formatTemp(weather.current.temperature_2m, units)}</div>
                <div className="condition">
                  <strong>{currentLabel[0]}</strong>
                  <span>Feels like {formatTemp(weather.current.apparent_temperature, units)}</span>
                </div>
              </div>

              <div className="metrics">
                <Metric icon={<Wind />} label="Wind" value={`${Math.round(weather.current.wind_speed_10m)} km/h`} />
                <Metric icon={<Droplets />} label="Humidity" value={`${weather.current.relative_humidity_2m}%`} />
                <Metric icon={<Gauge />} label="Pressure" value="1018 hPa" />
                <Metric icon={<Thermometer />} label="Feels like" value={formatTemp(weather.current.apparent_temperature, units)} />
              </div>
            </section>

            <div className="section-heading">
              <div>
                <h2>Hourly forecast</h2>
                <p className="muted">Next 8 hours in {location.name}</p>
              </div>
              <div className="source">Live data · Open-Meteo</div>
            </div>

            <section className="hourly-row">
              {hourly.map(({ time, index }) => {
                const [label, icon] = weatherLabel(weather.hourly.weather_code[index]);

                return (
                  <div className="hour-card" key={time}>
                    <span>{new Intl.DateTimeFormat('en-US', { hour: 'numeric' }).format(new Date(time))}</span>
                    <b>{icon}</b>
                    <strong>{formatTemp(weather.hourly.temperature_2m[index], units)}</strong>
                    <small>{weather.hourly.precipitation_probability[index]}% rain</small>
                    <em>{label}</em>
                  </div>
                );
              })}
            </section>

            <div className="section-heading">
              <div>
                <h2>7-day forecast</h2>
                <p className="muted">A longer look at what&apos;s coming</p>
              </div>
            </div>

            <section className="forecast-list">
              {weather.daily.time.map((date, index) => {
                const [label, icon] = weatherLabel(weather.daily.weather_code[index]);

                return (
                  <div className="day-row" key={date}>
                    <strong>{dayName(date, index)}</strong>
                    <span className="day-condition">
                      <b>{icon}</b>
                      {label}
                    </span>
                    <span className="rain">{weather.daily.precipitation_probability_max[index]}%</span>
                    <span className="range">
                      <i
                        style={{
                          width: `${Math.max(20, weather.daily.temperature_2m_max[index] - weather.daily.temperature_2m_min[index]) * 4}%`,
                        }}
                      />
                      {formatTemp(weather.daily.temperature_2m_min[index], units)} <b>{formatTemp(weather.daily.temperature_2m_max[index], units)}</b>
                    </span>
                    <span className="sun">
                      <Sunrise size={15} /> {new Date(weather.daily.sunrise[index]).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      <Sunset size={15} /> {new Date(weather.daily.sunset[index]).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </section>
          </>
        )}
      </main>

      <footer>Atmos uses Open-Meteo forecast data · No API key required</footer>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="metric">
      <span>{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
