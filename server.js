// all required packages
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const redis = require("redis");
const pgp = require("pg-promise")();

// start the express app
const app = express();
//allow cross-origin requests
app.use(cors());
//parse json request body
app.use(express.json());

// PostgreSQL connection configuration
const db = pgp({
  host: "localhost",
  port: 5432,
  database: "gamesdb",
  user: "postgres",
  password: "Test@123", // same as the username and password set in docker-compose.yml
});

// Redis client configuration
const redisClient = redis.createClient({
  socket: {
    host: "localhost",
    port: 6379,
  },
});

// Redis connection event handlers
redisClient.on("connect", () => {
  console.log("Redis client connected");
});

redisClient.on("ready", () => {
  console.log("Redis client ready to use");
});

redisClient.on("error", (err) => {
  console.error("Redis connection error occured: ", err.message);
});

redisClient.on("end", () => {
  console.log("Redis client disconnected");
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
    console.log("Connection to Redis established");
  } catch (err) {
    console.error("Connection to Redis failed", err.message);
    process.exit(1);
  }
})();

// Connect to PostgreSQL
db.connect()
  .then((obj) => {
    console.log("Connected to PostgreSQL database");
    obj.done();
  })
  .catch((err) => {
    console.error("Connection to PostgresSQL failed", err.message);
  });

// Endpoint 1 - /games for fetching games by genre with Redis caching
app.get("/games", async (req, res) => {
  const genre = req.query.genre;

  // Validate required parameter
  if (!genre) {
    return res.status(400).json({
      error: "Missing required parameter",
      require: "Please provide a genre for the game(e.g., ?genre=Action)",
    });
  }

  const startTime = Date.now();
  const queryParam = `genre:${genre}`;

  try {
    // Hitting the Redis cache first
    const cacheObject = await redisClient.get(queryParam);

    if (cacheObject) {
      // Cache HIT
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`Cache hit and the time duration is ${duration}ms`);

      return res.json({
        source: "redis",
        duration: duration,
        genre: genre,
        data: JSON.parse(cacheObject),
      });
    }

    // Cache MISS
    const games = await db.any(
      "SELECT * FROM games WHERE genre = $1 ORDER BY release_year DESC",
      [genre]
    );

    if (games.length === 0) {
      return res.status(404).json({
        error: "No games found",
        message: `No games found for genre: ${genre}`,
      });
    }

    // Store in Redis with expiration time
    await redisClient.setEx(queryParam, 1200, JSON.stringify(games));
    console.log(`Stored ${games.length} games in Redis for ${queryParam}`);

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`Retrieved from PostgreSQL in ${duration}ms`);

    return res.json({
      source: "postgresql",
      genre: genre,
      duration: duration,
      count: games.length,
      data: games,
    });
  } catch (err) {
    console.error("Error occured in /games", err.message);
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
});

// Public REST API with Redis Caching
app.get("/pokemon", async (req, res) => {
  const limit = req.query.limit || "10"; // Default to 10
  const offset = req.query.offset || "0"; // Default to 0
  const startTime = Date.now();
  const redisKey = `pokemon:limit${limit}:offset${offset}`;

  try {
    // STEP 1: Try to get data from Redis cache first
    const cachedData = await redisClient.get(redisKey);

    if (cachedData) {
      // Cache HIT
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`Cache HIT and Retrieved from Redis in ${duration}ms`);

      return res.json({
        source: "redis",
        limit: parseInt(limit),
        offset: parseInt(offset),
        duration: duration,
        data: JSON.parse(cachedData),
      });
    }

    // Cache MISS - data not in Redis, call public API
    console.log(`Cache MISS, calling public API...`);

    // Using pokemon public API
    // You can replace this with any other public API
    const apiUrl = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
    const response = await axios.get(apiUrl, {
      timeout: 5000, // 5 second timeout
    });

    if (
      !response.data ||
      !response.data.results ||
      response.data.results.length === 0
    ) {
      return res.status(404).json({
        error: "No data found",
        message: `No pokemon found for limit: ${limit} and offset: ${offset}`,
      });
    }

    // STEP 2: Store the result in Redis with expiration time
    await redisClient.setEx(redisKey, 3600, JSON.stringify(response.data));
    console.log(
      `Stored ${response.data.results.length} items in Redis with key: ${redisKey}`
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`Retrieved from public API in ${duration}ms`);

    return res.json({
      source: "public-api",
      limit: parseInt(limit),
      offset: parseInt(offset),
      duration: duration,
      count: response.data.results.length,
      total_available: response.data.count,
      data: response.data,
    });
  } catch (err) {
    console.error("/pokemon endpoint error:", err.message);

    if (err.code === "ECONNABORTED") {
      return res.status(504).json({
        error: "Gateway timeout",
        message: "Public API request timed out",
      });
    }

    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
});

// Cache check endpoints

// Clear all cache
app.delete("/cache", async (req, res) => {
  try {
    await redisClient.flushAll();
    console.log(`[Cache FLUSH] All cache entries cleared`);

    res.json({
      success: true,
      message: "All cache entries cleared",
    });
  } catch (err) {
    console.error("[Error] Flush cache error:", err.message);
    res.status(500).json({
      error: "Failed to flush cache",
      message: err.message,
    });
  }
});

// Get all cache keys
app.get("/cache/keys", async (req, res) => {
  try {
    const keys = await redisClient.keys("*");

    res.json({
      success: true,
      count: keys.length,
      keys: keys,
    });
  } catch (err) {
    console.error("Error in retrieving keys", err.message);
    res.status(500).json({
      error: "Failed to retrieve keys",
      message: err.message,
    });
  }
});

// Start node server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log("\nAvailable endpoints:");
  console.log(`  GET  http://localhost:${PORT}/games?genre=Action`);
  console.log(`  Other options for genre: Adventure, RPG, Strategy, Sports`);
  console.log(`  GET  http://localhost:${PORT}/pokemon?limit=10&offset=0`);
  console.log(`  To check cache status:`);
  console.log(`  GET  http://localhost:${PORT}/cache/keys`);
  console.log(`  To delete all records in cache:`);
  console.log(`  DEL  http://localhost:${PORT}/cache`);
});

// Closing connections on app termination
process.on("SIGINT", async () => {
  try {
    await redisClient.quit();
    console.log("Redis connection closed");

    await pgp.end();
    console.log("PostgreSQL connection closed");
    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err.message);
    process.exit(1);
  }
});
