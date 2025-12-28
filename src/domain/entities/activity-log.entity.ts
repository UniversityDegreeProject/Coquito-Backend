export interface ActivityLogEntity {
  id: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  action: string;
  entity: string;
  entityId: string | null;
  description: string;
  metadata: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface PaginatedActivityLogsEntity {
  data: ActivityLogEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
