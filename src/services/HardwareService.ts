import * as os from 'os';

export enum CPUVendor {
  Intel = 'intel',
  Amd = 'amd',
}

export class HardwareService {
  getCPUVendor() {
    const cpus = os.cpus();
    const firstCPU = cpus[0];
    if (!firstCPU) {
      throw new Error('No CPUs Found');
    }

    if (/intel/i.test(firstCPU.model)) {
      return CPUVendor.Intel;
    }
    return CPUVendor.Amd;
  }
}
