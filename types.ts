
export interface ImageData {
  base64: string;
  mimeType: string;
  id: string;
}

export interface RefinementOptions {
  hideReindeerEars: boolean;
  uprightAntlers: boolean;
  lookAtCamera: boolean;
  preservePhysiology: boolean;
  removeDog: boolean;
  addToyTrain: boolean;
  snowyWindow: boolean;
}

export interface GenerationStatus {
  loading: boolean;
  error: string | null;
  resultUrl: string | null;
}
