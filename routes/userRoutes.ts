import { Router } from "express";
import { userLogIn, userLogOut } from "../controllers/userControllers.ts";

const UserRouter = Router();


UserRouter.post("/login",userLogIn);
UserRouter.delete("/logout", userLogOut);


export default UserRouter;

