const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function generateAdmin() {
  const password = 'Admin@123'; // Default password - change after first login!
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  try {
    await pool.query(`
      INSERT INTO teachers (username, email, password_hash, full_name, role) 
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (username) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role
    `, ['admin', 'admin@school.edu', passwordHash, 'System Administrator', 'admin']);

    console.log('✅ Admin user created/updated successfully!');
    console.log('📋 Login credentials:');
    console.log('   Username: admin');
    console.log('   Password: Admin@123');
    console.log('\n⚠️  IMPORTANT: Change password after first login!');
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await pool.end();
  }
}

generateAdmin();