import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function aiSummariseCommit(diff: string): Promise<string> {
  if (!diff.trim()) throw new Error("Empty diff provided");

  const maxRetries = 3;
  const baseDelay = 1000;
  const prompt = `You are a senior engineer analyzing git commits. Generate a SPECIFIC commit summary with these rules:

FORMAT RULES:
1. Always start bullet points with "* " (never '-')
2. Use present tense verbs ("Add", "Fix", "Update")
3. Mention key files in brackets when relevant (max 2 per bullet)
4. Never use markdown

BAD RESPONSES WILL BE REJECTED:
❌ "Updated files"
❌ "- Fixed bug"
❌ "No changes"

GOOD EXAMPLES:
* Increase API timeout to 30s [src/api/client.ts]
* Add validation for email formats [utils/validators.ts]
* Refactor database connection logic

DIFF ANALYSIS RULES:
1. Ignore trivial changes (comments, whitespace)
2. Focus on code logic changes
3. Identify primary purpose of commit

GIT DIFF TO ANALYZE:
${diff}

YOUR SUMMARY:`;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;

      if (response.promptFeedback?.blockReason) {
        return Promise.resolve("Summary blocked by safety filters");
      }

      const text = response.text().trim();
      return Promise.resolve(text || ""); // Default return in case fail
    } catch (error: unknown) {
      if (!isRateLimitError(error) || attempt === maxRetries) {
        return Promise.reject(error);
      }
      await sleep(baseDelay * 2 ** attempt);
    }
  }
  return Promise.resolve(""); // Default return in case fail
}

export async function aiSummariseCode(doc: Document) {
  const code = doc.pageContent.slice(0, 10000);
  const maxRetries = 3;
  const baseDelay = 1000;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await model.generateContent([
        `You are a senior software engineer tasked with mentoring juniors.`,
        `Summarize the following code clearly, focusing on its purpose and functionality.`,
        `Use no more than 100 words.`,
        `File: ${doc.metadata.source}`,
        `---`,
        `${code}`,
        `---`,
      ]);
      return response.response.text();
    } catch (error: unknown) {
      if (!isRateLimitError(error) || attempt === maxRetries) {
        return ""; // Default return in case fail
      }
      await sleep(baseDelay * 2 ** attempt);
    }
  }
  return "";
}

export async function generateEmbedding(summary: string) {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(summary);
  const embedding = result.embedding;
  return embedding.values;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRateLimitError(error: unknown) {
  return (
    (typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error["code"] === 429) ||
    (typeof error === "object" &&
      error !== null &&
      "message" in error &&
      /(rate limit|too munknown requests)/i.test(String(error["message"])))
  );
}
