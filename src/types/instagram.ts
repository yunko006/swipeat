// Types pour la réponse de notre API Instagram
export interface InstagramResponse {
  username: string;
  sourceUrl: string;
  videoUrl: string;
  extension: string;
  description: string;
  thumbnail: string;
}

export interface InstagramError {
  error: string;
}
