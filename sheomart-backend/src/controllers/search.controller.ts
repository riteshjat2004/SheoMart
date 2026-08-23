import { Response } from "express";
import { AppError } from "../errors/AppError";
import { SearchService } from "../services/search.service";
import { ApiResponse } from "../utils/apiResponse";

export const search = async (req: { query: Record<string, unknown> }, res: Response): Promise<void> => {
  const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (query.length < 2) {
    throw new AppError("Search query must contain at least 2 characters", 400);
  }

  const results = await SearchService.search(query);
  res.status(200).json(new ApiResponse(true, "Search results fetched successfully", results));
};
