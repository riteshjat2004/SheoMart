import { Address } from "../models/address.model";
import { AppError } from "../errors/AppError";
import { CreateAddressInput, UpdateAddressInput } from "../validators/address.validator";

export class AddressService {
  static async getAddressesForUser(userId: string) {
    return await Address.find({ userId }).sort({ isDefault: -1, updatedAt: -1 });
  }

  static async createAddress(userId: string, data: CreateAddressInput) {
    const hasDefault = await Address.exists({ userId, isDefault: true });

    if (data.isDefault) {
      await Address.updateMany({ userId, isDefault: true }, { isDefault: false });
    }

    const address = await Address.create({
      userId,
      fullName: data.fullName,
      mobile: data.mobile,
      house: data.house,
      street: data.street,
      landmark: data.landmark,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      addressType: data.addressType,
      isDefault: data.isDefault || !hasDefault,
    });

    return address;
  }

  static async updateAddress(addressId: string, userId: string, data: UpdateAddressInput) {
    const address = await Address.findOne({ addressId, userId });
    if (!address) {
      throw new AppError("Address not found", 404);
    }

    if (data.isDefault) {
      await Address.updateMany({ userId, isDefault: true }, { isDefault: false });
      address.isDefault = true;
    }

    if (data.fullName !== undefined) {
      address.fullName = data.fullName;
    }
    if (data.mobile !== undefined) {
      address.mobile = data.mobile;
    }
    if (data.house !== undefined) {
      address.house = data.house;
    }
    if (data.street !== undefined) {
      address.street = data.street;
    }
    if (data.landmark !== undefined) {
      address.landmark = data.landmark;
    }
    if (data.city !== undefined) {
      address.city = data.city;
    }
    if (data.state !== undefined) {
      address.state = data.state;
    }
    if (data.pincode !== undefined) {
      address.pincode = data.pincode;
    }
    if (data.addressType !== undefined) {
      address.addressType = data.addressType;
    }

    await address.save();
    return address;
  }

  static async deleteAddress(addressId: string, userId: string) {
    const address = await Address.findOne({ addressId, userId });
    if (!address) {
      throw new AppError("Address not found", 404);
    }

    await address.deleteOne();

    if (address.isDefault) {
      const nextAddress = await Address.findOne({ userId }).sort({ updatedAt: -1 });
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    return address;
  }
}
