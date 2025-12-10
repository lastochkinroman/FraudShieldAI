const { Telegraf } = require('telegraf');

const config = require('./config/config');
const {
  handleStartCommand,
  handleTestCommand,
  handleStatsCommand,
  handleExampleCommand,
  handleDemoCommand,
  handleUnknownText
} = require('./handlers/commands');
const { handleAudioMessage } = require('./handlers/messages');

const bot = new Telegraf(config.botToken);

bot.on('audio', handleAudioMessage);
bot.on('voice', handleAudioMessage);

bot.on('text', async (ctx) => {
  const text = ctx.message.text;

  if (text === '/start') {
    await handleStartCommand(ctx);
  } else if (text === '/test') {
    await handleTestCommand(ctx);
  } else if (text === '/stats') {
    await handleStatsCommand(ctx);
  } else if (text === '/example') {
    await handleExampleCommand(ctx);
  } else if (text === '/demo') {
    await handleDemoCommand(ctx);
  } else {
    await handleUnknownText(ctx);
  }
});

bot.catch((err, ctx) => {
  console.error(`Ошибка для ${ctx.updateType}:`, err);
});

bot.launch().then(() => {
  console.log('🤖 Бот успешно запущен');
  console.log('💡 Используйте команду /start для получения справки');
  console.log('🎭 Используйте /demo чтобы увидеть демо-сценарии для конференции');
}).catch(err => {
  console.error('Ошибка запуска бота:', err);
});

process.once('SIGINT', () => {
  console.log('🛑 Остановка бота...');
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  console.log('🛑 Остановка бота...');
  bot.stop('SIGTERM');
});
