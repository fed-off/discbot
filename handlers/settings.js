const { createConversation } = require('@grammyjs/conversations');
const { InlineKeyboard } = require('grammy');
const { updateUser, getUser } = require('../mongodb');

async function settingsConversation(conversation, ctx) {
  try {
    // Показываем меню настроек
    const settingsMenu = new InlineKeyboard()
      .text('Часовой пояс', 'set_timezone')
      .text('Время засыпания', 'set_bedtime').row()
      .text('Время пробуждения', 'set_wakeup').row()
      .text('Уведомления', 'set_notifications')
      .text('Отменить', 'cancel');

    const menuMessage = await ctx.reply('Что хочешь настроить?', {
      reply_markup: settingsMenu
    });

    // Ожидаем выбор из меню
    const { callbackQuery } = await conversation.waitFor('callback_query:data');
    const choice = callbackQuery.data;

    // Удаляем меню
    await conversation.external(() => ctx.api.deleteMessage(ctx.chat.id, menuMessage.message_id));

    if (choice === 'cancel') {
      await ctx.reply('Настройка отменена.');
      return;
    }

    if (choice === 'set_timezone') {
      // Показываем варианты часового пояса
      const timezoneMenu = new InlineKeyboard()
        .text('+3 МСК', 'tz_+3_MSK')
        .text('+0 Лондон', 'tz_+0_London')
        .text('+5 ЕКБ', 'tz_+5_EKB')
        .text('Отменить', 'cancel');

      const timezoneMessage = await ctx.reply('Выбери часовой пояс:', {
        reply_markup: timezoneMenu
      });

      // Ожидаем выбор пояса
      const { callbackQuery: tzQuery } = await conversation.waitFor('callback_query:data');
      const tzChoice = tzQuery.data;

      // Удаляем сообщение с выбором пояса
      await conversation.external(() => ctx.api.deleteMessage(ctx.chat.id, timezoneMessage.message_id));

      if (tzChoice === 'cancel') {
        await ctx.reply('Настройка отменена.');
        return;
      }

      // Обновляем часовой пояс
      const timezoneMap = {
        'tz_+3_MSK': '+3 МСК',
        'tz_+0_London': '+0 Лондон',
        'tz_+5_EKB': '+5 ЕКБ'
      };

      const selectedTimezone = timezoneMap[tzChoice];
      if (selectedTimezone) {
        await conversation.external(async () => {
          await updateUser({
            chatId: ctx.chat.id,
            username: ctx.from.username || 'Unknown',
            timezone: selectedTimezone
          });
        });
        await ctx.reply(`Часовой пояс установлен: ${selectedTimezone}`);
      } else {
        await ctx.reply('Неизвестный часовой пояс.');
      }
    } else {
      // Заглушка для других настроек
      await ctx.reply('Эта настройка пока не реализована.');
    }

    // Показываем обновленный профиль
    const user = await conversation.external(() => getUser(ctx.chat.id));
    if (user) {
      const profile = `📋 Твой профиль:\n` +
        `🕒 Часовой пояс: ${user.timezone || '-'}\n` +
        `😴 Время засыпания: ${user.bedtime || '-'}\n` +
        `☀️ Время пробуждения: ${user.wakeupTime || '-'}\n` +
        `🔔 Уведомления: ${user.notifications ? 'Включены' : 'Выключены'}`;

      const keyboard = new InlineKeyboard().text('Настроить', 'setup_profile');
      await ctx.reply(profile, { reply_markup: keyboard });
    } else {
      await ctx.reply('Ошибка: пользователь не найден. Попробуй /start.');
    }
  } catch (error) {
    console.error('Ошибка в диалоге настроек:', error);
    await ctx.reply('Упс... Что-то пошло не так 😥');
  }
}

module.exports = { settingsConversation: createConversation(settingsConversation, 'settings') };