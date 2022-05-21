#! /usr/bin/env node

const chalk = require('chalk');
const { Command } = require('commander');
const { argv } = require('process');
const { getAudioInfo, nightcore } = require('./ffmpeg');

const program = new Command()
  .argument('<path>', 'path of output audio')
  .option('-p, --pitch <pitch>', 'pitch of the output as a decimal', '1')
  .option('-s, --speed <speed>', 'speed of the output as a decimal', '1')
  .requiredOption('-o, --output <path>', 'output path')

program.action(async (args, options) => {
  await nightcore(program.args[0], options.pitch, options.speed, options.output);
});

program.parse(argv);