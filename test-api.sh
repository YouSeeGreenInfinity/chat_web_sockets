#!/bin/bash
echo "=== Тестирование API ЧАТ ==="
echo ""

# 1. Health check
echo "1. Health check:"
curl -s http://localhost:5000/api/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:5000/api/health
echo ""

# 2. Регистрация
echo "2. Регистрация нового пользователя:"
REGISTER_DATA='{"username":"chat_user","email":"chat@test.com","password":"chat123"}'
curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "$REGISTER_DATA" | python3 -m json.tool 2>/dev/null || \
curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "$REGISTER_DATA"
echo ""

# 3. Вход
echo "3. Вход пользователя:"
LOGIN_DATA='{"email":"chat@test.com","password":"chat123"}'
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "$LOGIN_DATA")
echo "$LOGIN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_RESPONSE"

# Извлекаем токен
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo ""
echo "Токен: ${TOKEN:0:30}..."
echo ""

# 4. Профиль
if [ ! -z "$TOKEN" ]; then
    echo "4. Получение профиля:"
    curl -s -X GET http://localhost:5000/api/auth/profile \
      -H "Authorization: Bearer $TOKEN" | python3 -m json.tool 2>/dev/null || \
    curl -s -X GET http://localhost:5000/api/auth/profile \
      -H "Authorization: Bearer $TOKEN"
fi
