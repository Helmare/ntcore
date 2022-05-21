#! /usr/bin/env node

const chalk = require('chalk');
const { Command } = require('commander');
const { argv } = require('process');
const { getAudioInfo } = require('./ffmpeg');

const program = new Command()
  .argument('<path>', 'path of the audio file to nightcore')
  .option('-p, --pitch <pitch>', 'pitch of the output as a decimal', '1')
  .option('-s, --speed <speed>', 'speed of the output as a decimal', '1')

program.action(async (args, options) => {
  const audioInfo = await getAudioInfo(program.args[0]);
  if (!audioInfo) {
    console.log(chalk.redBright('Invalid audio file.'));
    return;
  }


  console.log(audioInfo);
});

program.parse(argv);