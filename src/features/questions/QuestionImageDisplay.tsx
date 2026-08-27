import type { QuestionImage } from '@/src/types/questionImage';

export function QuestionImageDisplay({
  image,
  fallbackAlt,
  className = '',
}: {
  image: QuestionImage | null | undefined;
  fallbackAlt: string;
  className?: string;
}) {
  if (!image) return null;

  return (
    // Generated data URLs are rendered directly; Next's optimizer is not applicable.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image.dataUrl}
      alt={image.alt.trim() || fallbackAlt}
      className={`h-auto max-h-[28rem] w-auto max-w-full rounded-md object-contain ${className}`.trim()}
    />
  );
}
