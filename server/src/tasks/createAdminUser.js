const bcrypt = require('bcryptjs');
const db = require('../db/connection');
require('dotenv').config();

const users = db.get('users');

async function createAdminUser() {
  try {
    const user = await users.findOne({ role: 'admin' });
    if (!user) {
      await users.insert({
        username: 'admin',
        password: await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD, 12),
        active: true,
        role: 'admin',
      });
      console.log('Admin user created!');
    } else {
      console.log('Admin user already created.');
    }
  } catch (error) {
    console.error(error);
  } finally {
    db.close();
  }
}

createAdminUser();
