import Image from 'next/image';
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
    <Image
      src={image.dataUrl}
      alt={image.alt.trim() || fallbackAlt}
      width={1200}
      height={800}
      unoptimized
      className={`h-auto max-h-[28rem] w-auto max-w-full rounded-md object-contain ${className}`.trim()}
    />
  );
}
