const axios = require('axios');
const config = require('../config/config');
const { getGigaChatToken } = require('../config/tokens');

const SYSTEM_PROMPT = `Ты - AI-ассистент оператора колл-центра банка. Твоя задача - анализировать расшифровки телефонных разговоров и выявлять признаки мошенничества.

КРИТИЧЕСКИЕ ПРИЗНАКИ МОШЕННИЧЕСТВА:
1. ДАВЛЕНИЕ ПО ВРЕМЕНИ - клиент торопится, упоминает срочность, дедлайны
2. УПОМИНАНИЕ "СЛУЖБЫ БЕЗОПАСНОСТИ" - клиент говорит, что ему звонили из банка
3. ПРОСЬБА НЕ БЛОКИРОВАТЬ - клиент просит не выполнять стандартные проверки
4. ПЕРЕВОД НА "ЗАЩИТНЫЙ СЧЕТ" - упоминание нестандартных счетов
5. ПОДРОБНЫЕ ИНСТРУКЦИИ - клиент говорит по чьей-то указке
6. ЭМОЦИОНАЛЬНОЕ СОСТОЯНИЕ - паника, страх, агрессия
7. НЕЛОГИЧНЫЕ ОБЪЯСНЕНИЯ - странные причины для перевода
8. УГРОЗЫ УЙТИ В ДРУГОЙ БАНК - если оператор задает вопросы

Проанализируй текст и ответь в формате JSON:
{
  "isFraudDetected": boolean,
  "confidence": number от 0 до 100,
  "detectedMarkers": [массив найденных маркеров],
  "riskLevel": "low" | "medium" | "high" | "critical",
  "recommendation": "текст рекомендации для оператора",
  "suggestedAction": "конкретное действие для оператора"
}`;

function createDefaultResponse(isFraudDetected = false, confidence = 0, detectedMarkers = [], riskLevel = 'low', recommendation = '', suggestedAction = '') {
  return {
    isFraudDetected,
    confidence,
    detectedMarkers,
    riskLevel,
    recommendation,
    suggestedAction
  };
}

async function callGigaChatAPI(messages) {
  try {
    const token = await getGigaChatToken();

    const response = await axios.post(
      'https://gigachat.devices.sberbank.ru/api/v1/chat/completions',
      {
        model: "GigaChat",
        messages: messages,
        temperature: 0.1,
        max_tokens: 1000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        httpsAgent: config.httpsAgent,
        timeout: 30000
      }
    );

    if (response.data && response.data.choices && response.data.choices[0]) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('Пустой ответ от GigaChat');
    }
  } catch (error) {
    console.error('Ошибка вызова GigaChat API:', error.response?.data || error.message);
    throw error;
  }
}

async function analyzeForFraud(text) {
  try {
    const response = await callGigaChatAPI([
      {
        role: "system",
        content: SYSTEM_PROMPT
      },
      {
        role: "user",
        content: `Расшифровка звонка для анализа:\n\n"${text}"`
      }
    ]);

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      return createDefaultResponse(
        response.toLowerCase().includes('мошен') ||
        response.toLowerCase().includes('опасность') ||
        response.toLowerCase().includes('fraud'),
        70,
        ['Анализ выполнен, но формат ответа некорректен'],
        'medium',
        response,
        'Проявить повышенную бдительность, задать дополнительные вопросы'
      );
    }
  } catch (error) {
    console.error('Ошибка анализа:', error);
    return createDefaultResponse(
      false,
      0,
      ['Ошибка анализа'],
      'low',
      'Не удалось проанализировать запись. Проведите стандартную проверку.',
      'Следовать стандартному протоколу проверки клиента'
    );
  }
}

module.exports = {
  analyzeForFraud
};
