import { useState } from 'react';
import Card from './Card';
import { Newspaper, Monitor, TrendingUp, Users } from 'lucide-react';

const catIcons = {
  it: Monitor,
  economy: TrendingUp,
  politics: Users,
};
const catLabels = {
  it: 'IT/기술',
  economy: '경제/금융',
  politics: '정치/사회',
};

export default function NewsCard({ data, theme, delay = 0 }) {
  const [activeTab, setActiveTab] = useState('it');

  if (!data) return null;

  const categories = Object.keys(data);
  const articles = data[activeTab] || [];

  return (
    <Card theme={theme} delay={delay} className="col-span-full lg:col-span-2">
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className={`w-5 h-5 ${theme.icon}`} />
        <h3 className={`font-semibold ${theme.text}`}>📰 주요 뉴스</h3>
      </div>

      <div className="flex gap-2 mb-4">
        {categories.map(cat => {
          const Icon = catIcons[cat] || Newspaper;
          return (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                ${activeTab === cat ? theme.badge + ' shadow-sm' : theme.subtext + ' hover:opacity-70'}`}
            >
              <Icon className="w-3 h-3" />
              {catLabels[cat]}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {articles.map((article, i) => (
          <a
            key={i}
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`block p-3 rounded-xl hover:scale-[1.01] transition-transform ${theme.cardBg} border ${theme.border}`}
          >
            <p className={`font-medium text-sm ${theme.text} line-clamp-1`}>{article.title}</p>
            <p className={`text-xs ${theme.subtext} mt-1 line-clamp-2`}>{article.description}</p>
          </a>
        ))}
      </div>
    </Card>
  );
}
