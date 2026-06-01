// Google Gemini SDK 싱글턴 클라이언트

import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

/** Gemini 클라이언트 반환 (싱글턴) */
export function getGeminiClient(): GoogleGenAI {
  if (!client) {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GOOGLE_AI_API_KEY 환경변수가 설정되지 않았습니다.\n" +
          "Google AI Studio(https://aistudio.google.com)에서 API 키를 발급받고\n" +
          ".env.local 파일에 GOOGLE_AI_API_KEY를 추가하세요.",
      );
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}
