# FraudShieldAI
Прототип системы на базе GigaChat и Salute Speech, которая в реальном времени анализирует телефонные разговоры, выявляет признаки социальной инженерии и помогает операторам предотвращать финансовые потери. Open-source решение для банков. Прототип был создан для студентческой IT конференции Сбера.

## Возможности

Распознавание речи происходит через SaluteSpeech (разработка Сбера). Далее агент на основе GigaChat выявляет маркеры мошшеничества и даёт рекомендации оператору. Доступы получать на платформе developerssber

## Быстрый старт

### 1. Клонирование и установка

git clone https://github.com/lastochkinroman/fraudshieldai.git
cd fraudshieldai
pip install -r requirements.txt

### 2. Настройка окружения

Создайте .env файл:

TELEGRAM_BOT_TOKEN=your_telegram_token
 
GIGACHAT_TOKEN=your_gigachat_token
 
SBER_AUTH_KEY=your_sber_auth_key  # или SALUTE_SPEECH_TOKEN 

### 3. Запуск

python bot.py

### 4. Тестирование

Отправьте голосовое сообщение в Telegram-бота с фразой:
"Мне нужно срочно перевести деньги на защитный счет!"

