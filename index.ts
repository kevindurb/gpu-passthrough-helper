import * as yargs from 'yargs';

import checkCommand from './commands/check';

yargs.command(checkCommand).argv;
