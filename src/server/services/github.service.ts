import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import axios from "axios";
import { db } from "../lib/database";
import { commits, sourceCodeEmbeddings } from "../lib/database/schema";
import { aiSummariseCommit, generateEmbedding } from "../lib/gemini";
import { octokit } from "../lib/octokit";
import { findManyCommitByProjectId } from "../repositories/commit.repository";
import { findOneGithubUrlByProjectId } from "../repositories/project.repository";

export async function pollCommits(projectId: string) {
  const githubUrl = await findOneGithubUrlByProjectId(projectId);
  const commitHashes = await getCommitHashes(githubUrl);
  const unprocessedCommits = await filterUnproccessedCommits(
    projectId,
    commitHashes,
  );

  const summaryResponses = await Promise.allSettled(
    unprocessedCommits.map((commit) =>
      summarizeCommits(githubUrl, commit.commitHash),
    ),
  );
  const summaries = summaryResponses.map((response) => {
    if (response.status === "fulfilled") {
      return response.value;
    }
    return "";
  });

  const rows = summaries.map((summary, index) => ({
    projectId,
    commitHash: unprocessedCommits[index].commitHash,
    commitMessage: unprocessedCommits[index].commitMessage,
    commitAuthorName: unprocessedCommits[index].commitAuthorName,
    commitAuthorAvatar: unprocessedCommits[index].commitAuthorAvatar,
    commitDate: new Date(unprocessedCommits[index].commitDate),
    summary,
  }));

  if (rows.length > 0) {
    const insertedCommits = await db
      .insert(commits)
      .values(rows)
      .onConflictDoNothing()
      .returning();

    return insertedCommits;
  }

  return [];
}

export async function indexGithubRepo(
  projectId: string,
  githubUrl: string,
  githubToken: string | null,
) {
  const docs = await loadGithubRepo(githubUrl, githubToken);
  const embeddings = await generateEmbeddings(docs);
  await Promise.allSettled(
    embeddings.map(async (embedding, index) => {
      console.log(`processing embedding ${index + 1} of ${embeddings.length}`);
      if (!embedding) return;
      const sourceCodeEmbedding = await db.insert(sourceCodeEmbeddings).values({
        projectId,
        summary: embedding.summary,
        sourceCode: embedding.sourceCode,
        fileName: embedding.fileName,
        summaryEmbedding: embedding.embedding,
      });

      return sourceCodeEmbedding;
    }),
  );
}

async function loadGithubRepo(githubUrl: string, githubToken: string | null) {
  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: githubToken || "",
    branch: "main",
    ignoreFiles: [
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
      "bun.lockb",
    ],
    recursive: true,
    unknown: "warn",
    maxConcurrency: 5,
  });

  const docs = await loader.load();
  return docs;
}

async function generateEmbeddings(docs: Document[]) {
  return await Promise.all(
    docs.map(async (doc) => {
      const summary = await aiSummariseCommit(doc.pageContent);
      const embedding = await generateEmbedding(summary);

      return {
        summary,
        embedding,
        sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
        fileName: doc.metadata.source,
      };
    }),
  );
}

async function summarizeCommits(githubUrl: string, commitHash: string) {
  const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
    headers: {
      Accept: "application/vnd.github.v3.diff",
    },
  });

  const summirizedCommit = await aiSummariseCommit(data);

  return summirizedCommit || "";
}

async function getCommitHashes(githubUrl: string) {
  const [owner, repo] = githubUrl.replace(/\/+$/, "").split("/").slice(-2);

  if (!owner || !repo) {
    throw new Error("Invalid github url");
  }

  const { data } = await octokit.rest.repos.listCommits({ owner, repo });

  const sortedCommits = data
    .sort(
      (a, b) =>
        new Date(b.commit.author?.date || "").getTime() -
        new Date(a.commit.author?.date || "").getTime(),
    )
    .slice(0, 15);

  return sortedCommits.map((commit) => ({
    commitHash: commit.sha,
    commitMessage: commit.commit.message ?? "",
    commitAuthorName: commit.commit.author?.name ?? "",
    commitAuthorAvatar: commit.author?.avatar_url ?? "",
    commitDate: commit.commit.author?.date ?? "",
  }));
}

async function filterUnproccessedCommits(
  projectId: string,
  commitHashes: Awaited<ReturnType<typeof getCommitHashes>>,
) {
  const processedCommits = await findManyCommitByProjectId(projectId);

  const unprocessedCommits = (await commitHashes).filter(
    (commit) =>
      !processedCommits.some(
        (processedCommit) => processedCommit.commitHash === commit.commitHash,
      ),
  );

  return unprocessedCommits;
}
