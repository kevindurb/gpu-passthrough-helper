import * as fs from 'fs/promises';
import * as shelljs from 'shelljs';

import * as log from '../utils/log';

export interface PCIDevice {
  id: string;
  type: string;
  description: string;
  slot: string;
}

export interface IOMMUGroup {
  id: string;
  devices: PCIDevice[];
}

export class IommuService {
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

  async getDeviceDetailsBySlot(slot: string): Promise<PCIDevice> {
    const { stdout } = shelljs.exec(`lspci -nns ${slot}`);
    const result = stdout.match(/([\d\w:\.]+) (.+): (.+) \[(.+)\]/);

    if (!result) {
      throw new Error(`Not able to parse device: ${stdout}`);
    }

    const [, , type, description, id] = result;
    return {
      id,
      type,
      description,
      slot,
    };
  }

  async getIOMMUGroupDetails(groupId: string): Promise<IOMMUGroup> {
    const deviceSlots = await fs.readdir(
      `/sys/kernel/iommu_groups/${groupId}/devices`,
    );

    const devices = await Promise.all(
      deviceSlots.map((slot) => this.getDeviceDetailsBySlot(slot)),
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
