function getTimeSlot(hour) {
  if (hour >= 6 && hour < 9) return 'morning';
  if (hour >= 9 && hour < 12) return 'late_morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'idle';
}

function getGreeting(slot) {
  const greetings = {
    morning: '좋은 아침이에요! ☀️',
    late_morning: '오전도 화이팅! 💪',
    afternoon: '좋은 오후에요! 🌤️',
    evening: '수고한 하루, 편안한 저녁 되세요 🌙',
    idle: '편안한 시간 보내세요 ✨',
  };
  return greetings[slot] || greetings.idle;
}

module.exports = { getTimeSlot, getGreeting };
