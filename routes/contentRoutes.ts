import { Router } from "express";
import { getContent, postContent } from "../controllers/contentControllers.ts";

const ContentRouter = Router();

ContentRouter.get("/", getContent);
ContentRouter.post("/", postContent);

export default ContentRouter;
