const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const config = require('./config');

let saluteSpeechToken = config.saluteSpeechToken;
let tokenExpirationTime = config.saluteSpeechToken ? Date.now() + (24 * 60 * 60 * 1000) : 0;

let gigachatToken = config.gigachatToken;
let gigachatTokenExpiration = 0;

async function getSaluteSpeechToken() {
  if (saluteSpeechToken && Date.now() < tokenExpirationTime - 300000) {
    console.log('♻️ Используется существующий токен SaluteSpeech');
    return saluteSpeechToken;
  }

  if (config.saluteSpeechToken) {
    console.log('🔑 Используется SALUTE_SPEECH_TOKEN из .env');
    saluteSpeechToken = config.saluteSpeechToken;
    tokenExpirationTime = Date.now() + (24 * 60 * 60 * 1000);
    return saluteSpeechToken;
  }

  if (!config.sberAuthKey) {
    throw new Error(
      'Для работы распознавания речи необходим либо SALUTE_SPEECH_TOKEN, либо SBER_AUTH_KEY в .env файле.\n\n' +
      'SALUTE_SPEECH_TOKEN - прямой токен (может истечь)\n' +
      'SBER_AUTH_KEY - ключ для автоматического получения токена (рекомендуется)'
    );
  }

  console.log('🔄 Получение нового токена SaluteSpeech...');

  try {
    const response = await axios({
      method: 'post',
      url: 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'RqUID': uuidv4(),
        'Authorization': `Basic ${config.sberAuthKey}`
      },
      data: 'scope=SALUTE_SPEECH_PERS',
      httpsAgent: config.httpsAgent,
      timeout: 15000
    });

    if (!response.data.access_token) {
      throw new Error('Пустой ответ от сервера авторизации');
    }

    saluteSpeechToken = response.data.access_token;
    tokenExpirationTime = Date.now() + (response.data.expires_in * 1000);

    console.log('✅ Новый токен SaluteSpeech успешно получен');
    console.log(`⏰ Токен действителен до: ${new Date(tokenExpirationTime).toLocaleString('ru-RU')}`);

    return saluteSpeechToken;

  } catch (error) {
    console.error('❌ Ошибка получения токена SaluteSpeech:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });

    throw new Error(`Не удалось получить токен: ${error.response?.data?.error_description || error.message}`);
  }
}

async function refreshGigaChatToken() {
  if (gigachatToken && Date.now() < gigachatTokenExpiration - 300000) {
    return;
  }

  console.log('🔄 Обновление токена GigaChat...');

  try {
    const response = await axios.post(
      'https://ngw.devices.sberbank.ru:9443/api/v2/oauth',
      'scope=GIGACHAT_API_PERS',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'RqUID': uuidv4(),
          'Authorization': `Bearer ${config.gigachatToken}`
        },
        httpsAgent: config.httpsAgent,
        timeout: 15000
      }
    );

    if (response.data.access_token) {
      gigachatToken = response.data.access_token;
      gigachatTokenExpiration = Date.now() + (response.data.expires_in * 1000);
      console.log('✅ Токен GigaChat обновлен');
    } else {
      throw new Error('Не удалось получить токен GigaChat');
    }
  } catch (error) {
    console.error('❌ Ошибка обновления токена GigaChat:', error.response?.data || error.message);
    throw error;
  }
}

async function getGigaChatToken() {
  await refreshGigaChatToken();
  return gigachatToken;
}

module.exports = {
  getSaluteSpeechToken,
  getGigaChatToken,
  refreshGigaChatToken
};
