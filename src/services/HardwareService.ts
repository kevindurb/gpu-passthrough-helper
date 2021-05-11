import * as os from 'os';
import * as shelljs from 'shelljs';
import * as arrayUtils from '../utils/array';

export enum CPUVendor {
  Intel = 'intel',
  Amd = 'amd',
}

export interface PCIDevice {
  id: string;
  type: string;
  description: string;
  slot: string;
  driver?: string;
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

  getPCIDeviceDetailsBySlot(slot: string): PCIDevice {
    const { stdout } = shelljs.exec(`lspci -nns ${slot}`);
    const result = stdout.match(/([\d\w:\.]+) (.+): (.+) \[(.+)\]/);

    if (!result) {
      throw new Error(`Not able to parse device: ${stdout} in slot ${slot}`);
    }

    const [, , type, description, id] = result;
    return {
      id,
      type,
      description,
      slot,
    };
  }

  getPCIDevices(): PCIDevice[] {
    const result = shelljs.exec('lspci -v');
    const deviceStrings = result.split(/\n\s*\n/);
    return arrayUtils.mapFilterUndefined(deviceStrings, (deviceString) => {
      if (!deviceString) return undefined;
      const [name, ...propertyStrings] = deviceString.split('\n');
      const [slot] = name.split(' ');
      const properties = Object.fromEntries(
        arrayUtils.mapFilterUndefined(propertyStrings, (line) => {
          if (!line.includes(':')) return undefined;
          return line.split(':').map((x) => x.trim());
        }),
      );

      return {
        ...this.getPCIDeviceDetailsBySlot(slot),
        driver: properties['Kernel driver in use'],
      };
    });
  }
}
