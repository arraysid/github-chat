"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format, formatDistanceToNow } from "date-fns";
import { ChevronDown, ExternalLink } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useGetAllProject } from "../../_hooks/use-get-all-project";
import { useGetCommits } from "../../_hooks/use-get-commits";

export function CommitLog() {
  const { data: commits, isLoading } = useGetCommits();
  const { data: projects } = useGetAllProject();
  const params = useParams();
  const projectId = String(params.projectId);
  const project = projects?.find((p) => p.id === projectId);
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    if (!isLoading && commits) {
      const byDate = commits
        .filter((c) => c.projectId === projectId)
        .reduce((acc: Record<string, typeof commits>, c) => {
          const d = new Date(c.commitDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          acc[d] = acc[d] || [];
          acc[d].push(c);
          return acc;
        }, {});
      const init = Object.keys(byDate).reduce(
        (a, d) => {
          a[d] = true;
          return a;
        },
        {} as Record<string, boolean>,
      );
      setExpandedDates(init);
    }
  }, [isLoading, commits, projectId]);

  if (isLoading) {
    return (
      <div className="w-full space-y-4 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center space-x-4 rounded-md border border-gray-800 p-4"
          >
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3 rounded" />
              <Skeleton className="h-3 w-2/5 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const commitsByDate = commits
    ?.filter((c) => c.projectId === projectId)
    .reduce((acc: Record<string, typeof commits>, c) => {
      const d = new Date(c.commitDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      acc[d] = acc[d] || [];
      acc[d].push(c);
      return acc;
    }, {});

  return (
    <div className="w-full p-4 font-sans text-gray-300">
      {commitsByDate &&
        Object.entries(commitsByDate).map(([date, list]) => (
          <div key={date} className="mb-6">
            <div className="mb-2 flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-gray-400 hover:bg-transparent hover:text-gray-200"
                onClick={() =>
                  setExpandedDates((prev) => ({ ...prev, [date]: !prev[date] }))
                }
              >
                <ChevronDown
                  className={`mr-2 h-4 w-4 transition-transform ${
                    expandedDates[date] ? "rotate-0" : "-rotate-90"
                  }`}
                />
              </Button>
              <h2 className="text-sm text-gray-400">
                {list.length} commits on {date}
              </h2>
            </div>
            {expandedDates[date] && (
              <div className="overflow-hidden rounded-md border border-gray-800">
                {list.map((commit, idx) => {
                  const rawTitle = commit.commitMessage.split("\n")[0];
                  const prMatch = rawTitle.match(/\(#(\d+)\)/);
                  const prNumber = prMatch?.[1];
                  const title = rawTitle.replace(/\s*\(#\d+\)/, "");
                  const url = `${project?.url}/commit/${commit.commitHash}`;
                  const isLast = idx === list.length - 1;
                  return (
                    <div
                      key={commit.id}
                      className={`border-b border-gray-800 ${
                        isLast ? "border-b-0" : ""
                      }`}
                    >
                      <div className="flex flex-col p-4">
                        <div className="flex justify-between">
                          <h3 className="font-medium text-gray-200">
                            {title}
                            {prNumber && (
                              <span className="ml-1 text-gray-400">
                                (
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline"
                                >
                                  #{prNumber}
                                </a>
                                )
                              </span>
                            )}
                          </h3>
                          <div className="flex items-center space-x-2 text-gray-500">
                            <span className="font-mono text-xs">
                              {commit.commitHash.slice(0, 7)}
                            </span>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-500 hover:text-gray-300"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </a>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center space-x-2 text-xs text-gray-400">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={commit.commitAuthorAvatar} />
                            <AvatarFallback>
                              {commit.commitAuthorName[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            {commit.commitAuthorName} committed{" "}
                            {formatDistanceToNow(new Date(commit.commitDate))}{" "}
                            ago •{" "}
                            <time
                              dateTime={new Date(
                                commit.commitDate,
                              ).toISOString()}
                            >
                              {format(new Date(commit.commitDate), "PPpp")}
                            </time>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
    </div>
  );
}
