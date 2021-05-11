import * as yargs from 'yargs';
import * as shelljs from 'shelljs';

import checkCommand from './commands/check';
import iommuListCommand from './commands/iommuList';

shelljs.config.silent = true;

yargs.command(checkCommand).command(iommuListCommand).argv;
