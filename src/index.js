#! /usr/bin/env node

const chalk = require('chalk');
const { Command } = require('commander');
const { argv } = require('process');
const { nightcore } = require('./ffmpeg');

const program = new Command()
  .argument('<path>', 'path of output audio')
  .option('-p, --pitch <pitch>', 'pitch of the output as a decimal')
  .option('-s, --speed <speed>', 'speed of the output as a decimal')
  .requiredOption('-o, --output <path>', 'output path')

program.action(async (args, options) => {
  if (options.pitch && !options.speed) {
    options.speed = options.pitch;
  }
  else if (options.speed && !options.pitch) {
    options.pitch = options.speed
  }
  else {
    options.pitch = '1';
    options.speed = '1';
  }

  await nightcore(program.args[0], options.pitch, options.speed, options.output);
});

program.parse(argv);