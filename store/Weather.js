// weather.main = weather description
// main.temp, main.feels_like *convert to F = temperature
// name = city

export default {
  coord: { lon: -90.2, lat: 38.63 },
  weather: [
    { id: 804, main: "Clouds", description: "overcast clouds", icon: "04d" }
  ],
  base: "stations",
  main: {
    temp: 278.86,
    feels_like: 274,
    temp_min: 277.04,
    temp_max: 281.15,
    pressure: 1032,
    humidity: 55
  },
  visibility: 16093,
  wind: { speed: 3.6, deg: 40 },
  clouds: { all: 90 },
  dt: 1584832134,
  sys: {
    type: 1,
    id: 3470,
    country: "US",
    sunrise: 1584792111,
    sunset: 1584836020
  },
  timezone: -18000,
  id: 4407066,
  name: "St Louis",
  cod: 200
};
