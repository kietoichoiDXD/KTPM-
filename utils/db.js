const mongoose = require('mongoose');

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
    const mongod = await MongoMemoryServer.create();
    const memoryUri = mongod.getUri();
    await mongoose.connect(memoryUri);
    console.log('✅ MongoDB In-Memory connected successfully:', memoryUri);
  } catch (err) {
    console.error('❌ Lỗi khởi động MongoDB In-Memory:', err);
  }
}

module.exports = connectDB;
