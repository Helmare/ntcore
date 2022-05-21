const { spawn } = require('child_process');
const { Command } = require('commander');
const program = new Command();

program.argument('<path>', 'path of the audio file to nightcore.');
program.option('-p, --pitch', 'pitch of the output as a decimal.');
program.option('-s, --speed', 'speed of the output as a decimal.');

program.action((str, options) => {
  console.log(str);
});