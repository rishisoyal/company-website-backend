import express from "express";
import { config } from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import ContentRouter from "./routes/contentRoutes";
import UserRouter from "./routes/userRoutes";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";

config();
const MONGODB_URI = process.env.MONGODB_URI;
const port = process.env.PORT;
if (!MONGODB_URI) {
  console.error("'MONGODB_URI' not found in the .env file");
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI, {
    dbName: "company_website",
  })
  .then(() => {
    console.log("Successfully connected to the database");
  })
  .catch((err: mongoose.Error) => {
    console.error(err.message);
  });

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
app.use(
  cors({
    origin: function (origin, callback) {
      // allow non-browser tools like Postman (no origin)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS: " + origin));
      }
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(fileUpload());
app.use("/api/content", ContentRouter);
app.use("/api/user", UserRouter);

app.listen(port, (err) => {
  if (err) {
    console.error(err);
  }
  console.log(`App running at http://localhost:${port}`);
});
