import { Router } from "express";
import {
  createAddress,
  deleteAddress,
  getAddresses,
  updateAddress,
} from "../controllers/address.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { USER_ROLES } from "../constants/roles";

const router = Router();

router.use(authenticate, authorize(USER_ROLES.CUSTOMER));
router.get("/", asyncHandler(getAddresses));
router.post("/", asyncHandler(createAddress));
router.patch("/:addressId", asyncHandler(updateAddress));
router.delete("/:addressId", asyncHandler(deleteAddress));

export default router;
