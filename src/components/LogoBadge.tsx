import { cn } from '@/lib/utils';

type LogoBadgeProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeMap: Record<NonNullable<LogoBadgeProps['size']>, string> = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-16',
};

export function LogoBadge({ size = 'md', className }: LogoBadgeProps) {
  return (
    <img
      src="/logo-ape-global.png"
      alt="APE Global"
      className={cn(
        'w-auto rounded-lg border border-border/60 bg-card/80 p-1',
        'shadow-lg shadow-black/20 backdrop-blur-sm',
        sizeMap[size],
        className,
      )}
    />
  );
}





