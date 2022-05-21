#! /usr/bin/env node

const chalk = require('chalk');
const { Command } = require('commander');
const path = require('path');
const Speaker = require('speaker');
const { spawn } = require('child_process');
const { nightcore, getAudioInfo, nightcoreFilter } = require('./ffmpeg');

const program = new Command()
  .argument('<path>', 'path of output audio')
  .option('-p, --pitch <pitch>', 'pitch of the output as a decimal')
  .option('-s, --speed <speed>', 'speed of the output as a decimal')
  .option('-o, --output <path>', 'output path')
  .option('-v, --preview', 'previews the audio instead of saving to file')

program.action(async (args, options) => {
  // Force speed and pitch to match if one is missing.
  if (options.pitch && !options.speed) {
    options.speed = options.pitch;
  }
  else if (options.speed && !options.pitch) {
    options.pitch = options.speed
  }
  else if (!options.pitch && !options.speed) {
    options.pitch = '1';
    options.speed = '1';
  }

  // Create output default related to path.
  if (options.preview) {
    const audioInfo = await getAudioInfo(program.args[0]);
    if (!audioInfo) {
      console.log(chalk.redBright('no audio stream found in the input file'));
      process.exit(-1);
    }

    const device = new Speaker({
      channels: 2,
      bitDepth: 16,
      sampleRate: 44100
    });
    const ffmpeg = spawn('ffmpeg', [
      '-hide_banner', 
      '-i', program.args[0], 
      '-f', 's16le',
      '-ar', '44100', 
      ...nightcoreFilter(audioInfo.sample_rate, options.pitch, options.speed),
      '-'
    ]);
    ffmpeg.stdout.pipe(device);

    
  }
  else {
    if (!options.output) {
      let p = program.args[0];
      let base = path.basename(p);
      base = base.substring(0, base.indexOf('.')) + '.nc' + path.extname(p);
      options.output = path.join(path.dirname(p), base)
    }

    try {
      await nightcore(program.args[0], options.pitch, options.speed, options.output);
    }
    catch (err) {
      console.log(chalk.redBright('no audio stream found in the input file'));
      process.exit(-1);
    }
  }
});

program.parse(process.argv);