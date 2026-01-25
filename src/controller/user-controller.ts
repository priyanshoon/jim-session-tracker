import type { NextFunction, Request, Response } from "express";

import UserDatabaseService from "../database/user-dbservice.ts";
import type { UserInfoDTO } from "../dtos/user-info-dto.ts";
import { isValidEmail } from "../utils/helper.ts";
import { encryptPassword, checkPassword } from "../utils/password.ts";

const db = new UserDatabaseService();

export async function getAllUserInfo(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = db.readAllUserInfo();
    return res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
}

export async function getUserProfile(req: Request, res: Response) {
  const userId = req.session.userId;
  const user = db.readUserInfo(+userId as number);
  const { password, ...profile } = user ?? {};
  res.status(200).json({
    data: {
      profile,
    },
  });
}

export async function loginUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "email and password are required!" });
  }

  if (!isValidEmail(email)) {
    return res.status(422).json({ message: "email is invalid" });
  }

  if (password.length < 8) {
    return res
      .status(422)
      .json({ message: "password must be more than 8 charaters" });
  }

  try {
    const userExist = db.getUserByEmail(email);

    if (!userExist) {
      return res.status(401).json({ message: "user doesn't exists" });
    }

    const isValidPassword = await checkPassword(password, userExist.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: "invalid username or password!" });
    }

    req.session.regenerate(function (err) {
      if (err) next(err);
      req.session.userId = userExist.id;
      req.session.save(function (err) {
        if (err) return next(err);
        return res.status(200).json({ message: "login successfully" });
      });
    });
  } catch (error) {
    next(error);
  }
}

export async function registerUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id, email, password } = req.body as {
      id?: number;
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    if (!isValidEmail(email)) {
      return res.json({ status: 422, message: "Email is invaild!" });
    }

    if (password.length < 8) {
      return res.json({
        status: 422,
        message: "password must be more that 8 characters.",
      });
    }

    const userExist = db.getUserByEmail(email);

    if (!userExist) {
      const hash: string = await encryptPassword(password);
      const data: UserInfoDTO = {
        id: id as number,
        email: email,
        password: hash,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.saveUserInfo(data);
      return res.status(201).json({
        message: "register successfully",
        data: {
          id: data.id,
          email: data.email,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        },
      });
    }

    return res.json({
      status: 409,
      message: "user already exist with this email",
    });
  } catch (error) {
    next(error);
  }
}
