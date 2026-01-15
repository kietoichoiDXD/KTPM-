const { body } = require('express-validator');

exports.registerValidator = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username phải có ít nhất 3 ký tự'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password phải có ít nhất 6 ký tự')
];

exports.loginValidator = [
  body('username').notEmpty().withMessage('Username không được để trống'),
  body('password').notEmpty().withMessage('Password không được để trống')
];
