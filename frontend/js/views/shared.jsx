const React = require("react");
const {StyleSheet, css} = require("aphrodite");

const Slider = require("material-ui/Slider").default;
const {Card} = require("material-ui/Card");

const LabeledSlider = React.createClass({
	propTypes: {
		getLabel: React.PropTypes.func.isRequired,
		onDragStart: React.PropTypes.func,
		onDragEnd: React.PropTypes.func,
		onUpdate: React.PropTypes.func,
		value: React.PropTypes.number,
	},

	getInitialState() {
		return {
			dragging: false,
			dragValue: this.props.value
		};
	},

	handleDragStart(e) {
		const {onDragStart} = this.props;
		this.setState({
			dragging: true,
			dragValue: this.props.value,
		});
		onDragStart && onDragStart(e);
	},

	handleDragStop(e) {
		const {onDragStop, onUpdate} = this.props;
		this.setState({dragging: false});
		onDragStop && onDragStop(e);
		onUpdate && onUpdate(this.state.dragValue);
	},

	handleChange(e, value) {
		if (this.state.dragging) {
			this.setState({dragValue: value});
		}
	},

	render() {
		const {getLabel, value, onUpdate, ...rest} = this.props;
		const {dragging, dragValue} = this.state;
		const currentValue = dragging ? dragValue : value;
		return <div style={{margin: 0}}>
			<label>
				<span>{getLabel(currentValue)}</span>
				<Slider
					{...rest}
					onDragStart={this.handleDragStart}
					onDragStop={this.handleDragStop}
					onChange={this.handleChange}
					sliderStyle={{margin: 0}}
					value={currentValue}
				/>
			</label>
		</div>;
	}
});

const RobinCard = React.createClass({
	render() {
		return <Card style={{marginTop: 10}} {...this.props}/>;
	}
});

module.exports = {LabeledSlider, RobinCard};