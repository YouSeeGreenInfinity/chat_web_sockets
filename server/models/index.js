// 'use strict';

// const fs = require('fs');
// const path = require('path');
// const Sequelize = require('sequelize');
// const process = require('process');
// const basename = path.basename(__filename);
// const env = process.env.NODE_ENV || 'development';

// // ★★★ ИСПРАВЛЕНО ★★★ - убрали одну точку
// const config = require(__dirname + '/database.js')[env]; // ← ИСПРАВЬТЕ ЭТУ СТРОКУ!

// const db = {};

// let sequelize;
// if (config.use_env_variable) {
//   sequelize = new Sequelize(process.env[config.use_env_variable], config);
// } else {
//   sequelize = new Sequelize(config.database, config.username, config.password, config);
// }

// fs
//   .readdirSync(__dirname)
//   .filter(file => {
//     return (
//       file.indexOf('.') !== 0 &&
//       file !== basename &&
//       file.slice(-3) === '.js' &&
//       file.indexOf('.test.js') === -1
//     );
//   })
//   .forEach(file => {
//     const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
//     db[model.name] = model;
//   });

// Object.keys(db).forEach(modelName => {
//   if (db[modelName].associate) {
//     db[modelName].associate(db);
//   }
// });

// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

// module.exports = db;

// 'use strict';

// const fs = require('fs');
// const path = require('path');
// const Sequelize = require('sequelize');
// const process = require('process');
// const basename = path.basename(__filename);
// const env = process.env.NODE_ENV || 'development';

// // Загружаем конфиг БД
// const config = require(__dirname + '/database.js')[env];
// const db = {};

// let sequelize;
// if (config.use_env_variable) {
//   sequelize = new Sequelize(process.env[config.use_env_variable], config);
// } else {
//   sequelize = new Sequelize(config.database, config.username, config.password, config);
// }

// // Отладочная информация
// console.log('🔧 Конфиг БД:', {
//   database: config.database,
//   host: config.host,
//   username: config.username
// });

// // Загрузка моделей
// fs.readdirSync(__dirname)
//   .filter(file => {
//     return (
//       file.indexOf('.') !== 0 &&
//       file !== basename &&
//       file.slice(-3) === '.js' &&
//       file.indexOf('.test.js') === -1
//     );
//   })
//   .forEach(file => {
//     console.log(`📂 Загружаем: ${file}`);
    
//     try {
//       // 1. Загружаем модуль
//       const modelModule = require(path.join(__dirname, file));
      
//       // 2. Проверяем что это функция
//       if (typeof modelModule !== 'function') {
//         throw new Error(`Модуль ${file} не экспортирует функцию`);
//       }
      
//       // 3. Вызываем функцию с параметрами
//       const model = modelModule(sequelize, Sequelize.DataTypes);
      
//       // 4. Сохраняем модель
//       db[model.name] = model;
//       console.log(`   ✅ Модель "${model.name}" успешно загружена`);
      
//     } catch (error) {
//       console.error(`   ❌ Ошибка загрузки ${file}:`, error.message);
//       console.error('   Детали:', error);
//     }
//   });

// // Устанавливаем ассоциации
// Object.keys(db).forEach(modelName => {
//   if (db[modelName].associate) {
//     db[modelName].associate(db);
//   }
// });

// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

// console.log('\n🎯 Итоговые модели:', Object.keys(db));
// console.log('✅ База данных инициализирована\n');

// module.exports = db;


'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

const config = require(__dirname + '/database.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

console.log('🔧 Конфиг БД:', {
  database: config.database,
  host: config.host,
  username: config.username
});

// Загрузка только моделей (исключаем служебные файлы)
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1 &&
      !file.includes('database') &&    // исключаем database.js
      !file.includes('check-export')   // исключаем тестовые файлы
    );
  })
  .forEach(file => {
    console.log(`📂 Загружаем модель: ${file}`);
    
    try {
      const modelFunc = require(path.join(__dirname, file));
      
      if (typeof modelFunc !== 'function') {
        console.log(`   ⚠️  Пропускаем (не функция)`);
        return;
      }
      
      const model = modelFunc(sequelize, Sequelize.DataTypes);
      db[model.name] = model;
      console.log(`   ✅ Модель "${model.name}" загружена`);
      
    } catch (error) {
      console.error(`   ❌ Ошибка: ${error.message}`);
    }
  });

console.log('\n🎯 Загруженные модели:', Object.keys(db).filter(k => !['sequelize', 'Sequelize'].includes(k)));

// Ассоциации
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

console.log('✅ База данных инициализирована\n');
module.exports = db;