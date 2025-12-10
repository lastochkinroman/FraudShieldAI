const fs = require('fs');

let totalCallsProcessed = 0;
let fraudDetected = 0;

function formatFraudAnalysis(text, analysis) {
  const riskEmoji = {
    low: '🟢',
    medium: '🟡',
    high: '🟠',
    critical: '🔴'
  };

  const fraudStatus = analysis.isFraudDetected ? '⚠️ *ОБНАРУЖЕНО ПОДОЗРЕНИЕ НА МОШЕННИЧЕСТВО*' : '✅ *БЕЗ ОПАСНЫХ ПРИЗНАКОВ*';

  return `
🎤 *РАСШИФРОВКА ЗВОНКА:*
${text}

${fraudStatus}

📊 *АНАЛИЗ БЕЗОПАСНОСТИ:*
• Уровень риска: ${riskEmoji[analysis.riskLevel] || '⚪'} ${analysis.riskLevel?.toUpperCase() || 'НЕИЗВЕСТНО'}
• Уверенность анализа: ${analysis.confidence || 0}%
• Найдено маркеров: ${analysis.detectedMarkers?.length || 0}

🔍 *ОБНАРУЖЕННЫЕ МАРКЕРЫ:*
${analysis.detectedMarkers ? analysis.detectedMarkers.map((marker, i) => `${i+1}. ${marker}`).join('\n') : 'Не удалось определить'}

💡 *РЕКОМЕНДАЦИЯ ОПЕРАТОРУ:*
${analysis.recommendation || 'Нет рекомендации'}

🚨 *ДЕЙСТВИЕ ДЛЯ ОПЕРАТОРА:*
${analysis.suggestedAction || 'Следовать стандартному протоколу'}

_Анализ выполнен AI-ассистентом Сбера. Требуется подтверждение оператора._
  `;
}

function getStats() {
  return {
    totalCallsProcessed,
    fraudDetected
  };
}

function incrementStats(isFraud) {
  totalCallsProcessed++;
  if (isFraud) fraudDetected++;
}

function cleanupFiles(files) {
  files.forEach(file => {
    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        console.log(`🧹 Удален временный файл: ${file}`);
      }
    } catch (error) {
      console.error('Ошибка удаления файла:', file, error);
    }
  });
}

function formatStats() {
  const { totalCallsProcessed, fraudDetected } = getStats();
  const fraudRate = totalCallsProcessed > 0 ? ((fraudDetected / totalCallsProcessed) * 100).toFixed(1) : 0;

  return `📊 *Статистика анализа звонков*\n\n` +
    `Всего обработано звонков: ${totalCallsProcessed}\n` +
    `Обнаружено подозрений: ${fraudDetected}\n` +
    `Процент выявления: ${fraudRate}%\n\n` +
    `_Данные для демонстрации работы системы_`;
}

module.exports = {
  formatFraudAnalysis,
  getStats,
  incrementStats,
  cleanupFiles,
  formatStats
};
