
export interface ImageData {
  base64: string;
  mimeType: string;
  id: string;
}

export interface GenerationStatus {
  loading: boolean;
  error: string | null;
  resultUrl: string | null;
}
