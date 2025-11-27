import bcrypt from "bcrypt";
import { config } from "dotenv";
import Express from "express";
import { SignJWT } from "jose";
import User from "../models/UserModel.ts";

export async function userLogIn(req: Express.Request, res: Express.Response) {
  const { name, password } = await req.body;

  const user = await User.findOne({ name });
  if (!user) return res.status(401).json({ error: "User not found" });
  const valid = bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  config();
  const token = await new SignJWT({ uid: user._id.toString(), role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("2d")
    .sign(new TextEncoder().encode(process.env.TOKEN_SECRET));

  return res
    .cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // allow navigation between same-site ports
      path: "/",
    })
    .status(201)
    .json({
      message: "success",
    });
}

export async function userLogOut(req: Express.Request, res: Express.Response) {
  // console.log(req.cookies.auth_token, req.signedCookies.auth_token);

  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ error: "Token not found" });

  // const { payload } = await jwtVerify(
  //   token,
  //   new TextEncoder().encode(process.env.TOKEN_SECRET)
  // );

  // if (payload) {
  //   await User.deleteOne({
  //     _id: new mongoose.Types.ObjectId(payload.uid as string),
  //   });
  // }

  const isProd = process.env.NODE_ENV === "production";
  return res
    .cookie("auth_token", "", {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    })
    .status(203)
    .json({
      message: "log out",
    });
}
