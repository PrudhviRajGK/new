const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login...');
    const response = await axios.post('http://localhost:4000/api/auth/login', {
      email: 'admin@kraya.ai',
      password: 'Admin@123',
      tenantId: 'demo-tenant'
    });
    
    console.log('[SUCCESS] Login successful!');
    console.log('User:', response.data.user);
    console.log('Token:', response.data.accessToken.substring(0, 50) + '...');
  } catch (error) {
    console.error('[ERROR] Login failed:', error.response?.data || error.message);
  }
}

testLogin();
