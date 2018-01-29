import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { Label } from 'office-ui-fabric-react/lib/Label';

export default class CheckboxGroup extends Component {
	static propTypes = {
		onValid: PropTypes.func.isRequired,
		candidates: PropTypes.array.isRequired,
		countRequired: PropTypes.number.isRequired,
		postKey: PropTypes.string.isRequired
	};

	constructor(props) {
		super(props);
		this.state = {
			countSelected: 0,
			candidateSelection: {},
			candidates: []
		};
	}

	componentDidMount() {
		let candidateSelection = {};
		this.props.candidates.forEach((candidate) => {
			candidateSelection[candidate.key] = false;
		});
		this.setState({
			candidateSelection,
			candidates: this.props.candidates
		});
	}

	checkChange = (key, ev, checked) => {
		if (checked && this.state.countSelected === this.props.countRequired) {
			this.props.onValid(
				this.props.postKey,
				true,
				this.props.candidates.filter((candidate) => {
					return this.state.candidateSelection[candidate.key];
				})
			);
			return;
		} else if (checked && this.state.countSelected < this.props.countRequired) {
			this.setState(
				{
					candidateSelection: { ...this.state.candidateSelection, [key]: checked },
					countSelected: this.state.countSelected + 1
				},
				(newState) => {
					if (this.state.countSelected === this.props.countRequired) {
						this.props.onValid(
							this.props.postKey,
							true,
							this.props.candidates.filter((candidate) => {
								return this.state.candidateSelection[candidate.key];
							})
						);
					} else {
						this.props.onValid(this.props.postKey, false, []);
					}
				}
			);
		} else if (!checked && this.state.countSelected === 0) {
			this.setState({
				candidateSelection: { ...this.state.candidateSelection, [key]: checked },
				countSelected: 0
			});
			this.props.onValid(this.props.postKey, false, []);
		} else {
			this.setState({
				candidateSelection: { ...this.state.candidateSelection, [key]: checked },
				countSelected: this.state.countSelected - 1
			});
			this.props.onValid(this.props.postKey, false, []);
		}
	};

	render() {
		return (
			<div>
				<Label>Choose {this.props.countRequired} of the following</Label>
				{this.state.candidates.map((candidate) => {
					return (
						<Checkbox
							key={candidate.key}
							label={<div style={{ width: 300 }}>{candidate.Name}</div>}
							checked={this.state.candidateSelection[candidate.key]}
							onChange={this.checkChange.bind(this, candidate.key)}
						/>
					);
				})}
			</div>
		);
	}
}
