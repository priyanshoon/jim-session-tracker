import express from "express";

const logger = function (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  console.log(`[${req.method}]: ${req.url}`);
  next();
};

export default logger;
