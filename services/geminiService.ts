
import { GoogleGenAI, Type } from "@google/genai";
import { DungeonTheme } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDungeonLore = async (theme: DungeonTheme) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `당신은 판타지 게임의 나레이터입니다. '${theme}' 테마의 던전에 처음 입장한 모험가에게 들려줄 분위기 있는 배경 설명을 한국어 한 문장으로 작성해주세요.`,
      config: {
        temperature: 0.7,
      },
    });
    return response.text || "어두운 기운이 느껴지는 곳입니다.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "미지의 던전에 발을 들였습니다.";
  }
};
