// Importing necessary modules
import path from "node:path";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { TokenTextSplitter } from "langchain/text_splitter";
import { RedisVectorStore } from "langchain/vectorstores/redis";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { createClient } from "redis";

// Initializing the DirectoryLoader with a directory and callback to handle .json files
const loader = new DirectoryLoader(path.resolve(__dirname, "../tmp"), {
  ".json": (path) => new JSONLoader(path, "/text"), // Will look for the text field in the JSON file
});

// Definition of the main async function to load and process the documents
async function load() {
  const docs = await loader.load();

  const splitter = new TokenTextSplitter({
    chunkSize: 600,
    chunkOverlap: 0,
    encodingName: "cl100k_base",
  });

  // Splitting the loaded documents into chunks
  const splittedDocuments = await splitter.splitDocuments(docs);

  // Creating a Redis client
  const redis = createClient({
    url: "redis://localhost:6379",
  });

  await redis.connect();

  // Storing vectors of splitted documents in Redis using OpenAIEmbeddings for vectorization
  await RedisVectorStore.fromDocuments(
    splittedDocuments,
    new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }),
    {
      indexName: "videos-embeddings", // Name of the Redis index to store vectors
      redisClient: redis, // The Redis client instance
      keyPrefix: "videos:", // Prefix for keys in Redis
    }
  );

  // Disconnecting from the Redis server
  await redis.disconnect();
}

load();
