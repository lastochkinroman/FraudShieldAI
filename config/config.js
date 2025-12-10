require('dotenv').config();
const { Agent } = require('node:https');

const requiredEnvVars = ['TELEGRAM_BOT_TOKEN', 'GIGACHAT_TOKEN'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) throw new Error(`Требуется ${varName} в .env`);
});

console.log('🔐 Проверка токенов...');
console.log('TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? '✓' : '✗');
console.log('GIGACHAT_TOKEN:', process.env.GIGACHAT_TOKEN ? '✓' : '✗');
console.log('SALUTE_SPEECH_TOKEN:', process.env.SALUTE_SPEECH_TOKEN ? '✓' : '✗');
console.log('SBER_AUTH_KEY:', process.env.SBER_AUTH_KEY ? '✓' : '✗');

const config = {
  botToken: process.env.TELEGRAM_BOT_TOKEN,
  gigachatToken: process.env.GIGACHAT_TOKEN,
  saluteSpeechToken: process.env.SALUTE_SPEECH_TOKEN,
  sberAuthKey: process.env.SBER_AUTH_KEY,
  httpsAgent: new Agent({ rejectUnauthorized: false }),
};

module.exports = config;
