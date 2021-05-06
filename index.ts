import * as yargs from 'yargs';

yargs.command(
  'hello [name]',
  'welcome',
  (yargs) => {
    yargs.positional('name', {
      type: 'string',
      default: 'kevin',
      describe: 'a description',
    });
  },
  (args) => {
    console.log(args.name);
  },
).argv;
