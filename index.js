require('dotenv').config();
const { Bot, Composer } = require('grammy');
const { conversations, createConversation } = require('@grammyjs/conversations');
const { connectDB } = require('./mongodb');
const { handleStart } = require('./handlers/start');
const { handleProfile } = require('./handlers/profile');
const { settingsConversation } = require('./handlers/settings');

const bot = new Bot(process.env.BOT_API_KEY);

// Устанавливаем conversations
bot.use(conversations());
bot.use(createConversation(settingsConversation));

// Команды
bot.command('start', handleStart);
bot.command('profile', handleProfile);

// Обработка callback'ов
bot.on('callback_query:data', async (ctx) => {
  try {
    if (ctx.callbackQuery.data === 'setup_profile') {
      await ctx.answerCallbackQuery();
      await ctx.conversation.enter('settings');
    }
  } catch (error) {
    console.error('Ошибка обработки callback:', error);
    await ctx.reply('Упс... Что-то пошло не так 😥');
  }
});

// Обработка неизвестных сообщений
bot.on('msg', async (ctx) => {
  await ctx.reply('Сорян, я пока не знаю, как на это ответить... 🙄');
});

async function run() {
  await connectDB();
  bot.start();
  console.log('Бот запущен');
}

run().catch(console.error);