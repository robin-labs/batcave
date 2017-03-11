const {HOST, PORT} = require("./config.js");

const express = require("express");
const app = express();
const server = app.listen(PORT, HOST);
const io = require("socket.io").listen(server, {log: true});
const ioWildcard = require("socketio-wildcard")();
const path = require("path");

const {DeviceStatus, Message} = require("./frontend/js/protocol.js");

app.use(express.static(path.join(__dirname, "frontend")));
io.use(ioWildcard);

class Device {
	constructor(socket, info) {
		this.socket = socket;
		this.info = info;
		this.id = info.id;
		this.status = DeviceStatus.UNKNOWN;
	}
}

const devices = new Set();
const remotes = new Set();

io.on("connection", (socket) => {
	socket.on(Message.HANDSHAKE_DEVICE, (info) => deviceSocket(socket, info));
	socket.on(Message.HANDSHAKE_REMOTE, () => remoteSocket(socket));
});

const deviceSocket = (socket, info) => {
	const dev = new Device(socket, info);
	devices.add(dev);

	console.log("new device", dev.id);

	socket.on(Message.DISCONNECT, (e) => {
		devices.delete(dev);
	});	
};

const remoteSocket = (socket) => {
	var device = null;
	remotes.add(socket);

	setInterval(() => {
		if (!device) {
			socket.emit(
				Message.DEVICE_LISTING,
				Array.from(devices, d => d.info)
			);
		}
	}, 1000);

	socket.on(Message.CHOOSE_DEVICE, (idChoice) => {
		const dev = Array.from(devices).filter(d => d.id === idChoice)[0];
		if (!dev) {
			socket.emit(Message.DEVICE_CHOICE_INVALID, idChoice);
		} else {
			device = dev;
			device.socket.on(Message.DISCONNECT, () => {
				device = null;
				socket.emit(Message.DEVICE_STATUS, {
					status: DeviceStatus.DISCONNECTED,
				});
			});
			device.socket.on("*",
				({data: [message, ...args]}) => {
					console.log("device emitted message", message, args);
					socket.emit(message, ...args);
				}
			);
			socket.on("*",
				({data: [message, ...args]}) => {
					console.log("remote emitted message", message, args);
					device && device.socket.emit(message, ...args);
				}
			);
			socket.on(Message.DISCONNECT, () => {
				device && device.socket.emit(Message.DEVICE_REMOTE_DISCONNECT);
			});
			device.socket.emit(Message.DEVICE_REMOTE_CONNECT);
			socket.emit(Message.DEVICE_CHOICE_SUCCESSFUL, idChoice);
		}
	});

	socket.on(Message.DISCONNECT, () => remotes.delete(socket));
};