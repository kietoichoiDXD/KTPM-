const { body } = require('express-validator');

exports.createUserValidator = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username không được để trống')
    .isLength({ min: 3 })
    .withMessage('Username phải có ít nhất 3 ký tự'),

  body('password')
    .notEmpty()
    .withMessage('Password không được để trống')
    .isLength({ min: 6 })
    .withMessage('Password phải có ít nhất 6 ký tự'),

  body('role')
    .optional()
    .toUpperCase()
    .isIn(['USER', 'ADMIN'])
    .withMessage('Role chỉ có thể là USER hoặc ADMIN'),

  body('status')
    .optional()
    .toUpperCase()
    .isIn(['ACTIVE', 'INACTIVE', 'LOCKED'])
    .withMessage('Status chỉ có thể là ACTIVE, INACTIVE hoặc LOCKED')
];

exports.updateUserValidator = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username phải có ít nhất 3 ký tự'),

  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password phải có ít nhất 6 ký tự'),

  body('role')
    .optional()
    .toUpperCase()
    .isIn(['USER', 'ADMIN'])
    .withMessage('Role chỉ có thể là USER hoặc ADMIN'),

  body('status')
    .optional()
    .toUpperCase()
    .isIn(['ACTIVE', 'INACTIVE', 'LOCKED'])
    .withMessage('Status chỉ có thể là ACTIVE, INACTIVE hoặc LOCKED')
];
