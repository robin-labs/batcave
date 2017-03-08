const {Pulse, Device} = require("./models.js");

class Remote {
	constructor(render) {
		this.update = render;
		this.device = new Device();
		this.pulse = Pulse.getDefaultPulse();
		this.pulseHistory = new PulseHistory(this.pulse, (p) => {
			this.pulse = p;
			this.update();
		});
	}
}

class PulseHistory {
	constructor(first, update) {
		this.list = [first];
		this.pointer = 0;
		this.update = update;
	}

	atStart() {
		return this.pointer === 0;
	}

	atEnd() {
		return this.pointer === this.list.length - 1;
	}

	insert(p) {
		if (p.equalTo(this.getCurrent())) {
			return;
		}
		if (!this.atEnd()) {
			this.list = this.list.slice(0, this.pointer);
			this.pointer = this.list.length - 1;
		}
		this.list.push(p);
		this.pointer++;
		this.doUpdate();
	}

	undo() {
		if (!this.atStart()) {
			--this.pointer;
		}
		this.doUpdate();
	}

	redo() {
		if (!this.atEnd()) {
			++this.pointer;
		}
		this.doUpdate();
	}

	getCurrent() {
		return this.list[this.pointer];
	}

	doUpdate() {
		this.update(this.getCurrent());
	}
}

module.exports = {Remote};