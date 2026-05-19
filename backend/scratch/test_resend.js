const axios = require('axios');

async function testResend() {
  try {
    const res = await axios.post('https://pos-y6ib.onrender.com/api/auth/resend-registration-otp', {
      email: 'test@example.com', // Let's replace with actual customer email if we knew it
      tenantSlug: 'kainlowkal'
    });
    console.log('RESEND SUCCESS:', res.data);
  } catch (error) {
    console.log('RESEND FAILED Status:', error.response?.status);
    console.log('RESEND FAILED Data:', error.response?.data);
  }
}

testResend();
