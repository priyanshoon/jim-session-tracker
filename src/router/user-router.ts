import { Router } from "express";

import { getAllUserInfo, registerUser } from "../controller/user-controller.ts";

const userRoute = Router();

userRoute.get("/all", getAllUserInfo);
userRoute.post("/register", registerUser);

export default userRoute;
