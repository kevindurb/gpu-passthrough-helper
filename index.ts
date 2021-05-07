import * as yargs from 'yargs';

import checkCommand from './commands/check';
import iommuListCommand from './commands/iommuList';

yargs.command(checkCommand).command(iommuListCommand).argv;
