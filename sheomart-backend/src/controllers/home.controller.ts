import { Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse";
import { HomeService } from "../services/home.service";

export const getTrendingProducts = async (_req: Request, res: Response): Promise<void> => {
  const products = await HomeService.getTrendingProducts();
  res.status(200).json(new ApiResponse(true, "Trending products fetched successfully", { products }));
};

export const getHeroCarousel = async (_req: Request, res: Response): Promise<void> => {
  const items = await HomeService.getHeroCarousel();
  res.status(200).json(new ApiResponse(true, "Hero carousel fetched successfully", items));
};
