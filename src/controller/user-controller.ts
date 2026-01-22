import type { Request, Response } from "express";

import DatabaseService from "../services/db-service.ts";
import type { UserInfoDTO } from "../dtos/user-info-dto.ts";
import { isValidEmail } from "../utils/helper.ts";

export async function getAllUserInfo(req: Request, res: Response) {
  const db = new DatabaseService();
  const data = db.readAllUserInfo();
  return res.json({ data });
}

export async function registerUser(req: Request, res: Response) {
  const data: UserInfoDTO = {
    id: req.body.id,
    email: req.body.email as string,
    password: req.body.password as string,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!isValidEmail(data.email)) {
    return res.json({ status: 422, message: "Email is invaild!" });
  }

  if (data.password.length < 8) {
    return res.json({
      status: 422,
      message: "password must be more that 8 characters.",
    });
  }

  const db = new DatabaseService();
  const userExist = db.readUserInfo(data.email);

  if (Object.keys(userExist).length === 0) {
    db.saveUserInfo(data);
    return res.json({
      status: 201,
      message: "register successfully!",
      data: data,
    });
  }

  return res.json({
    status: 409,
    message: "user already exist with this email",
  });
}
