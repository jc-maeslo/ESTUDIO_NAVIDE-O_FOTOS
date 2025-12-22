
import { GoogleGenAI } from "@google/genai";
import { ImageData } from "../types";

export const generateChristmasPhoto = async (referenceImages: ImageData[]): Promise<string> => {
  // Fix: Initialize GoogleGenAI using process.env.API_KEY directly as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  // Custom prompt based on user's specific requirements
  const prompt = `
    Generate a professional high-quality photography based on the provided reference images.
    
    CORE REQUIREMENTS:
    - Preserve the identity and facial features of the two children (one toddler in a reindeer costume, one older child in a Santa outfit).
    - Ensure both children are looking directly at the camera with natural, warm smiles and expressions.
    - RECTIFY THE COSTUME: The reindeer hood's antlers/ears must be perfectly upright and firm, not floppy or folded down.
    - REMOVE THE DOG: Do not include the white dog from the original photos in the new image.
    
    ENVIRONMENT & AESTHETICS:
    - Set the scene in a cozy, luxurious Christmas living room.
    - The Christmas tree must be snowy white, decorated with elegant silver and gold ornaments.
    - At the base of the tree, include a classic detailed toy train set.
    - Background: A large window revealing a deep green forest with soft, light snowflakes falling outside.
    
    TECHNICAL SPECS:
    - Cinematic lighting, high HDR (High Dynamic Range), vibrant colors.
    - Exceptional definition, sharp focus on the children, soft bokeh on the background forest.
    - Perfect exposure and contrast, clear and bright atmosphere (not dark).
    - Professional photography style, 8k resolution feel.
  `;

  // Fix: Construct parts array more cleanly to avoid 'as any' and ensure correct typing
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
    
    // Iterate through parts to find the image part
    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageUrl) {
      throw new Error("No se pudo generar la imagen. Inténtalo de nuevo con descripciones más claras.");
    }

    return imageUrl;
  } catch (error) {
    console.error("Gemini API Error:", error);
    if (error instanceof Error && error.message.includes("Requested entity was not found")) {
      throw new Error("API Key mismatch or invalid model. Please check configuration.");
    }
    throw error;
  }
};
