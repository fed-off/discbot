require('dotenv').config();
const { Bot } = require('grammy');
const mongo = require('./mongodb');
const bot = new Bot(process.env.BOT_API_KEY);


bot.command('start', async (ctx) => {
  try {
    const userData = {
      chatId: ctx.chat.id,
      username: ctx.from.username,
    };
    const addedUser = await mongo.addUser(userData);

    await ctx.reply(addedUser ? 'Приятно познакомиться, ' + userData.username + '!\nУверен, мы продуктивно поработаем! 😊' : 'А мы уже знакомы.\nКак успехи? 😀');
  } catch (error) {
    console.error('Ошибка выполнения команды /start:', error);
    await ctx.reply('Упс... Что-то пошло не так 😥');
  }
});

bot.on('msg', async (ctx) => {
  await ctx.reply('Сорян, я пока хз как реагировать на это... 🙄');
});


async function run() {
  await mongo.connectDB();
  bot.start();
}
run();
