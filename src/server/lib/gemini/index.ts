import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function aiSummariseCommit(diff: string): Promise<string> {
  if (!diff.trim()) throw new Error("Empty diff provided");
  const maxRetries = 5;
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
      if (response.promptFeedback?.blockReason)
        return "Summary blocked by safety filters";
      const text = response.text().trim();
      return text || "";
    } catch (error: unknown) {
      const retryDelay = getRetryDelay(error) ?? baseDelay * 2 ** attempt;
      if (!isRateLimitError(error) || attempt === maxRetries) throw error;
      await sleep(retryDelay);
    }
  }
  return "";
}

export async function aiSummariseCode(doc: Document) {
  const code = doc.pageContent.slice(0, 10000);
  const maxRetries = 5;
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
      return response.response.text().trim();
    } catch (error: unknown) {
      const retryDelay = getRetryDelay(error) ?? baseDelay * 2 ** attempt;
      if (!isRateLimitError(error) || attempt === maxRetries) return "";
      await sleep(retryDelay);
    }
  }
  return "";
}

export async function generateEmbedding(summary: string) {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(summary);
  return result.embedding.values;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRateLimitError(error: unknown) {
  if (typeof error !== "object" || error === null) return false;
  const message = "message" in error ? String(error["message"]) : "";
  const code = "code" in error ? error["code"] : "";
  return code === 429 || /rate limit|too many requests/i.test(message);
}

function getRetryDelay(error: unknown) {
  if (typeof error !== "object" || error === null) return null;
  const message = "message" in error ? String(error["message"]) : "";
  const match = message.match(/"retryDelay":"(\d+)s"/);
  if (match) {
    const seconds = parseInt(match[1], 10);
    return seconds * 1000;
  }
  return null;
}
