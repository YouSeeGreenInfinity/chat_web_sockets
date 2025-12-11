const http = require('http');

const test = async () => {
  console.log('🧪 Быстрый тест API...\n');
  
  // Health check
  console.log('1. Health check:');
  const health = await request('GET', '/api/health');
  console.log('   Status:', health?.status || 'ERROR');
  
  // Register
  console.log('\n2. Регистрация:');
  const random = Date.now();
  const register = await request('POST', '/api/auth/register', {
    username: `user${random}`,
    email: `test${random}@test.com`,
    password: 'test123'
  });
  
  if (register?.token) {
    console.log('   ✅ Успешно! Токен получен');
    
    // Profile
    console.log('\n3. Профиль:');
    const profile = await request('GET', '/api/auth/profile', null, register.token);
    console.log('   User:', profile?.user?.username || 'ERROR');
  } else {
    console.log('   ❌ Ошибка:', register?.error || 'Unknown error');
  }
};

function request(method, path, data, token) {
  return new Promise(resolve => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (token) options.headers.Authorization = `Bearer ${token}`;
    
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } 
        catch { resolve({ error: 'Invalid JSON' }); }
      });
    });
    
    req.on('error', () => resolve({ error: 'Request failed' }));
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

test();
