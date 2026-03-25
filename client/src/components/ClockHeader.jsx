import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ClockHeader({ greeting, slot, theme }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = time.toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-10"
    >
      <p className={`text-sm ${theme.subtext} mb-1`}>{dateStr}</p>
      <h1 className={`text-6xl font-bold ${theme.text} tracking-tight mb-3`}>
        {timeStr}
      </h1>
      <p className={`text-xl ${theme.subtext}`}>{greeting}</p>
    </motion.header>
  );
}
