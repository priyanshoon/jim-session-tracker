import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import redisClient from "./services/redis-session.ts";
import { RedisStore } from "connect-redis";

dotenv.config();

import userRoute from "./router/user-router.ts";
import logger from "./middleware/logger.ts";
import DatabaseService from "./database/user-dbservice.ts";

const db = new DatabaseService();
const app = express();
const PORT = 3000;

db.initializeDB();

let redisStore = new RedisStore({
  client: redisClient,
  prefix: "sess:",
});

app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "http://localhost:5000", credentials: true }));
app.use(
  session({
    name: "sid",
    secret: process.env.COOKIE_SECRET!,
    store: redisStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);

app.use("/user", userRoute);

app.get("/", (req: express.Request, res: express.Response) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log("server is up running on port 3000");
});
