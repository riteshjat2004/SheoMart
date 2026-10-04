import { Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse";
import { HomeService } from "../services/home.service";

export const getTrendingProducts = async (req: Request, res: Response): Promise<void> => {
  const pincode = typeof req.query.pincode === "string" ? req.query.pincode : undefined;
  const city = typeof req.query.city === "string" ? req.query.city : undefined;
  const products = await HomeService.getTrendingProducts({ pincode, city });
  res.status(200).json(new ApiResponse(true, "Trending products fetched successfully", { products }));
};

export const getHeroCarousel = async (req: Request, res: Response): Promise<void> => {
  const pincode = typeof req.query.pincode === "string" ? req.query.pincode : undefined;
  const city = typeof req.query.city === "string" ? req.query.city : undefined;
  const items = await HomeService.getHeroCarousel({ pincode, city });
  res.status(200).json(new ApiResponse(true, "Hero carousel fetched successfully", items));
};
