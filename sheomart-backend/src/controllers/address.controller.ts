import { Response } from "express";
import { AppError } from "../errors/AppError";
import { AuthRequest } from "../middleware/auth.middleware";
import { ApiResponse } from "../utils/apiResponse";
import { AddressService } from "../services/address.service";
import { createAddressSchema, updateAddressSchema } from "../validators/address.validator";

export const getAddresses = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const addresses = await AddressService.getAddressesForUser(req.user?.userId as string);

  res.status(200).json(
    new ApiResponse(true, "Addresses fetched successfully", { addresses })
  );
};

export const createAddress = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const payload = (req.body && typeof req.body === "object" ? req.body : {}) as Record<string, unknown>;
  const result = createAddressSchema.safeParse(payload);

  if (!result.success) {
    const message = result.error.issues[0]?.message || "Invalid address payload";
    throw new AppError(message, 400);
  }

  const address = await AddressService.createAddress(req.user?.userId as string, result.data);

  res.status(201).json(
    new ApiResponse(true, "Address created successfully", { address })
  );
};

export const updateAddress = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const addressId = Array.isArray(req.params.addressId) ? req.params.addressId[0] : req.params.addressId;
  const payload = (req.body && typeof req.body === "object" ? req.body : {}) as Record<string, unknown>;
  const result = updateAddressSchema.safeParse(payload);

  if (!result.success) {
    const message = result.error.issues[0]?.message || "Invalid address update payload";
    throw new AppError(message, 400);
  }

  const address = await AddressService.updateAddress(addressId, req.user?.userId as string, result.data);

  res.status(200).json(
    new ApiResponse(true, "Address updated successfully", { address })
  );
};

export const deleteAddress = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const addressId = Array.isArray(req.params.addressId) ? req.params.addressId[0] : req.params.addressId;
  const address = await AddressService.deleteAddress(addressId, req.user?.userId as string);

  res.status(200).json(
    new ApiResponse(true, "Address deleted successfully", { address })
  );
};
