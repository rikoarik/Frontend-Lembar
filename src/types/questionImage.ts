export type QuestionImage = {
  dataUrl: string;
  alt: string;
  mimeType: 'image/webp' | 'image/png';
  providerModelId?: string;
};

export function toQuestionImage(value: unknown): QuestionImage | null {
  if (!value || typeof value !== 'object') return null;

  const image = value as Record<string, unknown>;
  if (
    typeof image.dataUrl !== 'string' ||
    typeof image.alt !== 'string' ||
    (image.mimeType !== 'image/webp' && image.mimeType !== 'image/png')
  ) {
    return null;
  }

  return {
    dataUrl: image.dataUrl,
    alt: image.alt,
    mimeType: image.mimeType,
    ...(typeof image.providerModelId === 'string'
      ? { providerModelId: image.providerModelId }
      : {}),
  };
}
