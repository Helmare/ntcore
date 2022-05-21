#! /usr/bin/env node

const chalk = require('chalk');
const { Command } = require('commander');
const path = require('path');
const { argv } = require('process');
const { nightcore } = require('./ffmpeg');

const program = new Command()
  .argument('<path>', 'path of output audio')
  .option('-p, --pitch <pitch>', 'pitch of the output as a decimal')
  .option('-s, --speed <speed>', 'speed of the output as a decimal')
  .option('-o, --output <path>', 'output path')

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
  if (!options.output) {
    let p = program.args[0];
    let base = path.basename(p);
    base = base.substring(0, base.indexOf('.')) + '.nc' + path.extname(p);
    options.output = path.join(path.dirname(p), base)
  }

  await nightcore(program.args[0], options.pitch, options.speed, options.output);
});

program.parse(argv);