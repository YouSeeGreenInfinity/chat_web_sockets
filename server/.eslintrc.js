// module.exports = {
//   env: {
//     node: true,
//     es2021: true,
//   },
//   extends: ['airbnb-base'],
//   parserOptions: {
//     ecmaVersion: 'latest',
//     sourceType: 'module',
//   },
//   rules: {
//     'no-console': 'off',
//     'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
//     'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
//     'no-underscore-dangle': ['error', { allow: ['_id'] }],
//   },
// };

module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: ['airbnb-base'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // Отключаем правила, которые могут мешать
    'no-console': 'off',
    'import/no-extraneous-dependencies': ['error', {
      devDependencies: true, // Разрешаем devDependencies в коде
    }],
    'no-underscore-dangle': ['error', {
      allow: ['_id', '_'], // Разрешаем _id для MongoDB и _ для неиспользуемых параметров
    }],
    // Дополнительные настройки
    'max-len': ['error', {
      code: 100,
      ignoreComments: true,
      ignoreUrls: true,
    }],
    'object-curly-newline': ['error', {
      multiline: true,
      consistent: true,
    }],
  },
  // Игнорируем определённые папки и файлы
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    '*.config.js',
    '*.test.js',
  ],
};
