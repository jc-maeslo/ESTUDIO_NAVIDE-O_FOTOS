
import { GoogleGenAI, Type } from "@google/genai";
import { ImageData, DynamicVariable } from "../types";

// Helper to get Gemini instance
const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

/**
 * Analyzes uploaded images to suggest relevant professional refinement variables.
 */
export const analyzeScene = async (images: ImageData[]): Promise<DynamicVariable[]> => {
  const ai = getAi();
  
  const prompt = `
    Analyze these images like a professional photo editor. 
    Identify key subjects, lighting issues, costume flaws, or background elements that could be improved.
    Suggest 5-6 specific "Refinement Variables" for a high-end photo regeneration.
    Each variable must be technical and precise.
    
    Return the response as a JSON array of objects with the following structure:
    { "label": "Short name", "description": "Technical instruction for the editor" }
  `;

  const imageParts = images.map(img => ({
    inlineData: {
      data: img.base64.split(',')[1],
      mimeType: img.mimeType
    }
  }));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [...imageParts, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["label", "description"]
          }
        }
      }
    });

    const suggestions = JSON.parse(response.text || "[]");
    return suggestions.map((s: any) => ({
      id: Math.random().toString(36).substr(2, 9),
      label: s.label,
      description: s.description,
      isActive: true,
      isAiGenerated: true
    }));
  } catch (error) {
    console.error("Analysis Error:", error);
    return [];
  }
};

/**
 * Generates the final image based on dynamic variables.
 */
export const generateRefinedPhoto = async (
  referenceImages: ImageData[],
  variables: DynamicVariable[]
): Promise<string> => {
  const ai = getAi();
  
  const activeDirectives = variables
    .filter(v => v.isActive)
    .map(v => `- ${v.label.toUpperCase()}: ${v.description}`)
    .join("\n    ");

  const prompt = `
    Act as a world-class professional photo studio.
    Regenerate the provided scene using these specific technical refinements:
    
    ${activeDirectives}
    
    GLOBAL STANDARDS:
    - Absolute preservation of facial identity and anatomy.
    - High-end cinematic lighting (HDR).
    - Sharp focus on main subjects, professional bokeh.
    - Commercial grade 8k resolution aesthetics.
  `;

  const imageParts = referenceImages.map(img => ({
    inlineData: {
      data: img.base64.split(',')[1],
      mimeType: img.mimeType
    }
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { 
        parts: [...imageParts, { text: prompt }] 
      },
      config: {
        imageConfig: { aspectRatio: "4:3" }
      }
    });

    let imageUrl = '';
    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageUrl) throw new Error("No image generated.");
    return imageUrl;
  } catch (error) {
    console.error("Generation Error:", error);
    throw error;
  }
};
