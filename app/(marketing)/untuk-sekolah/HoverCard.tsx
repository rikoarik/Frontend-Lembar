'use client';

interface HoverCardProps {
  children: React.ReactNode;
  className?: string;
}

export function HoverCard({ children, className }: HoverCardProps) {
  return (
    <div
      className={className}
      style={{ transform: 'translateY(0px) rotate(1deg)' }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px) rotate(0deg)')
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLDivElement).style.transform = 'translateY(0px) rotate(1deg)')
      }
    >
      {children}
    </div>
  );
}
