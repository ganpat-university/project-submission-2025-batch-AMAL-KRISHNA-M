### Common Registry Keys and Values in HKLM\SYSTEM\CurrentControlSet\Services<DriverName>

[](https://learn.microsoft.com/en-us/windows-hardware/drivers/install/hklm-system-currentcontrolset-services-registry-tree#start)

#### Start

The `Start` value specifies when the service should be started. It can have one of the following values:

- `0x0` (Boot): Loaded by the boot loader.
- `0x1` (System): Loaded by the I/O subsystem.
- `0x2` (Automatic): Loaded automatically by the Service Control Manager during system startup.
- `0x3` (Demand): Loaded automatically by PnP if it is needed for a device.
- `0x4` (Disabled): The service is disabled and will not be loaded.

[](https://learn.microsoft.com/en-us/windows-hardware/drivers/install/hklm-system-currentcontrolset-services-registry-tree#type)

#### Type

The `Type` value specifies the type of service. It can be a combination of the following values:

- `0x1` (Kernel driver): A device driver.
- `0x2` (File system driver): A file system driver.
- `0x10` (Win32 own process): A Win32 program that runs in its own process.
- `0x20` (Win32 share process): A Win32 program that shares a process with other services.

[](https://learn.microsoft.com/en-us/windows-hardware/drivers/install/hklm-system-currentcontrolset-services-registry-tree#errorcontrol)

#### ErrorControl

The `ErrorControl` value specifies the severity of the error if the service fails to start. It can have one of the following values:

- `0x0` (Ignore): The error is ignored, and the startup continues.
- `0x1` (Normal): The error is logged, a message box may be displayed, but startup continues.
- `0x2` (Severe): The error is logged, and the system is restarted with the last-known-good configuration.
- `0x3` (Critical): The error is logged, and the system attempts to restart with the last-known-good configuration. If this fails, startup fails, and the system halts.

[](https://learn.microsoft.com/en-us/windows-hardware/drivers/install/hklm-system-currentcontrolset-services-registry-tree#additional-common-values)

#### Additional Common Values

- `ImagePath`: Specifies the path to the service binary. Windows creates this value by using the required **ServiceBinary** entry in the driver's INF file. This entry is in the _service-install-section_ referenced by the driver's [**INF AddService directive**](https://learn.microsoft.com/en-us/windows-hardware/drivers/install/inf-addservice-directive).
- `DisplayName`: The friendly name of the service.
- `Description`: A description of the service.

[](https://learn.microsoft.com/en-us/windows-hardware/drivers/install/hklm-system-currentcontrolset-services-registry-tree#example)

### Example

Here is an example of a registry entry for a service:

plaintextCopy

```
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\ExampleService]
"Start"=dword:00000002
"Type"=dword:00000010
"ErrorControl"=dword:00000001
"ImagePath"="C:\\Program Files\\ExampleService\\example.exe"
"DisplayName"="Example Service"
"Description"="This is an example service."
```

 **Note:** The author created this article with assistance from AI. [Learn more](https://learn.microsoft.com/principles-for-ai-generated-content)