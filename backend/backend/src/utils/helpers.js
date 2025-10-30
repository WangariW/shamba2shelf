const crypto = require('crypto');

const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const generateVerificationCode = (length = 6) => {
  return Math.floor(Math.random() * (10 ** length))
    .toString()
    .padStart(length, '0');
};

const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const calculatePasswordStrength = (password) => {
  let score = 0;
  
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  
  if (/(.)\1{2,}/.test(password)) score -= 1;
  if (/123|abc|password|qwerty/i.test(password)) score -= 2;
  
  return Math.max(0, Math.min(5, score));
};

const generateSecureFilename = (originalName) => {
  const timestamp = Date.now();
  const randomString = generateToken(8);
  const extension = originalName.split('.').pop();
  
  return `${timestamp}_${randomString}.${extension}`;
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
};

const generateFriendlyId = (prefix = 'USR') => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${prefix}_${timestamp}_${random}`.toUpperCase();
};

const maskEmail = (email) => {
  const [username, domain] = email.split('@');
  const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
  return `${maskedUsername}@${domain}`;
};

const maskPhone = (phone) => {
  return phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');
};

const formatResponse = (success, data = null, message = null, pagination = null) => {
  const response = {
    success,
    timestamp: new Date().toISOString()
  };
  
  if (message) response.message = message;
  if (data !== null) response.data = data;
  if (pagination) response.pagination = pagination;
  
  return response;
};

const createPagination = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null
  };
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  generateToken,
  hashToken,
  generateVerificationCode,
  validatePassword,
  calculatePasswordStrength,
  generateSecureFilename,
  sanitizeInput,
  generateFriendlyId,
  maskEmail,
  maskPhone,
  formatResponse,
  createPagination,
  sleep
};
