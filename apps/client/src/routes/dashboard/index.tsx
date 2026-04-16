import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back. Here's an overview of your workspace.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-6 text-card-foreground ring-1 ring-foreground/10">
          <h3 className="text-sm font-medium text-muted-foreground">
            Getting Started
          </h3>
          <p className="mt-2 text-2xl font-bold">Build something great</p>
          <p className="mt-1 text-sm text-muted-foreground">
            This is your dashboard home. Add widgets and content here.
          </p>
        </div>
      </div>
    </div>
  );
}
