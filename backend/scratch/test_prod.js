const axios = require('axios');

async function test() {
  try {
    const response = await axios.post('https://pos-y6ib.onrender.com/api/auth/register-customer', {
      email: `test_${Date.now()}@example.com`,
      password: 'Password123!',
      name: 'Test Customer',
      tenantSlug: 'kainlowkal'
    });
    console.log('SUCCESS:', response.data);
  } catch (error) {
    console.log('FAILED Status:', error.response?.status);
    console.log('FAILED Data:', error.response?.data);
  }
}

test();
