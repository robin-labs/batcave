class Model {
	constructor() {
		this.__pending = {};
	}

	enumerable(props, override) {
		props = {...props, ...override};
		this.__properties = [];
		for (let k in props) {
			this.__properties.push(k);
			Object.defineProperty(this, k, {
				enumerable: true, configurable: true, writable: true
			});
			this[k] = props[k];
		}
	}

	copy(obj) {
		var k = new this.constructor({
			...this,
			...obj
		});
		return k;
	}

	equalTo(other) {
		if (other.constructor !== this.constructor) {
			return false;
		}
		for (let k of this.__properties) {
			if (this[k] !== other[k]) {
				return false;
			}
		}
		return true;
	}

	setFallbackValue(key, value) {
		this.__pending[key] = value;
	}

	resolveFallbackValue(key, success) {
		if (!success) {
			this[key] = this.__pending[key];
		}
		delete this.__pending[key];
	}
}

class Device extends Model {
	constructor(obj) {
		super();
		this.identifier = "robin";
		// Battery status
		this.deviceBatteryLow = false;
		this.emitterBatteryLow = false;
	}
}

class Pulse extends Model {
	constructor(obj) {
		super();
		this.enumerable({
			type: Pulse.types.CHIRP,
			usDuration: 5e3,
			khzStart: 50,
			khzEnd: 25,
			isSquare: false,
			isLogarithmic: false,
		}, obj);
	}
}

Pulse.getDefaultPulse = function() {
	return new Pulse({
		usDuration: 5e3,
		khzStart: 50,
		khzEnd: 25,
	});
};

Pulse.types = {
	TONE: "tone",
	CHIRP: "chirp",
	CLICK: "click",
};

window.Pulse = Pulse;

module.exports = {Device, Pulse};