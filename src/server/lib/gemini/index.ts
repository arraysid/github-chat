import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function aiSummariseCommit(diff: string): Promise<string> {
  if (!diff.trim()) return "";
  const COMMIT_PROMPT = `
**Role:** Senior engineer analyzing git commits
**Output Format:**
* Begin with "* ", present tense verbs
* Include key files in [brackets] when relevant (max 2)
* No markdown

**Avoid:** Vague terms ("Updated files"), hyphens, trivial changes

**Examples:**
* Increase API timeout to 30s [src/api/client.ts]
* Add email format validation [utils/validators.ts]

**Task:** Analyze this diff focusing on code logic changes:
${diff}

Summary:`;

  try {
    const result = await model.generateContent(COMMIT_PROMPT);
    const response = await result.response;
    if (response.promptFeedback?.blockReason) return "";
    return response.text().trim();
  } catch {
    return "";
  }
}

export async function aiSummariseCode(doc: Document): Promise<string> {
  const code = doc.pageContent.slice(0, 10000);
  const CODE_PROMPT = `
Summarize this code from ${doc.metadata.source} for junior developers:
- Purpose and core functionality
- Max 100 words
- Clear technical terms

Code:
${code.slice(0, 10000)}

Summary:`;

  try {
    const response = await model.generateContent(CODE_PROMPT);
    return response.response.text().trim();
  } catch {
    return "";
  }
}

export async function generateEmbedding(summary: string): Promise<number[]> {
  try {
    const embedModel = genAI.getGenerativeModel({
      model: "text-embedding-004",
    });
    const result = await embedModel.embedContent(summary);
    return result.embedding.values;
  } catch {
    return [];
  }
}
