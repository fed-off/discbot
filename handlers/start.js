const { updateUser } = require('../mongodb');

async function handleStart(ctx) {
  try {
    const userData = {
      chatId: ctx.chat.id,
      username: ctx.from.username || 'Unknown'
    };
    await updateUser(userData, true);

    const message = `Привет, ${userData.username}! 😊\n` +
      `Сон — залог здоровья и успеха! Он улучшает настроение, память и энергию. ` +
      `Я помогу тебе выстроить качественный сон, а затем мы добавим крутые функции: ` +
      `отслеживание настроения, ачивки за зарядку, прогулки и хобби. ` +
      `Начнем? Настрой свой профиль с помощью /profile!`;

    await ctx.reply(message);
  } catch (error) {
    console.error('Ошибка команды /start:', error);
    await ctx.reply('Упс... Что-то пошло не так 😥');
  }
}

module.exports = { handleStart };