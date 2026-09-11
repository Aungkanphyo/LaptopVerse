import { Request, Response } from "express";
import { askAiAdvisorService } from "../services/ai.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/error.utils";

export const askAiAdvisor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { prompt } = req.body;

  // Input Validation
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw new AppError('A valid prompt text is required.', 400);
  }

  if (prompt.trim().length > 500) {
    throw new AppError('Prompt length cannot exceed 500 characters.', 400);
  }

  const answer = await askAiAdvisorService(prompt.trim());

  res.status(200).json({
    success: true,
    data: {
      answer,
    },
  });
});