import { z } from "zod";

export const platformFeeConfigSchema = z.object({
  amount: z.number().min(0),
  feeType: z.enum(["FIXED", "PERCENTAGE"]),
  minimumOrderAmount: z.number().min(0).optional(),
  maximumPlatformFee: z.number().min(0).optional(),
  enabled: z.boolean(),
}).strict();

export type PlatformFeeConfigInput = z.infer<typeof platformFeeConfigSchema>;
