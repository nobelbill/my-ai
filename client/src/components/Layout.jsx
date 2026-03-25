import { useApi } from '../hooks/useApi';
import { fetchDashboard } from '../utils/api';
import WeatherCard from './WeatherCard';
import BusCard from './BusCard';
import NewsCard from './NewsCard';
import MessageCard from './MessageCard';
import { Loader2 } from 'lucide-react';

export default function Layout({ slot, theme }) {
  const { data, loading } = useApi(fetchDashboard, [slot], 60000);

  if (loading && !data) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className={`w-8 h-8 animate-spin ${theme.icon}`} />
      </div>
    );
  }

  const cards = data?.cards || {};

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <WeatherCard data={cards.weather} theme={theme} delay={0.1} />
      <MessageCard data={cards.message} slot={slot} theme={theme} delay={0.2} />

      {(slot === 'morning' || slot === 'evening') && (
        <BusCard
          data={cards.bus}
          stationName={slot === 'morning' ? '고양시 정류장' : '강남 정류장'}
          type={slot === 'morning' ? 'commute' : 'home'}
          theme={theme}
          delay={0.3}
        />
      )}

      {slot === 'afternoon' && (
        <NewsCard data={cards.news} theme={theme} delay={0.3} />
      )}
    </div>
  );
}
