# gpu passthrough helper
A command line utility to help with the various steps of enabling gpu
passthrough to a guest vm with the wonderful Arch Wiki Article (https://wiki.archlinux.org/title/PCI_passthrough_via_OVMF)

## Requirements
- A (recent?) Linux Distro
- Node >= 12

## Usage
- Getting an overall status of virtualization, iommu and vfio binding
```
$ gph check
✅ Intel VT-d enabled
✅ IOMMU Enabled
✅ 10de:1c03 bound to vfio
✅ 10de:10f1 bound to vfio
```

- Getting a list of iommu groups with vga controllers attached
```
$ gph iommu list
IOMMU Group 1:
        id: 8086:1901
        description: Intel Corporation 6th-10th Gen Core Processor PCIe Controller (x16)
        type: PCI bridge [0604]
        slot: 0000:00:01.0

        id: 10de:1c03 ✅ Bound to vfio
        description: NVIDIA Corporation GP106 [GeForce GTX 1060 6GB]
        type: VGA compatible controller [0300]
        slot: 0000:01:00.0

        id: 10de:10f1 ✅ Bound to vfio
        description: NVIDIA Corporation GP106 High Definition Audio Controller
        type: Audio device [0403]
        slot: 0000:01:00.1

IOMMU Group 2:
        id: 8086:3e92
        description: Intel Corporation CometLake-S GT2 [UHD Graphics 630]
        type: VGA compatible controller [0300]
        slot: 0000:00:02.0
```

- Getting a list of iommu groups with usb controllers attached
```
$ gph iommu list --type USB
IOMMU Group 14:
        id: 1b73:1100
        description: Fresco Logic FL1100 USB 3.0 Host Controller
        type: USB controller [0c03]
        slot: 0000:05:00.0

IOMMU Group 3:
        id: 8086:a36d
        description: Intel Corporation Cannon Lake PCH USB 3.1 xHCI Host Controller
        type: USB controller [0c03]
        slot: 0000:00:14.0

        id: 8086:a36f
        description: Intel Corporation Cannon Lake PCH Shared SRAM
        type: RAM memory [0500]
        slot: 0000:00:14.2
```

- Show help
```
$ gph --help
gph [command]

Commands:
  gph check       check status of gpu passthrough
  gph iommu list  list iommu groups and devices

Options:
  --help     Show help                                       [boolean]
  --version  Show version number                             [boolean]
```

## Installation
For now only manual installation is available
- Clone git repo
```
$ git clone git clone https://github.com/kevindurb/gpu-passthrough-helper.git
```

### Global installation
- Install Globally (may need `sudo`)
```
$ npm install --global
```
- Use
```
$ gph --help
```

### Local installation
- Install Dependencies
```
$ npm install
```
- Use
```
$ ./gph --help
```

## TODO
- [ ] Add support for checking virtualization enabled for AMD processors (need
  someone to test)
- [ ] Better ways of checking than grep-ing dmesg?
- [ ] Checks for enabling vfio module
- [ ] Checks for missing dependencies
- [ ] Wizard for building libvirt vm with bound pci devices
