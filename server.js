const express = require("express");
const { DateTime } = require("luxon");
const redis = require("redis");
const { getWeather } = require("./src/services/weather");
const app = express();
const port = 8080;

let redisClient;
(async () => {
  redisClient = redis.createClient({ url: "redis://localhost:6379" });
  redisClient.on("error", (err) =>
    console.error(`Failed to connect to redis server: ${err}`)
  );
  await redisClient.connect();
})();

const cacheMiddleware = async (req, res, next) => {
  try {
    const date = req.query.date;
    const dt = DateTime.fromISO(date);
    const currDateTime = DateTime.now();
    const diff = dt.diff(currDateTime, "days");
    const daysDiff = parseInt(diff.toObject().days) + 1;

    const cacheKey = `${req.query.lat}-${req.query.lng}-${dt.toFormat(
      "yyyyLLdd"
    )}`;

    const cachedData = await redisClient.get(cacheKey);
    let results;

    if (cachedData) {
      results = JSON.parse(cachedData);
    } else {
      const resp = await getWeather(req.query.lat, req.query.lng, daysDiff);
      results = resp.data;
      await redisClient.set(cacheKey, JSON.stringify(results), { EX: 60 });
    }

    return res.status(200).send(results);
  } catch (error) {
    console.error(error);
    res.status(400).send({ error: "Something went wrong." });
  }
};

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/weather", cacheMiddleware);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
