import * as fs from 'fs/promises';
import * as shelljs from 'shelljs';

import { HardwareService, PCIDevice } from './HardwareService';
import * as log from '../utils/log';

export interface IOMMUGroup {
  id: string;
  devices: PCIDevice[];
}

export class IommuService {
  private hardwareService: HardwareService;

  constructor() {
    this.hardwareService = new HardwareService();
  }

  async assertIOMMUEnabled() {
    const result = shelljs.ls('/sys/class/iommu');
    if (!result.length) {
      throw new Error(
        'IOMMU not enabled. See https://wiki.archlinux.org/title/PCI_passthrough_via_OVMF#Enabling_IOMMU',
      );
    }
    log.success('IOMMU Enabled');
  }

  async getIOMMUGroupIds(): Promise<string[]> {
    const files = await fs.readdir('/sys/kernel/iommu_groups/');
    const fileStats = await Promise.all(
      files.map((file) => fs.stat(`/sys/kernel/iommu_groups/${file}`)),
    );

    return files.filter((file, index) => fileStats[index].isDirectory());
  }

  async getIOMMUGroupDetails(groupId: string): Promise<IOMMUGroup> {
    const deviceSlots = await fs.readdir(
      `/sys/kernel/iommu_groups/${groupId}/devices`,
    );

    const devices = deviceSlots.map((slot) =>
      this.hardwareService.getPCIDeviceDetailsBySlot(slot),
    );

    return {
      id: groupId,
      devices,
    };
  }

  async getIOMMUGroups(): Promise<IOMMUGroup[]> {
    return Promise.all(
      (await this.getIOMMUGroupIds()).map((id) =>
        this.getIOMMUGroupDetails(id),
      ),
    );
  }
}
