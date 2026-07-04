const User = require('../models/User');

const seedUsers = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@urbanshield.ai' });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@urbanshield.ai',
        password: 'Admin@123',
        role: 'admin',
        isApproved: true,
      });
      console.log('Admin user created');
    }


  } catch (error) {
    console.error('Seed error:', error.message);
  }
};

module.exports = seedUsers;
