interface EmojiProps {
  children: string;
  className?: string;
  /** 접근성을 위한 라벨 (스크린 리더용) */
  label?: string;
}

/**
 * Tossface 이모지 컴포넌트
 * 
 * @example
 * <Emoji>🔥</Emoji>
 * <Emoji label="불꽃">🔥</Emoji>
 * <Emoji className="text-2xl">🎉</Emoji>
 */
export function Emoji({ children, className = "", label }: EmojiProps) {
  return (
    <span
      className={`emoji ${className}`}
      role="img"
      aria-label={label}
      aria-hidden={!label}
    >
      {children}
    </span>
  );
}
