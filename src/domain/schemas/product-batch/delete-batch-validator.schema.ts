import { z as zod } from "zod";

export const deleteBatchSchema = zod.object({
  batchId: zod.uuid({ error: "ID de batch inválido" }),
});

export type DeleteBatchSchema = zod.infer<typeof deleteBatchSchema>;

