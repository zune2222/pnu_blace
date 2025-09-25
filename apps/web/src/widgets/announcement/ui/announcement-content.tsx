interface AnnouncementContentProps {
  content: string;
}

export const AnnouncementContent = ({ content }: AnnouncementContentProps) => {
  return (
    <div className="text-sm text-foreground/80 leading-relaxed space-y-2">
      {content.split('\\n').map((line, index) => {
        if (!line.trim()) return <div key={index} className="h-2" />;
        
        return (
          <p key={index} className="break-words">
            {line}
          </p>
        );
      })}
    </div>
  );
};