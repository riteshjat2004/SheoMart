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

export const getCustomerInsights = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const insights = await AnalyticsService.getCustomerInsights(req.user?.userId as string);

  res.status(200).json(
    new ApiResponse(true, "Customer insights fetched successfully", insights)
  );
};

export const getSellerAnalyticsOverview = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const query = {
    from: req.query.from as string | undefined,
    to: req.query.to as string | undefined,
    range: req.query.range as string | undefined,
    timezone: req.query.timezone as string | undefined,
  };

  const overview = await AnalyticsService.getSellerOverview(
    req.user?.userId as string,
    query
  );

  res.status(200).json(
    new ApiResponse(true, "Seller analytics fetched successfully", overview)
  );
};

export const exportSellerAnalytics = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const query = {
    type: req.query.type as string | undefined,
    from: req.query.from as string | undefined,
    to: req.query.to as string | undefined,
  };

  const csvData = await AnalyticsService.exportSellerAnalyticsCSV(
    req.user?.userId as string,
    query
  );

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="store_${query.type || "analytics"}_export_${Date.now()}.csv"`
  );
  res.status(200).send(csvData);
};



