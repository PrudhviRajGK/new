require('dotenv').config();
const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    host: '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'kraya',
    user: process.env.DB_USER || 'postgres',
    password: 'postgres',
  });

  try {
    console.log('Attempting to connect to PostgreSQL...');
    console.log('Config:', {
      host: client.host,
      port: client.port,
      database: client.database,
      user: client.user,
    });
    
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const result = await client.query('SELECT version()');
    console.log('PostgreSQL version:', result.rows[0].version);
    
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testConnection();
