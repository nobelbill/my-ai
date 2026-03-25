const QUOTES = {
  morning: [
    { quote: '오늘 하루도 당신의 가능성을 믿으세요.', author: '무명', message: '새로운 하루가 시작됐어요. 오늘도 멋진 하루 보내세요! ☀️' },
    { quote: '매일 아침은 새로운 시작이다.', author: '무명', message: '어제는 지나갔고, 오늘은 선물입니다. 화이팅! 💪' },
    { quote: '작은 진전이라도 진전은 진전이다.', author: '무명', message: '한 걸음씩, 오늘도 천천히 나아가요 🌱' },
    { quote: '행복은 습관이다. 그것을 몸에 지니라.', author: '허버드', message: '좋은 습관으로 시작하는 아침, 오늘도 좋은 일이 가득하길! 🌞' },
    { quote: '성공은 매일 반복한 작은 노력의 합이다.', author: '로버트 콜리어', message: '오늘의 작은 노력이 큰 결과를 만들어요 ✨' },
    { quote: '시작이 반이다.', author: '아리스토텔레스', message: '출근길 힘내세요! 오늘 하루도 잘 될 거예요 🚀' },
    { quote: '할 수 있다고 믿으면 이미 반은 이룬 것이다.', author: '루즈벨트', message: '자신감을 가지고 오늘 하루를 시작해보세요 💫' },
    { quote: '오늘 할 수 있는 일을 내일로 미루지 마라.', author: '벤자민 프랭클린', message: '오늘의 열정이 내일의 성과가 됩니다 🔥' },
    { quote: '꿈을 꾸는 것은 현실의 시작이다.', author: '무명', message: '당신의 꿈은 충분히 이뤄질 가치가 있어요 🌈' },
    { quote: '미소는 세상에서 가장 아름다운 언어다.', author: '무명', message: '오늘도 웃으면서 시작해봐요. 좋은 아침! 😊' },
  ],
  late_morning: [
    { message: '오전도 거의 끝! 조금만 더 힘내세요 💪' },
    { message: '점심시간이 곧 다가와요. 뭐 먹을지 생각해보세요 🍜' },
    { message: '오전에 할 일 잘 마무리하고 계신가요? 멋져요 ⭐' },
    { message: '잠깐 물 한 잔 마시고 리프레시! 💧' },
    { message: '좋은 오전! 집중력이 최고인 시간이에요 🎯' },
    { message: '오늘의 작은 목표 하나, 이미 달성하셨을지도! 🏆' },
    { message: '열심히 하는 당신, 점심이 기다리고 있어요 🍱' },
    { message: '오전의 마지막 스퍼트! 파이팅 🔥' },
    { message: '차 한 잔 하면서 잠깐 여유를 즐겨보세요 🍵' },
    { message: '오전도 화이팅! 반은 지나갔어요 😊' },
  ],
  afternoon: [
    { message: '오후도 힘내세요! 점심 맛있게 드셨나요? 🍚' },
    { message: '반쯤 왔어요! 남은 시간도 화이팅 💪' },
    { message: '잠깐 스트레칭 한번 어떠세요? 🧘' },
    { message: '오늘도 열심히 하는 당신, 멋져요 ⭐' },
    { message: '커피 한 잔의 여유를 즐겨보세요 ☕' },
    { message: '좋은 오후! 오늘의 목표에 한 발 더 가까이 🎯' },
    { message: '피곤하면 잠깐 쉬어도 괜찮아요 😌' },
    { message: '오후의 햇살처럼 따뜻한 시간 보내세요 🌤️' },
    { message: '작은 성취도 축하할 가치가 있어요 🎉' },
    { message: '끝까지 집중! 퇴근이 기다리고 있어요 🏃' },
  ],
  evening: [
    { quote: '쉼 없는 노력보다 현명한 휴식이 낫다.', author: '무명', message: '오늘도 수고했어요. 편안한 저녁 보내세요 🌙' },
    { quote: '내일은 또 다른 기회의 날이다.', author: '무명', message: '하루를 잘 마무리하고 푹 쉬세요 😴' },
    { quote: '오늘의 나에게 수고했다고 말해주세요.', author: '무명', message: '당신은 오늘도 충분히 잘했어요 💜' },
    { quote: '별은 어두운 밤에만 빛난다.', author: '무명', message: '힘든 하루였어도 내일은 더 빛날 거예요 ⭐' },
    { quote: '가장 어두운 밤도 끝나고 해는 뜬다.', author: '빅토르 위고', message: '편안한 밤 되세요. 내일이 기대됩니다 🌅' },
    { quote: '행복은 여행이지 목적지가 아니다.', author: '무명', message: '오늘 하루도 여정의 일부였어요. 잘했습니다 🛤️' },
    { quote: '지금 이 순간을 즐기세요.', author: '무명', message: '저녁의 여유를 만끽하세요 🍵' },
    { quote: '잘 쉬는 것도 실력이다.', author: '무명', message: '충분히 쉬고 내일을 위한 에너지를 충전하세요 🔋' },
    { quote: '감사할 줄 아는 사람이 행복하다.', author: '무명', message: '오늘 하루 감사한 일 하나를 떠올려보세요 🙏' },
    { quote: '내일의 나는 오늘보다 더 나을 것이다.', author: '무명', message: '성장하는 당신을 응원합니다. 좋은 밤 되세요 🌜' },
  ],
  idle: [
    { message: '늦은 시간까지 수고하셨어요. 푹 쉬세요 🌙' },
    { message: '편안한 밤 보내세요. 내일도 좋은 하루가 될 거예요 ✨' },
    { message: '잠이 보약이래요. 일찍 주무세요 😴' },
    { message: '조용한 밤, 편안한 꿈 꾸세요 🌟' },
    { message: '오늘 하루도 고생 많으셨어요 💫' },
  ],
};

function getMessage(slot) {
  const list = QUOTES[slot] || QUOTES.idle;
  // 날짜 기반 deterministic 선택 (매일 다른 명언)
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const index = dayIndex % list.length;
  return list[index];
}

module.exports = { getMessage, QUOTES };
