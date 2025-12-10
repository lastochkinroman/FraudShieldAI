const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios');
const fs = require('fs');
const config = require('../config/config');

async function downloadFile(url, path) {
  const writer = fs.createWriteStream(path);
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
    httpsAgent: config.httpsAgent,
    timeout: 30000
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

function convertAudio(input, output) {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .audioFrequency(16000)
      .audioChannels(1)
      .audioCodec('pcm_s16le')
      .format('wav')
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .save(output);
  });
}

async function processAudioFile(ctx, message) {
  const fileId = message.file_id;
  const fileInfo = await ctx.telegram.getFile(fileId);
  const audioUrl = `https://api.telegram.org/file/bot${config.botToken}/${fileInfo.file_path}`;

  const inputPath = `temp_${Date.now()}.ogg`;
  const outputPath = `audio_${Date.now()}.wav`;

  await downloadFile(audioUrl, inputPath);
  await convertAudio(inputPath, outputPath);

  return { inputPath, outputPath };
}

module.exports = {
  downloadFile,
  convertAudio,
  processAudioFile
};
