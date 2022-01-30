import * as yargs from 'yargs';
import chalk from 'chalk';
import * as emoji from 'node-emoji';

import { IommuService, IOMMUGroup } from '../services/IommuService';
import { VfioService } from '../services/VfioService';
import * as log from '../utils/log';

interface Args {
  all: Boolean;
  type: string;
}

const getGroupsWithType = (groups: IOMMUGroup[], type: string) =>
  groups.filter((group) => {
    return group.devices.reduce<boolean>((included, device) => {
      if (included) return true;
      if (device.type.includes(type)) {
        return true;
      }
      return false;
    }, false);
  });

const command: yargs.CommandModule<{}, Args> = {
  command: 'iommu list',
  describe: 'list iommu groups and devices',
  builder(yargs) {
    return yargs
      .option('all', {
        type: 'boolean',
        default: false,
      })
      .option('type', {
        type: 'string',
        default: 'VGA compatible controller',
      });
  },
  async handler(args) {
    const iommuService = new IommuService();
    const vfioService = new VfioService();
    const allGroups = await iommuService.getIOMMUGroups();
    const vfioDeviceIds = (await vfioService.getBoundDevices()).map(
      ({ id }) => id,
    );

    let groups: IOMMUGroup[] = [];

    if (args.all) {
      groups = allGroups;
    } else {
      groups = getGroupsWithType(allGroups, args.type);
    }

    groups.forEach((group) => {
      log.info(chalk.bold(`IOMMU Group ${group.id}:`));
      group.devices.forEach((device) => {
        const isBound = vfioDeviceIds.includes(device.id);
        const isBoundText = isBound
          ? chalk.bold(`${emoji.get('white_check_mark')} Bound to vfio`)
          : '';
        log.info(`\t${chalk.bold('id:')} ${device.id} ${isBoundText}`);
        log.info(`\t${chalk.bold('description:')} ${device.description}`);
        log.info(`\t${chalk.bold('type:')} ${device.type}`);
        log.info(`\t${chalk.bold('slot:')} ${device.slot}`);
        log.info('');
      });
    });
  },
};

export default command;
