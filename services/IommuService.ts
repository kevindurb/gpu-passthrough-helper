import * as childProcess from 'child_process';
import * as util from 'util';

import { HardwareService, CPUVendor } from './HardwareService';
import * as log from '../utils/log';

const exec = util.promisify(childProcess.exec);

export class IommuService {
  private hardwareService: HardwareService;

  constructor() {
    this.hardwareService = new HardwareService();
  }

  async assertIOMMUEnabled() {
    try {
      await exec('dmesg | grep -i -e "IOMMU.*enabldded"');
      log.success('IOMMU Enabled');
    } catch {
      throw new Error('IOMMU not enabled');
    }
  }

  async assertCPUVirtualizationEnabled() {
    if (this.hardwareService.getCPUVendor() === CPUVendor.Intel) {
      try {
        await exec('dmesg | grep -i -e "VT-d active"');
        log.success('Intel VT-d enabled');
      } catch {
        throw new Error('Intel VT-d not enabled');
      }
    } else {
      throw new Error('AMD not yet supported');
      // await exec('dmesg | grep -i -e "AMD-Vi active"');
    }
  }
}
