import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ChoiceGroup } from 'office-ui-fabric-react/lib/ChoiceGroup';

export default class RadioGroup extends Component {
	static propTypes = {
		onValid: PropTypes.func.isRequired,
		candidates: PropTypes.array.isRequired,
		postKey: PropTypes.string.isRequired
	};

	constructor(props) {
		super(props);
		this.state = {
			candidateSelection: {},
			candidates: [],
			selectedKey: ''
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

	_onChange = (e, value) => {
		this.setState({
			selectedKey: value.key
		});
		if (value.key) {
			this.props.onValid(
				this.props.postKey,
				true,
				this.props.candidates.filter((candidate) => {
					return candidate.key === value.key;
				})
			);
		}
	};

	render() {
		const options = this.state.candidates.map((candidate) => {
			return { key: candidate.key, text: candidate.Name };
		});
		return (
			<ChoiceGroup
				selectedKey={this.state.selectedKey}
				label="Choose 1 of the following"
				options={options}
				onChange={this._onChange}
				required={true}
			/>
		);
	}
}
