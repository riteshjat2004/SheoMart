import { PlatformFeeConfig } from "../models/platformFeeConfig.model";
import { PlatformFeeConfigInput } from "../validators/platformFee.validator";

const defaults = { amount: 10, feeType: "FIXED" as const, minimumOrderAmount: 0, maximumPlatformFee: undefined, enabled: true };

export class PlatformFeeService {
  static async getConfig() {
    const config = await PlatformFeeConfig.findOne().lean();
    return config ?? defaults;
  }

  static async updateConfig(userId: string, input: PlatformFeeConfigInput) {
    return PlatformFeeConfig.findOneAndUpdate({}, { ...input, updatedBy: userId }, { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true });
  }

  static calculate(config: Awaited<ReturnType<typeof PlatformFeeService.getConfig>>, subtotal: number) {
    if (!config.enabled || subtotal < (config.minimumOrderAmount ?? 0)) return 0;
    const raw = config.feeType === "PERCENTAGE" ? subtotal * config.amount / 100 : config.amount;
    return Math.max(0, Math.min(raw, config.maximumPlatformFee ?? Number.POSITIVE_INFINITY));
  }
}
