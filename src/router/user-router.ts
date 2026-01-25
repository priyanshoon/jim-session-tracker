import { Router } from "express";

import { requireAuth } from "../middleware/auth.ts";
import {
  getAllUserInfo,
  registerUser,
  getUserProfile,
  loginUser,
} from "../controller/user-controller.ts";

const userRoute = Router();

// userRoute.get("/all", getAllUserInfo);
userRoute.post("/register", registerUser);
userRoute.post("/login", loginUser);
userRoute.get("/me", requireAuth, getUserProfile);

export default userRoute;
