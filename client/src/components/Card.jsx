import { motion } from 'framer-motion';

export default function Card({ children, theme, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`rounded-2xl p-6 shadow-lg ${theme.cardBg} border ${theme.border} ${className}`}
    >
      {children}
    </motion.div>
  );
}
