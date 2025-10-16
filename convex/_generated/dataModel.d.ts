// Auto-generated type stubs for development
// These will be replaced by 'npx convex dev'

export type DataModel = {
  "tasks": any;
  "labels": any;
  "taskLabels": any;
  "threads": any;
  "messages": any;
  "userPreferences": any;
  "taskActivity": any;
  "taskComments": any;
};

export type TableNames = "tasks" | "labels" | "taskLabels" | "threads" | "messages" | "userPreferences" | "taskActivity" | "taskComments";

export type Id<TableName extends TableNames> = string & { __tableName: TableName };
export type Doc<TableName extends TableNames> = any;
