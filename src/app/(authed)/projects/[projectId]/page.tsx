import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RiCalendarEventLine } from "react-icons/ri";
import { ChatCard } from "./_components/chat-card";
import { CommitLog } from "./_components/commit-log";

export default function Page() {
  return (
    <main className="container mx-auto p-4 md:p-6">
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Project Assistant
        </h1>
        <p className="text-muted-foreground">
          Get insights on your codebase and commit history
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left column - Cards stack (50% width) */}
        <div className="space-y-6">
          <ChatCard />
          <CreateMeetingCard />
        </div>

        {/* Right column - CommitLog (50% width) */}
        <div className="space-y-6">
          <CommitLog />
        </div>
      </div>
    </main>
  );
}

function CreateMeetingCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Meeting</CardTitle>
        <CardDescription>
          Create a new team meeting or code review session
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full gap-2">
          <RiCalendarEventLine className="h-4 w-4" />
          Create Meeting
        </Button>
      </CardContent>
    </Card>
  );
}
