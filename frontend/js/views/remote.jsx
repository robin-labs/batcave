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

const {LabeledSlider, RobinCard, ConfirmDialog} = require("./shared.jsx");

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

const DeviceInfo = React.createClass({
	getInitialState() {
		return {
			confirmingRestart: false,
			confirmingReboot: false,
		};
	},

	render() {
		const {remote} = this.props;
		const {confirmingRestart, confirmingReboot} = this.state;
		return <RobinCard>
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
					rightToggle={<Toggle
						toggled={remote.overrides.forceEnableEmitters}
						onToggle={
							(e, forceEnableEmitters) => remote.updateOverrides({
								forceEnableEmitters
							})
						}
					/>}
				/>
				<ListItem
					primaryText="Disable device playback"
					secondaryText="Turns off playback through headphone jack"
					rightToggle={<Toggle
						toggled={remote.overrides.disablePlayback}
						onToggle={
							(e, disablePlayback) => remote.updateOverrides({
								disablePlayback
							})
						}
					/>}
				/>
				<ListItem
					primaryText="Disable save"
					secondaryText="Won't save audio recordings or photos"
					rightToggle={<Toggle
						toggled={remote.overrides.disableSave}
						onToggle={
							(e, disableSave) => remote.updateOverrides({
								disableSave
							})
						}
					/>}
				/>
				<Subheader>Here be dragons</Subheader>
				<ListItem
					primaryText="Restart the device server"
					secondaryText={"You'll lose connection" +
					 " for at least a few seconds."
					}
					rightIcon={<RestartIcon/>}
					onTouchTap={() => this.setState({
						confirmingRestart: true,
					})}
				/>
				<ListItem
					primaryText="Restart the device"
					secondaryText="All bets are off"
					rightIcon={<PowerIcon/>}
					onTouchTap={() => this.setState({
						confirmingReboot: true,
					})}
				/>
			</List>
			<ConfirmDialog
				title="Really restart the server?"
				text="This will take a few seconds."
				open={confirmingRestart}
				onConfirm={() => {
					this.setState({confirmingRestart: false});
				}}
				onCancel={() => this.setState({confirmingRestart: false})}
			/>
			<ConfirmDialog
				title="Really restart the device?"
				text="This will probably be annoying."
				open={confirmingReboot}
				onConfirm={() => {
					this.setState({confirmingReboot: false});
				}}
				onCancel={() => this.setState({confirmingReboot: false})}
			/>
		</RobinCard>;
	},
});

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
					getLabel={(n) => <span>Duration: {n}ms</span>}
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
						<span>{
							pulse.type === Pulse.types.CHIRP ?
								"Starting frequency" :
								"Frequency"
						}: {n}kHz</span>
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
						<span>Ending frequency: {n}kHz</span>
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
				rightToggle={<Toggle
					toggled={remote.overrides.wipersEnabled}
					onToggle={
						(e, wipersEnabled) => remote.updateOverrides({
							wipersEnabled,
						})
					}
				/>}
			/>
			{remote.overrides.wipersEnabled && <ListItem disabled>
				<LabeledSlider 
					name="wiper-period"
					getLabel={(n) => 
						<span>Wiper period: {n}s</span>
					}
					onUpdate={(v) => remote.updateOverrides({
						sWipersPeriod: v
					})}
					min={0.1}
					max={10}
					step={0.1}
					value={remote.overrides.sWipersPeriod}
				/>
			</ListItem>}
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