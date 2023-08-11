import { ChatOpenAI } from "langchain/chat_models/openai";
import { RetrievalQAChain } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";
import { redis, redisVectorStore } from "./redis-store";

/**
 * Creates an instance of the "ChatOpenAI" class
 * @param {string} openAIApiKey - The API key to authenticate the "OpenAI" server
 * @param {string} modelName - The model used by "OpenAI" for the conversation
 * @param {number} temperature - The randomness of the model's responses
 */
const openaiChat = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-3.5-turbo",
  temperature: 0.3,
});

/**
 * Creates an instance of the "PromptTemplate" class
 * @param {string} template - The template used for creating questions
 * @param {array<string>} inputVariables - An array containing variables representing context and question
 */
const prompt = new PromptTemplate({
  template: `
    You're an expert in answering coding questions. The user is taking a course with many classes. 
    Use the transcripts content below to answer the user's question.
    If the answer is not in the transcripts, answer that you don't know, don't make up an answer.

    If possible, include JavaScript or TypeScript code snippets in your answer.

    Transcripts:
    {context}

    Question: 
    {question}
  `.trim(),
  inputVariables: ["context", "question"],
});

/**
 * Creates an instance of the "RetrievalQAChain" class
 * @param {ChatOpenAI} openaiChat - The ChatOpenAI instance
 * @param {RedisStore} redisVectorStore - RedisStore used as retriever
 * @param {PromptTemplate} prompt - PromptTemplate used with options to return source documents and enable verbosity
 */
const chain = RetrievalQAChain.fromLLM(
  openaiChat,
  redisVectorStore.asRetriever(3),
  { prompt, returnSourceDocuments: true, verbose: true }
);

/**
 * Connects to the Redis server, asks a question and logs the response, and then disconnects from the Redis server
 */
async function main() {
  await redis.connect();

  const response = await chain.call({
    query: "Explain the concept of aggregate root in DDD", // Your question goes here
  });

  console.log(response);

  await redis.disconnect();
}

main();
