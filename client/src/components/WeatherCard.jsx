import Card from './Card';
import { Cloud, Sun, CloudRain, CloudSnow, CloudDrizzle, Droplets, Wind } from 'lucide-react';

const skyIcons = {
  '맑음': Sun,
  '구름많음': Cloud,
  '흐림': Cloud,
};

const ptyIcons = {
  '비': CloudRain,
  '비/눈': CloudDrizzle,
  '눈': CloudSnow,
  '소나기': CloudRain,
};

export default function WeatherCard({ data, theme, delay = 0 }) {
  if (!data) return null;

  const SkyIcon = ptyIcons[data.precipitation] || skyIcons[data.sky] || Sun;

  return (
    <Card theme={theme} delay={delay}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${theme.subtext} mb-1`}>오늘 날씨</p>
          <p className={`text-4xl font-bold ${theme.text}`}>{data.temperature}°</p>
          <p className={`text-sm ${theme.subtext} mt-1`}>
            {data.sky} · 강수확률 {data.rainProbability}%
          </p>
        </div>
        <SkyIcon className={`w-16 h-16 ${theme.icon}`} strokeWidth={1.5} />
      </div>
      <div className={`flex gap-4 mt-4 pt-4 border-t ${theme.border}`}>
        <div className="flex items-center gap-1.5">
          <Droplets className={`w-4 h-4 ${theme.icon}`} />
          <span className={`text-xs ${theme.subtext}`}>습도 {data.humidity}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Wind className={`w-4 h-4 ${theme.icon}`} />
          <span className={`text-xs ${theme.subtext}`}>풍속 {data.windSpeed}m/s</span>
        </div>
      </div>
    </Card>
  );
}
