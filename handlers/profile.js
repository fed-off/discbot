const { getUser } = require('../mongodb');

async function handleProfile(ctx) {
  try {
    const user = await getUser(ctx.chat.id);
    if (!user) {
      await ctx.reply('Похоже, ты не зарегистрирован. Попробуй /start!');
      return;
    }

    const profile = `📋 Твой профиль:\n` +
      `🕒 Часовой пояс: ${user.timezone || '-'}\n` +
      `😴 Время засыпания: ${user.bedtime || '-'}\n` +
      `☀️ Время пробуждения: ${user.wakeupTime || '-'}\n` +
      `🔔 Уведомления: ${user.notifications ? 'Включены' : 'Выключены'}`;

    await ctx.reply(profile);
  } catch (error) {
    console.error('Ошибка команды /profile:', error);
    await ctx.reply('Упс... Что-то пошло не так 😥');
  }
}

module.exports = { handleProfile };