import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { ApiResponse } from "../utils/apiResponse";
import { AnalyticsService } from "../services/analytics.service";
import {
  adminAnalyticsOverviewQuerySchema,
  analyticsExportQuerySchema,
} from "../validators/analytics.validator";

export const getAdminAnalyticsOverview = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const query = adminAnalyticsOverviewQuerySchema.parse(req.query);
  const overview = await AnalyticsService.getAdminOverview(query);

  res.status(200).json(
    new ApiResponse(true, "Analytics overview fetched successfully", overview)
  );
};

export const exportAnalytics = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const query = analyticsExportQuerySchema.parse(req.query);
  const csvData = await AnalyticsService.exportAnalyticsCSV(query);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="sheomart_${query.type}_export_${Date.now()}.csv"`
  );
  res.status(200).send(csvData);
};

