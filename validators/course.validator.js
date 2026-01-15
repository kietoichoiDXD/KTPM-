const { body } = require('express-validator');

exports.createCourseValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Tên khóa học không được để trống')
    .isLength({ min: 3 })
    .withMessage('Tên khóa học phải có ít nhất 3 ký tự'),
  
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Mã khóa học không được để trống')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Mã khóa học chỉ chứa chữ in hoa và số'),
  
  body('credits')
    .isInt({ min: 1, max: 10 })
    .withMessage('Số tín chỉ phải từ 1 đến 10'),
  
  body('description')
    .optional()
    .trim(),
  
  body('teacher')
    .optional()
    .trim()
];

exports.updateCourseValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Tên khóa học phải có ít nhất 3 ký tự'),
  
  body('code')
    .optional()
    .trim()
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Mã khóa học chỉ chứa chữ in hoa và số'),
  
  body('credits')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Số tín chỉ phải từ 1 đến 10')
];
