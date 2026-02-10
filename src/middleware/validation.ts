import type { Request, Response, NextFunction } from "express";

export function validateRequestBody(requiredFields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingFields = requiredFields.filter(field => {
      const value = req.body[field];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    next();
  };
}

export function validateNumericFields(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const invalidFields = fields.filter(field => {
      const value = req.body[field];
      return value !== undefined && (isNaN(Number(value)) || !isFinite(Number(value)));
    });

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid numeric fields: ${invalidFields.join(', ')}`
      });
    }

    next();
  };
}

export function validatePositiveNumericFields(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const invalidFields = fields.filter(field => {
      const value = Number(req.body[field]);
      return req.body[field] !== undefined && (isNaN(value) || !isFinite(value) || value <= 0);
    });

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Fields must be positive numbers: ${invalidFields.join(', ')}`
      });
    }

    next();
  };
}

export function validateNonNegativeNumericFields(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const invalidFields = fields.filter(field => {
      const value = Number(req.body[field]);
      return req.body[field] !== undefined && (isNaN(value) || !isFinite(value) || value < 0);
    });

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Fields must be non-negative numbers: ${invalidFields.join(', ')}`
      });
    }

    next();
  };
}

export function sanitizeStringFields(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    fields.forEach(field => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        req.body[field] = req.body[field].trim();
      }
    });
    next();
  };
}