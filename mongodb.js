const { MongoClient, ServerApiVersion } = require('mongodb');

const DB_NAME = 'discbot';
const collections = {
  USERS: "users",
};

let database;

async function connectDB() {
  try {
    const client = new MongoClient(process.env.MONGO_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    await client.connect();
    database = client.db(DB_NAME);
    console.log('MongoDB подключена');
  } catch (error) {
    console.error('Ошибка подключения к MongoDB: ', error);
  }
}

async function addUser(userData) {
  try {
    const result = await database
      .collection(collections.USERS)
      .updateOne(
        { chatId: userData.chatId },    // Критерий поиска
        { $setOnInsert: userData },     // Данные для вставки
        { upsert: true }                // Опция upsert
      );

    if (result.upsertedCount > 0) {
      console.log(`Добавлен новый пользователь: ${userData.username}:${userData.chatId}`);
    } else {
      console.log(`Пользователь ${userData.username}:${userData.chatId} уже существует`);
    }

    return result.upsertedCount > 0;
  } catch (error) {
    console.error('Ошибка добавления пользователя:', error);
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

module.exports = {
  connectDB,
  addUser,
  getAllUsers,
};