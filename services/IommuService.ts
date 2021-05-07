import * as childProcess from 'child_process';
import * as fs from 'fs/promises';
import * as util from 'util';

import { HardwareService, CPUVendor } from './HardwareService';
import * as log from '../utils/log';

const exec = util.promisify(childProcess.exec);

interface PCIDevice {
  id: string;
  type: string;
  description: string;
  slot: string;
}

interface IOMMUGroup {
  id: string;
  devices: PCIDevice[];
}

export class IommuService {
  private hardwareService: HardwareService;

  constructor() {
    this.hardwareService = new HardwareService();
  }

  async assertIOMMUEnabled() {
    try {
      await exec('dmesg | grep -i -e "IOMMU.*enabled"');
      log.success('IOMMU Enabled');
    } catch {
      throw new Error(
        'IOMMU not enabled. See https://wiki.archlinux.org/title/PCI_passthrough_via_OVMF#Enabling_IOMMU',
      );
    }
  }

  async assertCPUVirtualizationEnabled() {
    if (this.hardwareService.getCPUVendor() === CPUVendor.Intel) {
      try {
        await exec('dmesg | grep -i -e "VT-d active"');
        log.success('Intel VT-d enabled');
      } catch {
        throw new Error(
          'Intel VT-d not enabled. See https://wiki.archlinux.org/title/PCI_passthrough_via_OVMF#Enabling_IOMMU',
        );
      }
    } else {
      throw new Error('AMD not yet supported');
      // await exec('dmesg | grep -i -e "AMD-Vi active"');
    }
  }

  async getIOMMUGroupIds(): Promise<string[]> {
    const files = await fs.readdir('/sys/kernel/iommu_groups/');
    const fileStats = await Promise.all(
      files.map((file) => fs.stat(`/sys/kernel/iommu_groups/${file}`)),
    );

    return files.filter((file, index) => fileStats[index].isDirectory());
  }

  async getDeviceDetailsBySlot(slot: string): Promise<PCIDevice> {
    const { stdout } = await exec(`lspci -nns ${slot}`);
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
