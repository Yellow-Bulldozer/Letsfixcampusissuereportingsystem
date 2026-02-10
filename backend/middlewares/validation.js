const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation result checker middleware
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  
  next();
};

/**
 * Auth validation rules
 */
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail()
    .custom((value) => {
      const domain = process.env.COLLEGE_EMAIL_DOMAIN || '@college.edu';
      if (!value.endsWith(domain)) {
        throw new Error(`Email must be from college domain ${domain}`);
      }
      return true;
    }),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  body('department')
    .trim()
    .notEmpty().withMessage('Department is required'),
  
  validate
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  validate
];

/**
 * Issue validation rules
 */
const createIssueValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['bench', 'water', 'electrical', 'washroom', 'classroom', 'infrastructure', 'internet', 'security', 'cleanliness', 'other'])
    .withMessage('Invalid category'),
  
  body('location.block')
    .trim()
    .notEmpty().withMessage('Block is required'),
  
  body('location.floor')
    .trim()
    .notEmpty().withMessage('Floor is required'),
  
  validate
];

const updateStatusValidation = [
  param('id')
    .isMongoId().withMessage('Invalid issue ID'),
  
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['Pending', 'Ongoing', 'Completed']).withMessage('Invalid status'),
  
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters'),
  
  validate
];

const verifyIssueValidation = [
  param('id')
    .isMongoId().withMessage('Invalid issue ID'),
  
  body('verified')
    .notEmpty().withMessage('Verified status is required')
    .isBoolean().withMessage('Verified must be a boolean'),
  
  validate
];

/**
 * Poll validation rules
 */
const voteValidation = [
  body('issueId')
    .notEmpty().withMessage('Issue ID is required')
    .isMongoId().withMessage('Invalid issue ID'),
  
  validate
];

const issueIdValidation = [
  param('id')
    .isMongoId().withMessage('Invalid issue ID'),
  
  validate
];

const pollIdValidation = [
  param('id')
    .isMongoId().withMessage('Invalid poll ID'),
  
  validate
];

module.exports = {
  registerValidation,
  loginValidation,
  createIssueValidation,
  updateStatusValidation,
  verifyIssueValidation,
  voteValidation,
  issueIdValidation,
  pollIdValidation
};
