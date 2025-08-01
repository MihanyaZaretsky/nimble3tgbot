require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

console.log('🧪 ТЕСТОВЫЙ БОТ');
console.log('🔑 Токен:', process.env.BOT_TOKEN ? 'НАЙДЕН' : 'НЕ НАЙДЕН');

if (!process.env.BOT_TOKEN) {
  console.error('❌ BOT_TOKEN не найден!');
  process.exit(1);
}

const bot = new TelegramBot(process.env.BOT_TOKEN, { 
  polling: true 
});

console.log('✅ Бот создан');

// Тест команды /start
bot.onText(/\/start/, (msg) => {
  console.log('🎯 КОМАНДА /start получена!');
  console.log('👤 От:', msg.from.first_name);
  console.log('💬 Chat ID:', msg.chat.id);
  
  bot.sendMessage(msg.chat.id, '🎉 ТЕСТ: Команда /start работает!')
    .then(() => console.log('✅ Сообщение отправлено'))
    .catch(err => console.error('❌ Ошибка отправки:', err));
});

// Тест всех сообщений
bot.on('message', (msg) => {
  console.log('📨 Сообщение:', msg.text);
});

// Обработка ошибок
bot.on('error', (error) => {
  console.error('❌ Ошибка:', error.message);
});

bot.on('polling_error', (error) => {
  console.error('❌ Polling ошибка:', error.message);
});

console.log('🤖 Тестовый бот запущен');
console.log('📱 Отправьте /start для теста'); 