/*
 * A basic wrapper for ffmpeg and ffprobe.
 */
const { spawn, ChildProcessWithoutNullStreams } = require('child_process');
const { Readable } = require('stream');

/**
 * Executes ffprobe on the path and returns the first audio
 * stream information.
 * 
 * @param {string} p 
 * @returns {object}
 */
async function getAudioInfo(p) {
  const probe = spawn('ffprobe', [
    '-v', 'quiet',
    '-show_format',
    '-show_streams',
    '-print_format', 'json',
    p
  ]);

  const data = await streamToString(probe.stdout);
  const info = JSON.parse(data);
  if (Object.keys(info).length == 0) return undefined;

  let audioStream;
  info.streams.forEach((stream) => {
    if (!audioStream && stream.codec_type == 'audio') {
      audioStream = stream;
      audioStream.format = info.format.format_name;
    }
  });
  return audioStream;
}
/**
 * 
 * @param {string} p 
 * @param {number} pitch 
 * @param {number} speed 
 * @param {string} outputPath
 */
async function nightcore(p, pitch, speed, outputPath) {
  const audioInfo = await getAudioInfo(p);
  if (!audioInfo) throw new Error('No audio stream found in file.');

  const ffmpeg = spawn('ffmpeg', [
    '-hide_banner',
    '-i', p,
    ...nightcoreFilter(audioInfo.sample_rate, pitch, speed),
    '-f', audioInfo.format,
    '-y',
    outputPath
  ]);
  process.stdin.pipe(ffmpeg.stdin);
  ffmpeg.stderr.pipe(process.stdout);
}

/**
 * Waits for the child process to finish.
 * 
 * @param {ChildProcessWithoutNullStreams} child 
 * @returns 
 */
function wait(child) {
  return new Promise((resolve, reject) => {
    child.on('close', resolve());
  });
}

/**
 * Creates an args array for a spawn call.
 * 
 * @param {number} sampleRate
 * @param {number} pitch 
 * @param {number} speed 
 * @return {string[]}
 */
function nightcoreFilter(sampleRate, pitch, speed) {
  return [
    '-af', `asetrate=${sampleRate*pitch}, aresample=${sampleRate}, atempo=${speed/pitch}`,
  ];
}

/**
 * Converts the contents of a stream to a string.
 * https://stackoverflow.com/questions/10623798/how-do-i-read-the-contents-of-a-node-js-stream-into-a-string-variable
 * 
 * @param {Readable} stream 
 * @param {string} [enc='utf8'] 
 * @returns
 */
function streamToString (stream, enc = 'utf8') {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString(enc)));
  });
}

module.exports = { getAudioInfo, nightcore, nightcoreFilter }