const React = require("react");
const {StyleSheet, css} = require("aphrodite");

const FlatButton = require("material-ui/FlatButton").default;
const IconButton = require("material-ui/IconButton").default;
const Paper = require("material-ui/Paper").default;
const Toggle = require("material-ui/Toggle").default;
const Subheader = require("material-ui/Subheader").default;
const {List, ListItem} = require("material-ui/List");
const {Tab, Tabs} = require("material-ui/Tabs");
const {Card, CardActions, CardHeader, CardText} = require("material-ui/Card");

const RestartIcon = require("material-ui/svg-icons/navigation/refresh.js").default;
const PowerIcon = require("material-ui/svg-icons/action/power-settings-new.js").default;
const UndoIcon = require("material-ui/svg-icons/content/undo.js").default;
const RedoIcon = require("material-ui/svg-icons/content/redo.js").default;
const StarIcon = require("material-ui/svg-icons/toggle/star.js").default;
const StarBorderIcon = require("material-ui/svg-icons/toggle/star-border.js").default;
const BookmarkIcon = require("material-ui/svg-icons/action/bookmark.js").default;

const {Remote} = require("../remote.js");
const {Pulse} = require("../models.js");

const {LabeledSlider, RobinCard} = require("./shared.jsx");

const RemoteView = React.createClass({
	propTypes: {
		remote: React.PropTypes.instanceOf(Remote).isRequired,
	},

	render() {
		const {remote} = this.props;
		return <div>
			<PulseControl {...this.props}/>
			{remote.device && <DeviceInfo {...this.props}/>}
		</div>;
	},
});

const DeviceInfo = ({remote}) => <RobinCard>
	<List>
		<Subheader>Device information</Subheader>
		<ListItem
			disabled
			primaryText="Identifier"
			secondaryText={remote.device.id}
		/>
		<ListItem
			disabled
			primaryText="IP address"
			secondaryText={remote.device.ip}
		/>
		<ListItem
			disabled
			primaryText="Bluetooth connections"
			secondaryText={remote.device.bluetoothConnections}
		/>
		<ListItem
			disabled
			primaryText="Last seen"
			secondaryText={remote.device.lastSeen}
		/>
		<ListItem
			disabled
			primaryText="Device battery"
			secondaryText={
				remote.device.deviceBatteryLow ? "Low" : "Okay"
			}
		/>
		<ListItem
			disabled
			primaryText="Emitter battery"
			secondaryText={
				remote.device.emitterBatteryLow ? "Low" : "Okay"
			}
		/>
		<Subheader>Debugging overrides</Subheader>
		<ListItem
			primaryText="Force-enable emitters"
			secondaryText="Useful for debugging the analog hardware"
			rightToggle={<Toggle/>}
		/>
		<ListItem
			primaryText="Disable device playback"
			secondaryText="Turns off playback through headphone jack"
			rightToggle={<Toggle/>}
		/>
		<ListItem
			primaryText="Disable save"
			secondaryText="Won't save audio recordings or photos"
			rightToggle={<Toggle/>}
		/>
		<Subheader>Here be dragons</Subheader>
		<ListItem
			primaryText="Restart the device server"
			secondaryText="You'll lose connection for a few seconds, at least"
			rightIcon={<RestartIcon/>}
		/>
		<ListItem
			primaryText="Restart the device"
			secondaryText="All bets are off"
			rightIcon={<PowerIcon/>}
		/>
	</List>
</RobinCard>;

const PulseControl = React.createClass({
	handleUpdate(updated) {
		const {remote} = this.props;
		remote.updatePulse(remote.pulse.copy(updated));
	},

	renderInner() {
		const {remote} = this.props;
		const pulse = remote.pulse;
		return <List style={{padding: 0}}>
			<ListItem disabled>
				<LabeledSlider 
					name="duration"
					getLabel={(n) => <span><b>Duration:</b> {n}ms</span>}
					onUpdate={(v) => this.handleUpdate({usDuration: 1000 * v})}
					min={1}
					max={20}
					step={1}
					value={pulse.usDuration / 1000}
				/>
			</ListItem>
			{pulse.type !== Pulse.types.CLICK && <ListItem disabled>
				<LabeledSlider 
					name="start-freq"
					getLabel={(n) => 
						<span><b>{
							pulse.type === Pulse.types.CHIRP ?
								"Starting frequency" :
								"Frequency"
						}:</b> {n}kHz</span>
					}
					onUpdate={(v) => this.handleUpdate({khzStart: v})}
					min={10}
					max={90}
					step={5}
					value={pulse.khzStart}
				/>
			</ListItem>}
			{pulse.type === Pulse.types.CHIRP && <ListItem disabled>
				<LabeledSlider 
					name="end-freq"
					getLabel={(n) => 
						<span><b>Ending frequency:</b> {n}kHz</span>
					}
					onUpdate={(v) => this.handleUpdate({khzEnd: v})}
					min={10}
					max={90}
					step={5}
					value={pulse.khzEnd}
				/>
			</ListItem>}
			{pulse.type !== Pulse.types.CLICK && <ListItem
				primaryText="Square"
				secondaryText="Emit a square wave"
				rightToggle={<Toggle
					toggled={pulse.isSquare}
					onToggle={(e, v) => this.handleUpdate({isSquare: v})}
				/>}
			/>}
			{pulse.type === Pulse.types.CHIRP && <ListItem
				primaryText="Logarithmic"
				secondaryText="Chirp with a logarithmic freqency sweep"
				rightToggle={<Toggle
					toggled={pulse.isLogarithmic}
					onToggle={(e, v) => this.handleUpdate({isLogarithmic: v})}
				/>}
			/>}
			<ListItem
				primaryText="Windshield wipers"
				secondaryText="Emit a pulse on a specified interval"
				rightToggle={<Toggle/>}
			/>
		</List>;
	},

	render() {
		const {remote} = this.props;
		const pulse = remote.pulse;
		return <RobinCard>
			<Tabs 
				value={pulse.type}
				onChange={(v) => this.handleUpdate({type: v})}
			>
				<Tab value={Pulse.types.TONE} label="Tone"/>
				<Tab value={Pulse.types.CHIRP} label="Chirp"/>
				<Tab value={Pulse.types.CLICK} label="Click"/>
			</Tabs>
			<div 
				style={{
					display: "flex",
					justifyContent: "space-around",
				}}
			>
				<IconButton
					disabled={remote.pulseHistory.atStart()}
					onTouchTap={() => remote.pulseHistory.undo()}
				><UndoIcon/>
				</IconButton>
				<IconButton 
					disabled={remote.pulseHistory.atEnd()}
					onTouchTap={() => remote.pulseHistory.redo()}
				>
					<RedoIcon/>
				</IconButton>
				<IconButton disabled><BookmarkIcon/></IconButton>
				<IconButton disabled><StarBorderIcon/></IconButton>
			</div>	
			{this.renderInner()}
		</RobinCard>;
	}
});

module.exports = {RemoteView, DeviceInfo, PulseControl};