import { z } from "zod";

/**
 * Schema para buscar activity logs
 */
export const searchActivityLogsSchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  entity: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().optional(),
});

export type SearchActivityLogsDto = z.infer<typeof searchActivityLogsSchema>;
