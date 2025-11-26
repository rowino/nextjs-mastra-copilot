export type ColumnDef = {
  name: string;
  type: "text" | "integer" | "decimal" | "date" | "boolean";
  nullable?: boolean;
  description?: string;
};

export type WidgetConfig = {
  sql: string;
  chartType?: "line" | "bar" | "pie" | "area";
  xAxis?: string;
  yAxis?: string;
  aggregation?: "sum" | "avg" | "count" | "min" | "max";
};

export type AutomationConfig =
  | {
      type: "threshold_alert";
      query: string;
      threshold: number;
      condition: "above" | "below";
      emailTo: string;
    }
  | {
      type: "scheduled_report";
      query: string;
      schedule: string; // cron expression
      emailTo: string;
      emailSubject?: string;
    };
