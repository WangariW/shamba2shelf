const User = require('../models/User');
const Farmer = require('../models/Farmer');
const Buyer = require('../models/Buyer');

/* Find user across all models by email */
const findUserByEmail = async (email) => {
  const normalizedEmail = email.toLowerCase();

  let user = await User.findOne({ email: normalizedEmail, isActive: true })
    .select('+password +passwordResetToken');
  if (user) return { user, model: 'User', role: user.role };

  user = await Farmer.findOne({ email: normalizedEmail, isActive: true })
    .select('+password +passwordResetToken');
  if (user) return { user, model: 'Farmer', role: 'farmer' };

  user = await Buyer.findOne({ email: normalizedEmail, isActive: true })
    .select('+password +passwordResetToken');
  if (user) return { user, model: 'Buyer', role: 'buyer' };

  return null;
};

/* Find user by ID across all models */
const findUserById = async (id) => {
  let user = await User.findById(id).select('+password +passwordResetToken');
  if (user) return { user, model: 'User', role: user.role };

  user = await Farmer.findById(id).select('+password +passwordResetToken');
  if (user) return { user, model: 'Farmer', role: 'farmer' };

  user = await Buyer.findById(id).select('+password +passwordResetToken');
  if (user) return { user, model: 'Buyer', role: 'buyer' };

  return null;
};

/* Find user by reset token across all models */
const findUserByResetToken = async (hashedToken) => {
  let user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpire: { $gt: Date.now() } });
  if (user) return { user, model: 'User', role: user.role };

  user = await Farmer.findOne({ passwordResetToken: hashedToken, passwordResetExpire: { $gt: Date.now() } });
  if (user) return { user, model: 'Farmer', role: 'farmer' };

  user = await Buyer.findOne({ passwordResetToken: hashedToken, passwordResetExpire: { $gt: Date.now() } });
  if (user) return { user, model: 'Buyer', role: 'buyer' };

  return null;
};

const getModelByRole = (role) => {
  switch (role) {
    case 'farmer':
      return Farmer;
    case 'buyer':
      return Buyer;
    default:
      return User;
  }
};

module.exports = {
  findUserByEmail,
  findUserById,
  findUserByResetToken,
  getModelByRole
};
