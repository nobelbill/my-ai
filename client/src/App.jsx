import { useTimeSlot } from './hooks/useTimeSlot';
import { useTheme } from './hooks/useTheme';
import Layout from './components/Layout';
import ClockHeader from './components/ClockHeader';
import SettingsPanel from './components/SettingsPanel';

export default function App() {
  const { slot, greeting } = useTimeSlot();
  const theme = useTheme(slot);

  return (
    <div className={`min-h-screen transition-all duration-1000 ${theme.bg}`}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ClockHeader greeting={greeting} slot={slot} theme={theme} />
        <Layout slot={slot} theme={theme} />
      </div>
      <SettingsPanel theme={theme} />
    </div>
  );
}
