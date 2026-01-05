// Types pour la réponse de notre API Instagram
export interface InstagramResponse {
  username: string;
  sourceUrl: string;
  videoUrl: string;
  videoUrlExpiresAt: Date | null;
  extension: string;
  description: string;
  thumbnail: string;
  thumbnailExpiresAt: Date | null;
}

export interface InstagramError {
  error: string;
}
