import * as dotenv from "dotenv";

import { redis, redisVectorStore } from "./redis-store";

dotenv.config();

async function search() {
  await redis.connect();

  const response = await redisVectorStore.similaritySearchWithScore(
    "Your question goes here",
    5
  );

  console.log(response);

  await redis.disconnect();
}

search();
