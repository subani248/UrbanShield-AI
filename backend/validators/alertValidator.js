const { body } = require('express-validator');

exports.createAlertValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters'),
  body('type')
    .notEmpty()
    .withMessage('Type is required')
    .isIn(['emergency', 'warning', 'advisory', 'informational'])
    .withMessage('Invalid alert type'),
  body('severity')
    .notEmpty()
    .withMessage('Severity is required')
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid severity'),
];
