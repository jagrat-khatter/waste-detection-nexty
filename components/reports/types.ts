import { ReportStatus, WasteReport, DetectedItem } from "@prisma/client";

export type ReportWithItems = WasteReport & {
  detectedItems: DetectedItem[];
};

export interface FetchReportsResponse {
  data: ReportWithItems[];
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
