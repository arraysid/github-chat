import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export async function aiSummariseCommit(diff: string) {
  if (!diff.trim()) {
    throw new Error("Empty diff provided");
  }

  try {
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

    const result = await model.generateContent(prompt);
    const response = await result.response;

    if (response.promptFeedback?.blockReason) {
      console.error("Blocked reason:", response.promptFeedback.blockReason);
      return "Summary blocked by safety filters";
    }

    const text = response.text().trim();

    // Fallback for empty responses
    if (!text) {
      console.warn("Empty response from model");
      return "* Update code changes";
    }

    return text;
  } catch (error) {
    console.error("AI summary failed:", error);
    return "* Update implementation details";
  }
}
