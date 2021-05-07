import * as childProcess from 'child_process';
import * as util from 'util';

import * as log from '../utils/log';

const exec = util.promisify(childProcess.exec);

export class VfioService {
  async getBoundDeviceIds() {
    const { stdout } = await exec(`dmesg | grep -i "vfio_pci: add"`);
    const lines = stdout.split('\n').filter((line) => !!line);
    return lines.map((line) => {
      const parseResult = line.match(/\[.+\].+\[(.+)\[.*\]\]/);
      if (!parseResult) {
        throw new Error(`Not able to parse vfio bind: ${line}`);
      }
      const [, id] = parseResult;
      return id;
    });
  }

  async assertHasBoundDevices() {
    const boundDevices = await this.getBoundDeviceIds();
    if (!boundDevices.length) {
      throw new Error(
        'No devices bound to vfio. See https://wiki.archlinux.org/title/PCI_passthrough_via_OVMF#Isolating_the_GPU',
      );
    } else {
      boundDevices.forEach((id) => {
        log.success(`${id} bound to vfio`);
      });
    }
  }
}
