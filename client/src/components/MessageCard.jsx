import Card from './Card';
import { Sparkles } from 'lucide-react';

export default function MessageCard({ data, slot, theme, delay = 0 }) {
  if (!data) return null;

  const isQuoteSlot = slot === 'morning' || slot === 'evening';

  return (
    <Card theme={theme} delay={delay}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className={`w-5 h-5 ${theme.icon}`} />
        <h3 className={`font-semibold ${theme.text}`}>
          {slot === 'morning' ? '✨ 오늘의 명언' : slot === 'evening' ? '🌙 하루 마감' : '💬 한마디'}
        </h3>
      </div>

      {isQuoteSlot && data.quote && (
        <div className={`mb-4 pl-4 border-l-2 ${theme.border}`}>
          <p className={`text-lg italic ${theme.text} leading-relaxed`}>
            "{data.quote}"
          </p>
          {data.author && (
            <p className={`text-sm ${theme.subtext} mt-2`}>— {data.author}</p>
          )}
        </div>
      )}

      {data.message && (
        <p className={`${theme.subtext} leading-relaxed`}>{data.message}</p>
      )}
    </Card>
  );
}
