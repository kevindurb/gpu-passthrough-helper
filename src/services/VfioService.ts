import * as log from '../utils/log';
import { HardwareService } from './HardwareService';

export class VfioService {
  hardwareService: HardwareService;

  constructor() {
    this.hardwareService = new HardwareService();
  }

  async getBoundDevices() {
    const devices = this.hardwareService.getPCIDevices();
    return devices.filter((device) => device.driver?.includes('vfio'));
  }

  async assertHasBoundDevices() {
    const boundDevices = await this.getBoundDevices();
    if (!boundDevices.length) {
      throw new Error(
        'No devices bound to vfio. See https://wiki.archlinux.org/title/PCI_passthrough_via_OVMF#Isolating_the_GPU',
      );
    } else {
      boundDevices.forEach(({ id }) => {
        log.success(`${id} bound to vfio`);
      });
    }
  }
}
