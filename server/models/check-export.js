console.log('Проверка экспорта моделей:\n');

// Проверяем User.js
console.log('1. User.js:');
try {
  const userExport = require('./User.js');
  console.log('   Тип экспорта:', typeof userExport);
  console.log('   Это функция?', typeof userExport === 'function');
  console.log('   Содержимое:', Object.keys(userExport || {}));
} catch (err) {
  console.log('   Ошибка:', err.message);
}

console.log('\n2. Message.js:');
try {
  const messageExport = require('./Message.js');
  console.log('   Тип экспорта:', typeof messageExport);
  console.log('   Это функция?', typeof messageExport === 'function');
  console.log('   Содержимое:', Object.keys(messageExport || {}));
} catch (err) {
  console.log('   Ошибка:', err.message);
}

console.log('\n3. Первые 5 строк каждого файла:');
console.log('\nUser.js:');
const fs = require('fs');
console.log(fs.readFileSync('./User.js', 'utf8').split('\n').slice(0, 10).join('\n'));

console.log('\nMessage.js:');
console.log(fs.readFileSync('./Message.js', 'utf8').split('\n').slice(0, 10).join('\n'));
