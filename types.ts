
export interface ImageData {
  base64: string;
  mimeType: string;
  id: string;
}

export interface DynamicVariable {
  id: string;
  label: string;
  description: string;
  isActive: boolean;
  isAiGenerated: boolean;
}

export interface GenerationStatus {
  loading: boolean;
  analyzing: boolean;
  error: string | null;
  resultUrl: string | null;
}
