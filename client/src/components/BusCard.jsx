import Card from './Card';
import { Bus, Clock, MapPin } from 'lucide-react';

export default function BusCard({ data, stationName, type, theme, delay = 0 }) {
  if (!data || data.length === 0) return null;

  const title = type === 'commute' ? '출근 버스' : '퇴근 버스';
  const icon = type === 'commute' ? '🚌' : '🏠';

  return (
    <Card theme={theme} delay={delay}>
      <div className="flex items-center gap-2 mb-4">
        <Bus className={`w-5 h-5 ${theme.icon}`} />
        <h3 className={`font-semibold ${theme.text}`}>{icon} {title}</h3>
      </div>
      {stationName && (
        <div className={`flex items-center gap-1.5 mb-3 text-xs ${theme.subtext}`}>
          <MapPin className="w-3 h-3" />
          <span>{stationName}</span>
        </div>
      )}
      <div className="space-y-3">
        {data.map((bus, i) => (
          <div key={i} className={`flex items-center justify-between py-2 px-3 rounded-xl ${theme.badge}`}>
            <span className="font-bold text-sm">{bus.routeName}</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span className="text-sm font-medium">{bus.firstArrival}</span>
              </div>
              <span className="text-xs opacity-60">{bus.secondArrival}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
