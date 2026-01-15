const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  midtermScore: {
    type: Number,
    min: 0,
    max: 10,
    default: null
  },
  finalScore: {
    type: Number,
    min: 0,
    max: 10,
    default: null
  },
  averageScore: {
    type: Number,
    min: 0,
    max: 10,
    default: null
  },
  letterGrade: {
    type: String,
    enum: ['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F', null],
    default: null
  },
  status: {
    type: String,
    enum: ['PASS', 'FAIL', 'PENDING'],
    default: 'PENDING'
  },
  semester: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Tính điểm trung bình và xếp loại
gradeSchema.methods.calculateGrade = function() {
  if (this.midtermScore !== null && this.finalScore !== null) {
    // Điểm TB = 40% giữa kỳ + 60% cuối kỳ
    this.averageScore = (this.midtermScore * 0.4 + this.finalScore * 0.6).toFixed(2);
    
    // Xếp loại
    if (this.averageScore >= 8.5) this.letterGrade = 'A';
    else if (this.averageScore >= 8.0) this.letterGrade = 'B+';
    else if (this.averageScore >= 7.0) this.letterGrade = 'B';
    else if (this.averageScore >= 6.5) this.letterGrade = 'C+';
    else if (this.averageScore >= 5.5) this.letterGrade = 'C';
    else if (this.averageScore >= 5.0) this.letterGrade = 'D+';
    else if (this.averageScore >= 4.0) this.letterGrade = 'D';
    else this.letterGrade = 'F';
    
    // Trạng thái
    this.status = this.averageScore >= 4.0 ? 'PASS' : 'FAIL';
  }
};

// Index để tránh trùng lặp
gradeSchema.index({ student: 1, course: 1, semester: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Grade', gradeSchema);
