import type { QueryCtx } from "../_generated/server";
import type { TableNamesInDataModel, DataModel } from "../_generated/server";

const TABLES = ["tasks", "labels", "taskLabels", "threads", "messages", "userPreferences", "taskActivity", "taskComments"] as const;
const PRIMARY_TABLE = "tasks" as TableNamesInDataModel<DataModel>;

export async function loadSummary(ctx: QueryCtx, userId?: string) {
  const perTable: Record<string, number> = {};

  for (const table of TABLES) {
    const records = await ctx.db.query(table as TableNamesInDataModel<DataModel>).collect();
    const scopedRecords = userId ? records.filter((record: any) => record.userId === userId) : records;
    perTable[table] = scopedRecords.length;
  }

  const totals = Object.values(perTable);
  const totalRecords = totals.reduce((sum, count) => sum + count, 0);

  return {
    totalRecords,
    perTable,
    activeUsers: perTable["users"] ?? 0,
    primaryTableCount: perTable[PRIMARY_TABLE] ?? 0,
  };
}

export async function loadRecent(ctx: QueryCtx, userId?: string, limit = 5) {
  const records = await ctx.db.query(PRIMARY_TABLE).collect();
  const scopedRecords = userId ? records.filter((record: any) => record.userId === userId) : records;

  scopedRecords.sort((a: any, b: any) => {
    const aTime = a.updatedAt ?? 0;
    const bTime = b.updatedAt ?? 0;
    return bTime - aTime;
  });

  return scopedRecords.slice(0, limit).map((record: any) => ({
    _id: record._id,
    name: record.title ?? "Untitled",
    status: record.status,
    updatedAt: record.updatedAt ?? null,
  }));
}