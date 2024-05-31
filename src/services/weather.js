const axios = require("axios");

const getWeather = async (lat, lng, days) => {
  return axios.get("https://api.open-meteo.com/v1/forecast", {
    params: {
      latitude: lat,
      longitude: lng,
      hourly: "temperature_2m",
      timezone: "Asia/Bangkok",
      forecast_days: days,
    },
  });
};

exports.getWeather = getWeather;
