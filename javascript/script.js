// Selecting elements from the HTML document
const cityInput = document.querySelector('.city-input'); // Input field for city name
const searchButton = document.querySelector('.search-btn'); // Button for manual city search
const locationButton = document.querySelector('.location-btn'); // Button for using current location
const currentWeatherDiv = document.querySelector('.current-weather'); // Container for current weather details
const weatherCardsDiv = document.querySelector('.weather-cards'); // Container for five-day forecast cards

// Storing the API key for accessing weather data (OpenWeatherMap API)
const API_KEY = 'ec50c25f8812390e90a56fd495cfd62f';

// Function to create HTML for weather cards based on forecast data
const createWeatherCard = (cityName, weatherItem, index) => {
  if (index === 0) {
    // Check if it's the main weather card
    // Template for the main weather card
    return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(' ')[0]})</h2>
                    <h6>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(
                      2
                    )}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${
                      weatherItem.weather[0].icon
                    }@4x.png" alt="weather-icon">
                    <h6>${weatherItem.weather[0].description}</h6>
                </div>`;
  } else {
    // For the five-day forecast cards
    // Template for the five-day forecast cards
    return `<li class="card">
                    <h3>(${weatherItem.dt_txt.split(' ')[0]})</h3>
                    <img src="https://openweathermap.org/img/wn/${
                      weatherItem.weather[0].icon
                    }@4x.png" alt="weather-icon">
                    <h6>Temp: ${(weatherItem.main.temp - 273.15).toFixed(
                      2
                    )}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </li>`;
  }
};

// Function to fetch weather details based on city name or coordinates
const getWeatherDetails = (cityName, latitude, longitude) => {
  // API endpoint for weather forecast based on coordinates
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

  // Fetching weather data from OpenWeatherMap API
  fetch(WEATHER_API_URL)
    .then((response) => response.json())
    .then((data) => {
      // Filter the forecasts to get only one forecast per day
      const uniqueForecastDays = [];
      const fiveDaysForecast = data.list.filter((forecast) => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
          return uniqueForecastDays.push(forecastDate);
        }
      });

      // Clearing previous weather data from the UI
      cityInput.value = '';
      currentWeatherDiv.innerHTML = '';
      weatherCardsDiv.innerHTML = '';

      // Creating weather cards based on the forecast data and adding them to the DOM
      fiveDaysForecast.forEach((weatherItem, index) => {
        const html = createWeatherCard(cityName, weatherItem, index);
        if (index === 0) {
          // Insert the main weather card
          currentWeatherDiv.insertAdjacentHTML('beforeend', html);
        } else {
          // Insert the five-day forecast cards
          weatherCardsDiv.insertAdjacentHTML('beforeend', html);
        }
      });
    })
    .catch(() => {
      // Alerting user in case of error while fetching weather data
      alert('An error occurred while fetching the weather forecast!');
    });
};

// Function to get city coordinates based on user input
const getCityCoordinates = () => {
  const cityName = cityInput.value.trim();
  if (cityName === '') return;
  // API endpoint for getting coordinates from city name
  const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

  // Fetching coordinates data from OpenWeatherMap API
  fetch(API_URL)
    .then((response) => response.json())
    .then((data) => {
      if (!data.length) return alert(`No coordinates found for ${cityName}`);
      const { lat, lon, name } = data[0];
      // Fetching weather details based on obtained coordinates
      getWeatherDetails(name, lat, lon);
    })
    .catch(() => {
      // Alerting user in case of error while fetching coordinates
      alert('An error occurred while fetching the coordinates!');
    });
};

// Function to get user coordinates using browser's geolocation feature
const getUserCoordinates = () => {
  navigator.geolocation.getCurrentPosition(
    // This callback will run when a user accepts the location request on the browser
    (position) => {
      const { latitude, longitude } = position.coords;
      // API endpoint for getting city name from coordinates
      const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
      // Fetching city name based on user coordinates
      fetch(API_URL)
        .then((response) => response.json())
        .then((data) => {
          const { name } = data[0];
          // Fetching weather details based on obtained city name and coordinates
          getWeatherDetails(name, latitude, longitude);
        })
        .catch(() => {
          // Alerting user in case of error while fetching city name
          alert('An error occurred while fetching the city name!');
        });
    },
    (error) => {
      // Handling errors related to geolocation permission
      if (error.code === error.PERMISSION_DENIED) {
        alert(
          'Geolocation request denied. Please reset location permission to grant access again.'
        );
      } else {
        alert('Geolocation request error. Please reset location permission.');
      }
    }
  );
};

// Event listeners for buttons and input field
locationButton.addEventListener('click', getUserCoordinates); // Listen for click on "Use My Location" button
searchButton.addEventListener('click', getCityCoordinates); // Listen for click on "Search" button
cityInput.addEventListener(
  'keyup',
  (e) => e.key === 'Enter' && getCityCoordinates() // Listen for "Enter" key press in input field
);
