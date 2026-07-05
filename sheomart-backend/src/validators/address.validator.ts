import { z } from "zod";
import { ADDRESS_TYPES } from "../models/address.model";

export const createAddressSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  mobile: z.string().trim().min(8, "Mobile number is required"),
  house: z.string().trim().min(1, "House / flat is required"),
  street: z.string().trim().min(1, "Street is required"),
  landmark: z.string().trim().optional().default(""),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State is required"),
  pincode: z.string().trim().min(4, "Pincode is required"),
  addressType: z.enum([ADDRESS_TYPES.HOME, ADDRESS_TYPES.WORK, ADDRESS_TYPES.OTHER]).optional().default(ADDRESS_TYPES.HOME),
  isDefault: z.boolean().optional().default(false),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>;

export const updateAddressSchema = createAddressSchema.partial();

export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
