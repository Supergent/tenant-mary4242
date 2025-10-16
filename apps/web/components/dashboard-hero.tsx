"use client";

/**
 * Dashboard Hero Component
 *
 * Main dashboard view showing task summary and recent tasks.
 * Integrates with Convex backend for live data.
 */

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, Skeleton, Badge } from "@jn703s5hkkh7cm8dfq88ydf2y57sk5w4/components";
import { CheckCircle2, Circle, Clock } from "lucide-react";

export function DashboardHero() {
  const summary = useQuery(api.endpoints.dashboard.summary);
  const recentTasks = useQuery(api.endpoints.dashboard.recent);

  if (summary === undefined || recentTasks === undefined) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-foreground">
          Task Dashboard
        </h1>
        <p className="text-neutral-foreground/60 mt-2">
          Overview of your tasks and activity
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-slate-600">
            <Circle className="h-4 w-4" />
            <span className="text-sm font-medium">To Do</span>
          </div>
          <p className="text-3xl font-bold mt-2">{summary.tasks.todo}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-sky-600">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">In Progress</span>
          </div>
          <p className="text-3xl font-bold mt-2">{summary.tasks.inProgress}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-medium">Completed</span>
          </div>
          <p className="text-3xl font-bold mt-2">{summary.tasks.completed}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 text-neutral-foreground/60">
            <span className="text-sm font-medium">Total Labels</span>
          </div>
          <p className="text-3xl font-bold mt-2">{summary.labels}</p>
        </Card>
      </div>

      {/* Recent Tasks */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Tasks</h2>
        {recentTasks.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-neutral-foreground/60">
              No tasks yet. Create your first task to get started!
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {recentTasks.map((task) => (
              <Card key={task._id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-neutral-foreground/60 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <TaskStatusBadge status={task.status} />
                      <TaskPriorityBadge priority={task.priority} />
                    </div>
                  </div>
                  {task.dueDate && (
                    <div className="text-sm text-neutral-foreground/60">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TaskStatusBadge({ status }: { status: "todo" | "in_progress" | "completed" }) {
  const variants = {
    todo: { color: "slate", label: "To Do" },
    in_progress: { color: "sky", label: "In Progress" },
    completed: { color: "green", label: "Completed" },
  };

  const variant = variants[status];

  return (
    <Badge
      variant="secondary"
      className={`text-${variant.color}-700 bg-${variant.color}-100`}
    >
      {variant.label}
    </Badge>
  );
}

function TaskPriorityBadge({ priority }: { priority: "low" | "medium" | "high" }) {
  const variants = {
    low: { color: "emerald", label: "Low" },
    medium: { color: "amber", label: "Medium" },
    high: { color: "red", label: "High" },
  };

  const variant = variants[priority];

  return (
    <Badge
      variant="outline"
      className={`text-${variant.color}-700 border-${variant.color}-300`}
    >
      {variant.label}
    </Badge>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-64 mt-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-9 w-16 mt-2" />
          </Card>
        ))}
      </div>

      <div>
        <Skeleton className="h-7 w-32 mb-4" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full mt-2" />
              <div className="flex gap-2 mt-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
