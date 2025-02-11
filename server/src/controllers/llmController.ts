import Groq from 'groq-sdk';
import { ChatCompletion } from 'groq-sdk/resources/chat/completions';

import { NextFunction, Request, Response } from 'express';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

type ReqBodyPayload = {
  message: string;
};

const parseAIResponse = (content: string): any => {
  try {
    // Try to extract JSON if the response includes text
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No JSON found in response');
  } catch (error) {
    console.error('Failed to parse AI response:', content);
    return {
      summary: 'Failed to parse AI response',
      recommendations: [],
      predictedOccupancy: 0,
      riskAnalysis: 'Analysis unavailable',
    };
  }
};

export default class llmController {
  static async getResponsePublic(req: Request<unknown, unknown, ReqBodyPayload>, res: Response, next: NextFunction) {
    try {
      const { message } = req.body;
      if (!message) throw { name: 'LLMBadRequest' };

      const llmResponse: ChatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant designed for the Sama Kita landing page. Your purpose is to provide concise, friendly, and relevant answers about Sama Kita`s services, which focus on automating and migrating data for sharehomes (kos-kosan). Highlight how Sama Kita helps users streamline operations and achieve passive income with minimal effort. Avoid discussing unrelated topics or making assumptions outside the scope of Sama Kita. When users inquire about joining, guide them to the wishlist sign-up process via the provided Google Form link. Maintain an approachable, professional tone that aligns with Sama Kita`s mission of empowering sharehome owners. Make your answer as little but informative as possible since we only have a small textboxes for the answer.',
          },
          {
            role: 'user',
            content: message,
          },
        ],
        model: 'llama3-8b-8192',
      });

      const llmMsg: string = llmResponse.choices[0].message.content || '';

      res.status(200).json({
        message: llmMsg,
      });
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
}
