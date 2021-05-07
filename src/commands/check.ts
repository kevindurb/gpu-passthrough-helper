import * as yargs from 'yargs';

import { IommuService } from '../services/IommuService';
import { VfioService } from '../services/VfioService';
import * as log from '../utils/log';

const command: yargs.CommandModule = {
  command: 'check',
  describe: 'check status of gpu passthrough',
  async handler() {
    const iommuService = new IommuService();
    const vfioService = new VfioService();

    try {
      await iommuService.assertCPUVirtualizationEnabled();
    } catch (error) {
      log.failure(error.message);
    }

    try {
      await iommuService.assertIOMMUEnabled();
    } catch (error) {
      log.failure(error.message);
    }

    try {
      await vfioService.assertHasBoundDevices();
    } catch (error) {
      log.failure(error.message);
    }
  },
};

export default command;
