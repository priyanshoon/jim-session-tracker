import { Router } from "express";

const exerciseRoute = Router();

exerciseRoute.get("/exercises");
exerciseRoute.post("/exercises");
exerciseRoute.get("/exercises/:id");

export default exerciseRoute;
