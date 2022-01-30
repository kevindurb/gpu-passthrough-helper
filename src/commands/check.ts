import * as yargs from 'yargs';

import { KVMService } from '../services/KVMService';
import { IommuService } from '../services/IommuService';
import { VfioService } from '../services/VfioService';
import * as log from '../utils/log';

const command: yargs.CommandModule = {
  command: 'check',
  describe: 'check status of gpu passthrough',
  async handler() {
    const kvmService = new KVMService();
    const iommuService = new IommuService();
    const vfioService = new VfioService();

    try {
      await kvmService.assertCPUVirtualizationEnabled();
      await kvmService.assertKVMEnabled();
    } catch (error) {
      if (error instanceof Error) {
        log.failure(error.message);
      } else {
        log.failure(error)
      }
    }

    try {
      await iommuService.assertIOMMUEnabled();
    } catch (error) {
      if (error instanceof Error) {
        log.failure(error.message);
      } else {
        log.failure(error)
      }
    }

    try {
      await vfioService.assertHasBoundDevices();
    } catch (error) {
      if (error instanceof Error) {
        log.failure(error.message);
      } else {
        log.failure(error)
      }
    }
  },
};

export default command;
