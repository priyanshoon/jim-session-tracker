import redis from "redis";

const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => {
  console.error("redis client error", err);
});

async function connectRedis() {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error("failed to connect to redis", error);
    process.exit(1);
  }
}

connectRedis();

export default redisClient;
