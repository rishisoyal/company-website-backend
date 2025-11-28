import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import Express from "express";
import User from "../models/UserModel";
import {config} from "dotenv";

config(); // load once

export async function userLogIn(req: Express.Request, res: Express.Response) {
	const { name, password } = req.body;

	if (!name || !password) {
		return res.status(400).json({ error: "Missing credentials" });
	}

	const user = await User.findOne({ name });
	if (!user) return res.status(401).json({ error: "User not found" });

	const valid = await bcrypt.compare(password, user.password_hash);
	if (!valid) return res.status(401).json({ error: "Invalid credentials" });

	const token = await new SignJWT({ uid: user._id.toString(), role: user.role })
		.setProtectedHeader({ alg: "HS256" })
		.setExpirationTime("2d")
		.sign(new TextEncoder().encode(process.env.TOKEN_SECRET));

	const isProd = process.env.NODE_ENV === "production";
	// console.log(process.env.NODE_ENV);
	
	console.log("user login")
	return res
		.cookie("auth_token", token, {
			httpOnly: true,
			secure: isProd,
			sameSite: false,
			path: "/", // MUST MATCH logout
			maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
		})
		.status(200)
		.json({ message: "success" });
}

export async function userLogOut(req: Express.Request, res: Express.Response) {
	const token = req.cookies.auth_token;
	// console.log(token);

	if (!token) return res.status(401).json({ error: "Token not found" });

	const isProd = process.env.NODE_ENV === "production";
	console.log("user logout")
	return res
		.cookie("auth_token", "", {
			httpOnly: true,
			secure: isProd,
			sameSite: false,
			path: "/",
			expires: new Date(0),
		})
		.status(200)
		.json({ message: "logged out" });
}
