const { processAudioFile } = require('../services/audio');
const { recognizeSpeech } = require('../services/speech');
const { analyzeForFraud } = require('../services/fraud');
const { formatFraudAnalysis, incrementStats, cleanupFiles, formatStats } = require('../utils/helpers');

async function handleAudioMessage(ctx) {
  let tempFiles = [];

  try {
    await ctx.reply('🔍 Анализирую запись звонка...');

    const message = ctx.message.audio || ctx.message.voice;
    const { inputPath, outputPath } = await processAudioFile(ctx, message);
    tempFiles = [inputPath, outputPath];

    const text = await recognizeSpeech(outputPath);
    incrementStats(false);

    const analysis = await analyzeForFraud(text);

    const response = formatFraudAnalysis(text, analysis);

    await ctx.replyWithMarkdown(response, {
      reply_to_message_id: ctx.message.message_id
    });

    if (analysis.isFraudDetected) {
      incrementStats(true);
      await ctx.reply('⚠️ *ВНИМАНИЕ ОПЕРАТОРУ!* Требуется немедленное вмешательство специалиста по безопасности.', {
        parse_mode: 'Markdown'
      });
    }

  } catch (error) {
    console.error('Error:', error);
    await ctx.reply(`❌ Ошибка обработки: ${error.message}\n\nПопробуйте отправить аудио ещё раз.`);
  } finally {
    if (tempFiles.length > 0) {
      cleanupFiles(tempFiles);
    }
  }
}

module.exports = {
  handleAudioMessage
};
