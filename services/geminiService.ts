
import { GoogleGenAI } from "@google/genai";
import { ImageData, RefinementOptions } from "../types";

export const generateChristmasPhoto = async (
  referenceImages: ImageData[],
  options: RefinementOptions
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  // Build dynamic instructions based on professional variables
  const directives: string[] = [];

  if (options.preservePhysiology) {
    directives.push("- CRITICAL: Maintain exact facial features and physiology of the children. Do not add, remove, or modify any facial characteristics.");
  }

  if (options.lookAtCamera) {
    directives.push("- Subjects must be looking directly at the camera lens with natural, warm expressions.");
  }

  if (options.hideReindeerEars || options.uprightAntlers) {
    let costumeText = "- COSTUME ADJUSTMENT: ";
    if (options.hideReindeerEars) costumeText += "The floppy reindeer ears from the hood MUST NOT be visible. ";
    if (options.uprightAntlers) costumeText += "The reindeer antlers/horns must be perfectly upright, rigid, and prominent.";
    directives.push(costumeText);
  }

  if (options.removeDog) {
    directives.push("- REMOVAL: Do not include the dog from the reference photos in the final composition.");
  }

  if (options.addToyTrain || options.snowyWindow) {
    directives.push("- ENVIRONMENT: Set in a luxurious cozy living room with a white snowy Christmas tree.");
    if (options.addToyTrain) directives.push("- Include a detailed vintage toy train set moving around the base of the tree.");
    if (options.snowyWindow) directives.push("- Background features a large window with a view of a snowy pine forest at dusk.");
  }

  const prompt = `
    Generate a professional high-end studio photography based on the provided reference images.
    
    TECHNICAL DIRECTIVES:
    ${directives.join("\n    ")}
    
    STYLE:
    - High Dynamic Range (HDR), cinematic lighting, professional color grading.
    - Sharp focus on the children (one in Santa outfit, one in Reindeer hood).
    - 8k resolution, commercial photography quality.
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
        parts: [
          ...imageParts,
          { text: prompt }
        ] 
      },
      config: {
        imageConfig: {
          aspectRatio: "4:3"
        }
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

    if (!imageUrl) throw new Error("No se pudo generar la imagen.");
    return imageUrl;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
