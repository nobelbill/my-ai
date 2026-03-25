const { Notification } = require('electron');

function showNotification(title, body) {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show();
  }
}

function startNotifier() {
  setInterval(() => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();

    if (h === 7 && m === 0) {
      showNotification('☀️ 좋은 아침!', '오늘의 출근 정보와 날씨를 확인해보세요.');
    }
    if (h === 17 && m === 30) {
      showNotification('🌙 퇴근 시간!', '퇴근 버스 정보를 확인해보세요.');
    }
  }, 60000);
}

module.exports = { startNotifier, showNotification };
