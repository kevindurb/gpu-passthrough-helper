import * as yargs from 'yargs';
import * as chalk from 'chalk';

import { IommuService } from '../services/IommuService';
import * as log from '../utils/log';

const command: yargs.CommandModule = {
  command: 'iommu list',
  describe: 'list all iommu groups and devices',
  async handler() {
    const iommuService = new IommuService();
    const groups = await iommuService.getIOMMUGroups();
    groups.forEach((group) => {
      log.info(chalk.bold(`IOMMU Group ${group.id}:`));
      group.devices.forEach((device) => {
        log.info(`\t${chalk.bold('id:')} ${device.id}`);
        log.info(`\t${chalk.bold('description:')} ${device.description}`);
        log.info(`\t${chalk.bold('type:')} ${device.type}`);
        log.info(`\t${chalk.bold('slot:')} ${device.slot}`);
        log.info('');
      });
    });
  },
};

export default command;
