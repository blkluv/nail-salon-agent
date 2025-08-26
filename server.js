const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

console.log('🚀 MINIMAL SERVER STARTING');
console.log('PORT:', PORT);

app.use(express.json());

app.get('/', (req, res) => {
  console.log('📍 Root endpoint hit');
  res.json({ 
    message: 'Vapi Nail Salon - WORKING!',
    status: 'success',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  console.log('💚 Health check');
  res.json({ 
    status: 'healthy',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

app.post('/webhook/vapi', (req, res) => {
  console.log('📞 Vapi webhook received');
  res.json({ 
    status: 'received',
    message: 'Webhook working!'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('✅ SERVER RUNNING SUCCESSFULLY');
  console.log(`🌐 URL: http://0.0.0.0:${PORT}`);
  console.log('🎉 READY FOR RAILWAY!');
});