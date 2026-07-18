import type { HTMLAttributes, ReactNode } from 'react';

type ContainerProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode };

export default function Container({ children, className, ...rest }: ContainerProps) {
  const classes = `page ${className ?? ''}`.trim();
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
