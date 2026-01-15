const { body } = require('express-validator');

exports.createStudentValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Tên không được để trống')
    .isLength({ min: 2 })
    .withMessage('Tên phải có ít nhất 2 ký tự'),
  
  body('age')
    .isInt({ min: 1, max: 100 })
    .withMessage('Tuổi phải từ 1 đến 100'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email không hợp lệ'),
  
  body('phone')
    .optional()
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Số điện thoại phải có 10-11 chữ số')
];

exports.updateStudentValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Tên phải có ít nhất 2 ký tự'),
  
  body('age')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Tuổi phải từ 1 đến 100'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email không hợp lệ'),
  
  body('phone')
    .optional()
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Số điện thoại phải có 10-11 chữ số')
];
