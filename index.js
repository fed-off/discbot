require('dotenv').config();
const { Bot } = require('grammy');
const { connectDB } = require('./mongodb');
const { handleStart } = require('./handlers/start');
const { handleProfile } = require('./handlers/profile');

const bot = new Bot(process.env.BOT_API_KEY);

bot.command('start', handleStart);
bot.command('profile', handleProfile);

bot.on('msg', async (ctx) => {
  await ctx.reply('Сорян, я пока не знаю, как на это ответить... 🙄');
});

async function run() {
  await connectDB();
  bot.start();
  console.log('Бот запущен');
}

run().catch(console.error);
