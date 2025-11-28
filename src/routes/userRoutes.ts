import { Router } from "express";
import { userLogIn, userLogOut } from "../controllers/userControllers";

const UserRouter = Router();


UserRouter.post("/login",userLogIn);
UserRouter.delete("/logout", userLogOut);


export default UserRouter;

