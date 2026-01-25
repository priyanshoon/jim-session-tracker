import { Router } from "express";

import { requireAuth } from "../middleware/auth.ts";
import {
  registerUser,
  getUserProfile,
  logout,
  loginUser,
} from "../controller/user-controller.ts";

const userRoute = Router();

userRoute.post("/register", registerUser);
userRoute.post("/login", loginUser);
userRoute.post("/logout", logout);
userRoute.get("/me", requireAuth, getUserProfile);

export default userRoute;
