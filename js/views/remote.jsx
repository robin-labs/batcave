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
		return <div>
			<PulseControl {...this.props}/>
			<DeviceInfo {...this.props}/>
		</div>;
	},
});

const DeviceInfo = (props) => <RobinCard>
	<List>
		<Subheader>Device information</Subheader>
		<ListItem
			disabled
			primaryText="Identifier"
			secondaryText="robin-prototype"
		/>
		<ListItem
			disabled
			primaryText="IP address"
			secondaryText="128.30.99.56"
		/>
		<ListItem
			disabled
			primaryText="Bluetooth connections"
			secondaryText="Remote and earbuds are connected"
		/>
		<ListItem
			disabled
			primaryText="Last seen"
			secondaryText={new Date().toString()}
		/>
		<ListItem
			disabled
			primaryText="Device battery"
			secondaryText="Good"
		/>
		<ListItem
			disabled
			primaryText="Emitter battery"
			secondaryText="Low"
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
		remote.pulseHistory.insert(remote.pulse.copy(updated));
	},

	renderInner() {
		const {remote} = this.props;
		const pulse = remote.pulse;
		return <List>
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
				rightToggle={<Toggle/>}
			/>}
			{pulse.type === Pulse.types.CHIRP && <ListItem
				primaryText="Logarithmic"
				secondaryText="Chirp with a logarithmic freqency sweep"
				rightToggle={<Toggle/>}
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
			{this.renderInner()}
			<CardActions 
				style={{
					display: "flex",
					justifyContent: "space-around",
				}}
			>
				<IconButton
					tooltip="undo"
					disabled={remote.pulseHistory.atStart()}
					onTouchTap={() => remote.pulseHistory.undo()}
				><UndoIcon/>
				</IconButton>
				<IconButton 
					disabled={remote.pulseHistory.atEnd()}
					tooltip="redo"
					onTouchTap={() => remote.pulseHistory.redo()}
				>
					<RedoIcon/>
				</IconButton>
				<IconButton tooltip="load..."><BookmarkIcon/></IconButton>
				<IconButton tooltip="bookmark"><StarBorderIcon/></IconButton>
			</CardActions>	
		</RobinCard>;
	}
});

module.exports = {RemoteView, DeviceInfo, PulseControl};