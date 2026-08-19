import { z } from "zod";

function isValidTimezone(value: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

const dateParameter = z.string().trim().min(1).refine((value) => !Number.isNaN(Date.parse(value)), "Date must be ISO-compatible");

export const adminAnalyticsOverviewQuerySchema = z.object({
  from: dateParameter.optional(),
  to: dateParameter.optional(),
  timezone: z.string().trim().min(1).default("UTC").refine(isValidTimezone, "Timezone must be a valid IANA timezone"),
}).strict();

export type AdminAnalyticsOverviewQuery = z.infer<typeof adminAnalyticsOverviewQuerySchema>;
