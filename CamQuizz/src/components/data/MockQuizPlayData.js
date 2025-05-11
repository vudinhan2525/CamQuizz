export const mockQuiz = {
  id: 'test-quiz-123',
  title: 'Kiến Thức Chung Về Lập Trình',
  description: 'Bài kiểm tra kiến thức cơ bản về lập trình và công nghệ thông tin',
  questions: 10,
  duration: 20,
  plays: 45,
  author: 'Admin Test',
  category: 'Công Nghệ',
  image: 'https://i.pinimg.com/736x/be/01/85/be0185c37ebe61993e2ae5c818a7b85d.jpg'
};

export const mockQuestions = [
  {
    id: 'q1',
    text: 'JavaScript là gì?',
    type: 'single', 
    duration: 30, 
    choices: [
      { id: 'a1', text: 'Một ngôn ngữ lập trình', isCorrect: true },
      { id: 'a2', text: 'Một ngôn ngữ đánh dấu', isCorrect: false },
      { id: 'a3', text: 'Một hệ quản trị cơ sở dữ liệu', isCorrect: false },
      { id: 'a4', text: 'Một hệ điều hành', isCorrect: false },
    ],
  },
  {
    id: 'q2',
    text: 'Đâu là ngôn ngữ lập trình hướng đối tượng?',
    type: 'multiple', // nhiều đáp án đúng
    duration: 45,
    choices: [
      { id: 'a1', text: 'Java', isCorrect: true },
      { id: 'a2', text: 'C++', isCorrect: true },
      { id: 'a3', text: 'HTML', isCorrect: false },
      { id: 'a4', text: 'Python', isCorrect: true },
    ],
  },
  {
    id: 'q3',
    text: 'Thuật ngữ "API" là viết tắt của?',
    type: 'single',
    duration: 20,
    choices: [
      { id: 'a1', text: 'Application Programming Interface', isCorrect: true },
      { id: 'a2', text: 'Automated Program Installation', isCorrect: false },
      { id: 'a3', text: 'Advanced Programming Innovation', isCorrect: false },
      { id: 'a4', text: 'Application Process Integration', isCorrect: false },
    ],
  },
  {
    id: 'q4',
    text: 'Đâu là các công nghệ front-end phổ biến?',
    type: 'multiple',
    duration: 40,
    choices: [
      { id: 'a1', text: 'React', isCorrect: true },
      { id: 'a2', text: 'Angular', isCorrect: true },
      { id: 'a3', text: 'Express', isCorrect: false },
      { id: 'a4', text: 'Vue', isCorrect: true },
    ],
  },
  {
    id: 'q5',
    text: 'Đâu là cơ sở dữ liệu NoSQL?',
    type: 'multiple',
    duration: 35,
    choices: [
      { id: 'a1', text: 'MongoDB', isCorrect: true },
      { id: 'a2', text: 'MySQL', isCorrect: false },
      { id: 'a3', text: 'PostgreSQL', isCorrect: false },
      { id: 'a4', text: 'Redis', isCorrect: true },
    ],
  }
];

export const mockPlayers = [
  { id: 'p1', name: 'Player 1', avatar: 'https://i.pinimg.com/736x/be/01/85/be0185c37ebe61993e2ae5c818a7b85d.jpg', score: 0 },
  { id: 'p2', name: 'Player 2', avatar: 'https://i.pinimg.com/736x/be/01/85/be0185c37ebe61993e2ae5c818a7b85d.jpg', score: 0 },
  { id: 'p3', name: 'Player 3', avatar: 'https://i.pinimg.com/736x/be/01/85/be0185c37ebe61993e2ae5c818a7b85d.jpg', score: 0 },
  { id: 'p4', name: 'Player 4', avatar: 'https://i.pinimg.com/736x/be/01/85/be0185c37ebe61993e2ae5c818a7b85d.jpg', score: 0 },
  { id: 'p5', name: 'Player 5', avatar: 'https://i.pinimg.com/736x/be/01/85/be0185c37ebe61993e2ae5c818a7b85d.jpg', score: 0 },
  { id: 'p6', name: 'Player 6', avatar: 'https://i.pinimg.com/736x/be/01/85/be0185c37ebe61993e2ae5c818a7b85d.jpg', score: 0 },
  { id: 'p7', name: 'Player 7', avatar: 'https://i.pinimg.com/736x/be/01/85/be0185c37ebe61993e2ae5c818a7b85d.jpg', score: 0 },
  { id: 'p8', name: 'Player 8', avatar: 'https://i.pinimg.com/736x/be/01/85/be0185c37ebe61993e2ae5c818a7b85d.jpg', score: 0 },
  { id: 'p9', name: 'Player 9', avatar: 'https://i.pinimg.com/736x/be/01/85/be0185c37ebe61993e2ae5c818a7b85d.jpg', score: 0 },
  { id: 'p10', name: 'Player 10', avatar: 'https://i.pinimg.com/736x/be/01/85/be0185c37ebe61993e2ae5c818a7b85d.jpg', score: 0 },
];

// Hàm tạo mã phòng ngẫu nhiên
export const generateRoomCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};