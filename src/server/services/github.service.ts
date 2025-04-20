import axios from "axios";
import { db } from "../lib/database";
import { commits } from "../lib/database/schema";
import { aiSummariseCommit } from "../lib/gemini";
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
      return typeof response.value === "string" ? response.value : "";
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

  const insertedCommits = await db.insert(commits).values(rows).returning();

  return insertedCommits;
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
  const [owner, repo] = githubUrl.split("/").slice(-2);

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
