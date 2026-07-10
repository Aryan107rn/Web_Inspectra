export type SecurityStatus = "pass" | "warning" | "fail";

export interface SecurityInsight {
  id: string;
  label: string;
  status: SecurityStatus;
  summary: string;
  detail: string;
}
