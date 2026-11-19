const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

let mongodInstance = null;

async function connectDB() {
  const customUri = process.env.MONGO_URI;

  if (customUri && customUri.trim() !== '') {
    try {
      console.log('🔄 Đang kết nối tới MongoDB Atlas / URI cấu hình...');
      await mongoose.connect(customUri, { serverSelectionTimeoutMS: 4000 });
      console.log('✅ MongoDB connected successfully to external URI');
      return;
    } catch (err) {
      console.warn('⚠️ Kết nối tới MONGO_URI cấu hình thất bại:', err.message);
      console.log('🔄 Chuyển sang chế độ MongoDB In-Memory tích hợp để đảm bảo hệ thống chạy mượt mà...');
    }
  }

  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const dbPath = path.join(__dirname, '../.tmp_mongo_db');
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
    }

    mongodInstance = await MongoMemoryServer.create({
      instance: {
        dbPath
      }
    });
    const memoryUri = mongodInstance.getUri();
    await mongoose.connect(memoryUri);
    console.log('✅ MongoDB In-Memory connected successfully:', memoryUri);
  } catch (err) {
    console.error('❌ Lỗi khởi động MongoDB In-Memory:', err);
    throw err;
  }
}

process.on('SIGINT', async () => {
  if (mongodInstance) {
    await mongodInstance.stop();
  }
  process.exit(0);
});

module.exports = connectDB;
