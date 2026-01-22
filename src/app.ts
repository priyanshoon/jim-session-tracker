import express from "express";

import userRoute from "./router/user-router.ts";
import logger from "./middleware/logger.ts";
import DatabaseService from "./services/db-service.ts";

const db = new DatabaseService();
const app = express();
const PORT = 3000;

db.initializeDB();

app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/user", userRoute);

app.get("/health", (req: express.Request, res: express.Response) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log("server is up running on port 3000");
});
