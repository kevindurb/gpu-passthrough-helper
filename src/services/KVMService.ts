import * as shelljs from 'shelljs';
import * as fs from 'fs/promises';

import * as log from '../utils/log';
import { HardwareService, CPUVendor } from './HardwareService';

export class KVMService {
  private hardwareService: HardwareService;

  constructor() {
    this.hardwareService = new HardwareService();
  }

  async assertCPUVirtualizationEnabled() {
    const lscpuResult = shelljs.exec('lscpu').grep('Virtualization:');
    if (this.hardwareService.getCPUVendor() === CPUVendor.Intel) {
      if (!lscpuResult.includes('VT-x')) {
        throw new Error('Your Intel CPU does not support VT-d');
      }
      log.success('Intel VT-d supported');
    } else {
      if (!lscpuResult.includes('AMD-V')) {
        throw new Error('Your AMD CPU does not support AMD-V');
      }
      log.success('AMD-V supported');
    }
  }

  async assertKVMEnabled() {
    try {
      await fs.stat('/dev/kvm');
      log.success('KVM enabled');
    } catch {
      throw new Error('KVM not enabled. Check your BIOS settings');
    }
  }
}
