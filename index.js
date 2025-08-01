require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

// Проверяем, что токен есть
if (!process.env.BOT_TOKEN) {
  console.error('❌ BOT_TOKEN не найден в переменных окружения!');
  process.exit(1);
}

// Инициализация бота с проверкой на существующие сессии
const bot = new TelegramBot(process.env.BOT_TOKEN, { 
  polling: false, // Сначала не запускаем polling
  webHook: false
});

console.log('🤖 Nimble Roulette Bot инициализирован');

// Функция для безопасного запуска бота
async function startBot() {
  try {
    console.log('🔄 Запуск бота...');
    await bot.startPolling({
      interval: 100,
      params: {
        timeout: 5
      }
    });
    console.log('✅ Бот успешно запущен!');
  } catch (error) {
    if (error.code === 'ETELEGRAM' && error.response?.body?.error_code === 409) {
      console.error('❌ Обнаружена конфликтующая сессия! Остановите другие экземпляры бота.');
      console.error('💡 Решение:');
      console.error('   1. Остановите локальный бот (Ctrl+C)');
      console.error('   2. Убедитесь, что на Render только один экземпляр');
      console.error('   3. Перезапустите приложение');
      process.exit(1);
    } else {
      console.error('❌ Ошибка запуска бота:', error.message);
      process.exit(1);
    }
  }
}

// Создание Express сервера для Web App
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для парсинга JSON
app.use(express.json());
app.use(express.static('public'));

// Обработка команды /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.first_name;
  
  const welcomeMessage = `🎰 Добро пожаловать в *Nimble Roulette*, ${username}! 🎰

🎲 Готов испытать удачу? Нажми на кнопку ниже, чтобы открыть игру!

🎮 *Nimble Roulette* - это захватывающая игра, где каждый может стать победителем!`;

  const webAppButton = {
    text: '🎮 Открыть Nimble Roulette',
    web_app: {
      url: process.env.WEBAPP_URL || 'https://example.com'
    }
  };

  const keyboard = {
    inline_keyboard: [[webAppButton]]
  };

  try {
    await bot.sendMessage(chatId, welcomeMessage, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  } catch (error) {
    console.error('Ошибка при отправке сообщения:', error);
  }
});

// Обработка callback_query от кнопок
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  
  try {
    await bot.answerCallbackQuery(callbackQuery.id);
  } catch (error) {
    console.error('Ошибка при обработке callback:', error);
  }
});

// Обработка Web App данных
bot.on('web_app_data', async (msg) => {
  const chatId = msg.chat.id;
  const webAppData = msg.web_app_data;
  
  console.log('Получены данные от Web App:', webAppData);
  
  try {
    await bot.sendMessage(chatId, '🎉 Данные получены! Скоро здесь будет обработка результатов игры.');
  } catch (error) {
    console.error('Ошибка при обработке Web App данных:', error);
  }
});

// Обработка ошибок
bot.on('error', (error) => {
  console.error('Ошибка бота:', error);
});

bot.on('polling_error', (error) => {
  console.error('Ошибка polling:', error);
});

// Маршруты для Web App
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nimble Roulette</title>
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            .container {
                text-align: center;
                max-width: 400px;
                background: rgba(255, 255, 255, 0.1);
                padding: 30px;
                border-radius: 20px;
                backdrop-filter: blur(10px);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            }
            h1 {
                margin-bottom: 20px;
                font-size: 2.5em;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
            }
            .roulette-wheel {
                width: 200px;
                height: 200px;
                border: 8px solid #ffd700;
                border-radius: 50%;
                margin: 20px auto;
                background: conic-gradient(
                    #ff0000 0deg 45deg,
                    #000000 45deg 90deg,
                    #ff0000 90deg 135deg,
                    #000000 135deg 180deg,
                    #ff0000 180deg 225deg,
                    #000000 225deg 270deg,
                    #ff0000 270deg 315deg,
                    #000000 315deg 360deg
                );
                animation: spin 3s ease-out;
            }
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            .placeholder-text {
                margin-top: 20px;
                font-size: 1.2em;
                opacity: 0.8;
            }
            .close-btn {
                background: #ff6b6b;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 25px;
                font-size: 16px;
                cursor: pointer;
                margin-top: 20px;
                transition: background 0.3s;
            }
            .close-btn:hover {
                background: #ff5252;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎰 Nimble Roulette</h1>
            <div class="roulette-wheel"></div>
            <p class="placeholder-text">
                🎲 Это заглушка для Web App<br>
                Здесь будет настоящая игра в рулетку!
            </p>
            <button class="close-btn" onclick="closeWebApp()">Закрыть</button>
        </div>

        <script>
            // Инициализация Telegram Web App
            const tg = window.Telegram.WebApp;
            tg.ready();
            tg.expand();

            function closeWebApp() {
                tg.close();
            }

            // Отправка данных обратно в бота (пример)
            function sendDataToBot(data) {
                tg.sendData(JSON.stringify(data));
            }
        </script>
    </body>
    </html>
  `);
});

// Запуск сервера и бота
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`🌐 Web App доступен по адресу: http://localhost:${PORT}`);
  
  // Запускаем бота после запуска сервера
  startBot().then(() => {
    console.log(`🤖 Nimble Roulette Bot готов к работе!`);
    console.log(`📱 Используйте команду /start для начала работы`);
  });
});

// Обработка graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Получен сигнал SIGTERM, завершаем работу...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Получен сигнал SIGINT, завершаем работу...');
  bot.stopPolling();
  process.exit(0);
}); 