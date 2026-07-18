import Image from 'next/image';

type LogoVariant = 'mark' | 'wordmark';

export type LogoProps = {
  variant?: LogoVariant;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
};

export default function Logo({
  variant = 'mark',
  alt = 'lembar',
  width,
  height,
  className,
  priority = false,
}: LogoProps) {
  const src = variant === 'mark' ? '/lembar/logo-mark.png' : '/lembar/logo-wordmark.png';
  const defaultWidth = variant === 'mark' ? 32 : 96;
  const defaultHeight = variant === 'mark' ? 32 : 64;
  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? defaultWidth}
      height={height ?? defaultHeight}
      className={className}
      priority={priority}
    />
  );
}
