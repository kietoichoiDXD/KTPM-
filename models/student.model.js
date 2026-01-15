const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 1
  },
  avatar: {
    type: String,
    default: null
  },
  email: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Soft delete - không xóa hẳn khỏi DB
studentSchema.methods.softDelete = function() {
  this.isDeleted = true;
  return this.save();
};

// Query helper - chỉ lấy những record chưa bị xóa
studentSchema.query.notDeleted = function() {
  return this.where({ isDeleted: false });
};

module.exports = mongoose.model('Student', studentSchema);
