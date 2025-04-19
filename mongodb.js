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

async function addUser(userData) {
  try {
    const result = await database
      .collection(collections.USERS)
      .updateOne(
        { chatId: userData.chatId },
        {
          $setOnInsert: {
            ...userData,
            timezone: null,
            bedtime: null,
            wakeupTime: null,
            notifications: true,
            sleepRecords: [],
            createdAt: new Date()
          }
        },
        { upsert: true }
      );

    console.log(result.upsertedCount > 0
      ? `Добавлен пользователь: ${userData.username}:${userData.chatId}`
      : `Пользователь ${userData.username}:${userData.chatId} уже существует`);

    return result.upsertedCount > 0;
  } catch (error) {
    console.error(`Ошибка добавления пользователя ${userData.username}:${userData.chatId}: `, error);
    return false;
  }
}

async function getUser(chatId) {
  try {
    return await database
      .collection(collections.USERS)
      .findOne({ chatId });
  } catch (error) {
    console.error(`Ошибка получения пользователя ${userData.username}:${userData.chatId}: `, error);
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
    console.error('Ошибка получения списка пользователей из MongoDB: ', error);
  }
}

module.exports = { connectDB, addUser, getUser, getAllUsers };