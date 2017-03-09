const DeviceStatus = {
	// Device is disconnected
	DISCONNECTED: "disconnected",
	// We're not sure what the device is doing
	UNKNOWN: "unknown",
	// The device server is running but doing busywork
	BUSY: "busy",
	// The device won't work because there's a hardware problem
	// Maybe a mic is unplugged or the emitter battery is dead
	HARDWARE_UNAVAILABLE: "hardware-unavailable",
	// Ready to go!
	READY: "ready",
};

const RemoteStatus = {
	NO_SOCKET: "no-socket",
	DISCONNECTED: "disconnected",
};

const Message = {
	CONNECT: "connect",
	DISCONNECT: "disconnect",
	HANDSHAKE_REMOTE: "remote-handshake",
	HANDSHAKE_DEVICE: "device-handshake",
	DEVICE_LISTING: "device-listing",
	CHOOSE_DEVICE: "choose-device",
	DEVICE_CHOICE_INVALID: "device-choice-invalid",
	DEVICE_CHOICE_SUCCESSFUL: "device-choice-successful",
	DEVICE_STATUS: "device-status",
	DEVICE_NEW_REMOTE: "device-new-remote",
	UPDATE_PULSE: "update-pulse",
	UPDATE_OVERRIDES: "update-overrides",
};

module.exports = {DeviceStatus, RemoteStatus, Message};