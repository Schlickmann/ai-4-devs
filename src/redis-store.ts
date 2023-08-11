// Importing necessary modules
import { RedisVectorStore } from "langchain/vectorstores/redis";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { createClient } from "redis";

// Creating a Redis client
export const redis = createClient({
  url: "redis://localhost:6379",
});

export const redisVectorStore = new RedisVectorStore(
  new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }),
  {
    indexName: "videos-embeddings", // Name of the Redis index to store vectors
    redisClient: redis, // The Redis client instance
    keyPrefix: "videos:", // Prefix for keys in Redis
  }
);
