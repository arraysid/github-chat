"use server";

import { db } from "@/server/lib/database";
import { sourceCodeEmbeddings } from "@/server/lib/database/schema";
import { generateEmbedding } from "@/server/lib/gemini";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { createStreamableValue } from "ai/rsc";
import { eq, l2Distance } from "drizzle-orm";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function askQuestion(question: string, projectId: string) {
  const stream = createStreamableValue();

  const queryVector = await generateEmbedding(question);
  const vectorQuery = `[${queryVector.join(",")}]`;

  const results = await db
    .select()
    .from(sourceCodeEmbeddings)
    .where(eq(sourceCodeEmbeddings.projectId, projectId))
    .orderBy(l2Distance(sourceCodeEmbeddings.summaryEmbedding, vectorQuery))
    .limit(5);

  let context = "";

  for (const doc of results) {
    context += `source ${doc.fileName}:\ncode content:\n${doc.sourceCode}\nsummary of file:\n${doc.summary}\n\n`;
  }

  const PROMPT = `
You are an AI code assistant who answers questions about the codebase. Your target audience is a technical intern who is looking to understand the codebase.

AI assistant is a brand new, powerful, human-like artificial intelligence. The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.

AI is a well-behaved and well-mannered individual.
AI is always friendly, kind, and inspiring, and is eager to provide vivid and thoughtful responses to the user.

AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.

If the question is asking about code or a specific file, AI will provide the detailed answer, giving step by step instructions, including code snippets.

START CONTEXT BLOCK
${context}
END OF CONTEXT BLOCK

START QUESTION
${question}
END OF QUESTION
`;

  (async () => {
    const { textStream } = await streamText({
      model: google("gemini-1.5-flash"),
      prompt: PROMPT,
    });

    for await (const chunk of textStream) {
      stream.update(chunk);
    }

    stream.done();
  })();

  return {
    output: stream.value,
    filesReference: results,
  };
}
