"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { readStreamableValue } from "ai/rsc";
import { LucideLoader, SendHorizonal } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FiCode, FiFile } from "react-icons/fi";
import { HiOutlineChat } from "react-icons/hi";
import { RxCursorArrow, RxDotFilled } from "react-icons/rx";
import { z } from "zod";
import { askQuestion } from "../_actions/stream-answer";

const formSchema = z.object({
  question: z.string().max(500),
});

type FormSchema = z.infer<typeof formSchema>;

type FileReference = {
  id: string;
  summaryEmbedding: number[] | null;
  sourceCode: string;
  fileName: string;
  summary: string;
  projectId: string;
};

export function ChatCard() {
  const params = useParams();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [filesReference, setFilesReference] = useState<FileReference[] | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: { question: "" },
  });

  const isDisabled = form.watch("question").trim().length === 0;

  const onSubmit = async (data: FormSchema) => {
    try {
      setError(null);
      setAnswer("");
      setIsLoading(true);
      setOpen(true);

      const { output, filesReference } = await askQuestion(
        data.question,
        String(params.projectId),
      );

      setFilesReference(filesReference);

      for await (const chunk of readStreamableValue(output)) {
        if (chunk) setAnswer((prev) => prev + chunk);
      }
    } catch (err) {
      setError("Failed to get response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HiOutlineChat className="text-primary h-5 w-5" />
              Project AI Chat
            </CardTitle>
            <CardDescription>
              Get explanations, refactoring suggestions, and commit analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
              >
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Question</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="e.g. Where in the codebase is the function to create a new user?"
                          className="min-h-[120px] resize-none"
                          maxLength={500}
                          onChange={(e) =>
                            field.onChange(e.target.value.slice(0, 500))
                          }
                          aria-label="Enter your question for the AI chat"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="gap-2"
                    disabled={isDisabled}
                    aria-label="Send question"
                  >
                    Send <SendHorizonal className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <DialogContent className="h-[95dvh] w-[95dvw] max-w-none sm:max-w-none">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <HiOutlineChat className="text-primary h-5 w-5" />
              <span className="flex-1">AI Chat Response</span>
              {isLoading && (
                <LucideLoader
                  className="text-muted-foreground h-5 w-5 animate-spin"
                  aria-label="Loading indicator"
                />
              )}
            </DialogTitle>
            <DialogDescription className="flex items-center justify-between">
              {isLoading ? (
                <span className="flex items-center gap-1.5 text-sm">
                  <RxDotFilled className="text-primary animate-pulse" />
                  Streaming response...
                </span>
              ) : (
                <span>Response ready</span>
              )}
              <span className="text-muted-foreground text-xs font-medium">
                {filesReference?.length || 0} files referenced
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[70vh] space-y-4 overflow-y-auto p-1">
            {error && (
              <div className="bg-destructive/10 text-destructive rounded-lg p-4">
                {error}
              </div>
            )}

            <div className="bg-background mb-6 rounded-xl border p-6 shadow-sm">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                {answer.split("\n").map((line, i) => (
                  <p
                    key={`${i}-${line.substring(0, 5)}`}
                    className="animate-fade-in text-foreground/90 mb-3"
                  >
                    {line}
                    {i === answer.split("\n").length - 1 && isLoading && (
                      <RxCursorArrow
                        className="text-primary ml-1 inline-block animate-pulse"
                        aria-label="Typing indicator"
                      />
                    )}
                  </p>
                ))}
              </div>
            </div>

            {filesReference && filesReference.length > 0 && (
              <Tabs defaultValue={filesReference[0].id}>
                <TabsList className="flex h-12 overflow-x-auto px-2">
                  {filesReference.map((file) => (
                    <TabsTrigger
                      key={file.id}
                      value={file.id}
                      className="data-[state=active]:bg-secondary gap-2 truncate px-4"
                    >
                      <FiFile className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                      <span className="max-w-[160px] truncate text-sm">
                        {file.fileName}
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {filesReference.map((file) => (
                  <TabsContent key={file.id} value={file.id} className="mt-4">
                    <div className="bg-background rounded-xl border shadow-sm">
                      <div className="bg-muted/40 border-b px-6 py-3">
                        <div className="flex items-center gap-3">
                          <FiCode className="text-primary h-5 w-5" />
                          <h3 className="font-mono text-sm font-semibold">
                            {file.fileName}
                          </h3>
                        </div>
                      </div>
                      <pre className="overflow-x-auto p-6">
                        <code className="grid font-mono text-sm leading-relaxed">
                          {file.sourceCode.split("\n").map((line, i) => (
                            <div key={i} className="group flex">
                              <span className="text-muted-foreground pr-4 select-none">
                                {i + 1}
                              </span>
                              <span
                                className={cn(
                                  "flex-1",
                                  line.trimStart().startsWith("//") &&
                                    "text-green-600 dark:text-green-400",
                                  line.trimStart().startsWith("function") &&
                                    "text-blue-600 dark:text-blue-400",
                                  line.trimStart().startsWith("const") &&
                                    "text-emerald-600 dark:text-emerald-400",
                                )}
                              >
                                {line}
                              </span>
                            </div>
                          ))}
                        </code>
                      </pre>
                      {file.summary && (
                        <div className="bg-muted/40 border-t p-4">
                          <div className="bg-background rounded-lg p-3 shadow-sm">
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              {file.summary}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              aria-label="Close dialog"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
