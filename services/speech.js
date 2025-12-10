const axios = require('axios');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/config');
const { getSaluteSpeechToken } = require('../config/tokens');

async function recognizeSpeech(filePath) {
  try {
    console.log('🔑 Получение токена для распознавания речи...');
    const token = await getSaluteSpeechToken();

    console.log('🎤 Начинаю распознавание речи...');
    const audioData = fs.readFileSync(filePath);

    const response = await axios.post(
      'https://smartspeech.sber.ru/rest/v1/speech:recognize',
      audioData,
      {
        headers: {
          'Content-Type': 'audio/x-pcm;bit=16;rate=16000',
          'Authorization': `Bearer ${token}`,
          'X-Request-ID': uuidv4(),
          'X-Channel': 'API'
        },
        httpsAgent: config.httpsAgent,
        timeout: 30000
      }
    );

    if (response.data && response.data.result) {
      console.log('✅ Речь успешно распознана');
      return response.data.result;
    } else {
      throw new Error('Не удалось распознать речь - пустой ответ');
    }
  } catch (error) {
    console.error('❌ Ошибка распознавания речи:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      console.log('🔄 Токен истек, пытаемся получить новый...');
      global.saluteSpeechToken = null;
      global.tokenExpirationTime = 0;
      return recognizeSpeech(filePath);
    }

    throw new Error(`Ошибка распознавания: ${error.response?.data?.message || error.message}`);
  }
}

module.exports = {
  recognizeSpeech
};
