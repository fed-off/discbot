const { MongoClient, ServerApiVersion } = require('mongodb');

const DB_NAME = 'discbot';
const collections = { USERS: 'users' };
let database;

async function connectDB() {
  try {
    const client = new MongoClient(process.env.MONGO_URI, {
      serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
    });
    await client.connect();
    database = client.db(DB_NAME);
    console.log('MongoDB подключена');
  } catch (error) {
    console.error('Ошибка подключения к MongoDB:', error);
  }
}

async function updateUser(userData, isNew = false) {
  try {
    const defaultUser = {
      timezone: null,
      bedtime: null,
      wakeupTime: null,
      notifications: true,
      sleepRecords: []
    };

    // Если isNew: true, добавляем createdAt и мержим с дефолтными значениями
    const updateData = isNew
      ? { ...defaultUser, ...userData, createdAt: new Date() }
      : userData;

    const result = await database
      .collection(collections.USERS)
      .updateOne(
        { chatId: userData.chatId },
        { $set: updateData },
        { upsert: true }
      );

    console.log(result.upsertedCount > 0
      ? `Добавлен пользователь: ${userData.username}:${userData.chatId}`
      : `Обновлен пользователь: ${userData.username}:${userData.chatId}`);

    return result.upsertedCount > 0;
  } catch (error) {
    console.error(`Ошибка обновления пользователя ${userData.username}:${userData.chatId}:`, error);
    return false;
  }
}

async function getUser(chatId) {
  try {
    return await database
      .collection(collections.USERS)
      .findOne({ chatId });
  } catch (error) {
    console.error(`Ошибка получения пользователя ${chatId}:`, error);
    return null;
  }
}

async function getAllUsers() {
  try {
    const records = await database
      .collection(collections.USERS)
      .find()
      .toArray();
    return records;
  } catch (error) {
    console.error('Ошибка получения списка пользователей из MongoDB:', error);
    return [];
  }
}

module.exports = { connectDB, updateUser, getUser, getAllUsers };