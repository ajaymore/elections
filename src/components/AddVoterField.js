import React, { Component } from 'react';
import * as firebase from 'firebase';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Col, Form, FormControl, ControlLabel, FormGroup, Panel, Glyphicon, Checkbox } from 'react-bootstrap';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';

export default class AddVoterField extends Component {
	constructor(props) {
		super(props);
		this.state = {
			newVoterField: '',
			isSearchable: false
		};
	}
	componentDidMount() {
		this.rootElectionRef = firebase.database().ref('elections');
	}
	componentWillUnmount() {
		this.rootElectionRef.child(this.props.electionId).child('election-settings').off();
	}
	addVoterField = (e) => {
		e.preventDefault();
		const { newVoterField } = this.state;
		if (newVoterField === '' || newVoterField.length > 20) {
			alert('Error! either post name is empty or longer than 20 characters!');
			this.setState({ newVoterField: '' });
			return;
		}
		this.rootElectionRef
			.child(this.props.electionId)
			.child('election-settings')
			.child('voter-fields')
			.push({ name: this.state.newVoterField, isSearchable: this.state.isSearchable });
		this.setState({ newVoterField: '', isSearchable: false });
	};
	voterFieldRemove = (key) => {
		this.rootElectionRef
			.child(this.props.electionId)
			.child('election-settings')
			.child('voter-fields')
			.child(key)
			.set(null);
	};
	render() {
		return (
			<Col sm={6}>
				<Panel header={<h3>Voter Fields</h3>} bsStyle="primary">
					{this.props.voterFields.map((voterField) => (
						<h3
							key={voterField.key}
							style={{
								display: 'inline-block',
								margin: '0 10px 10px 0',
								position: 'relative',
								fontSize: '1.5em'
							}}
						>
							<Label style={{ paddingRight: 30 }}>
								<span>{voterField.name}</span>
								<Glyphicon
									onClick={this.voterFieldRemove.bind(this, voterField.key)}
									glyph="trash"
									style={{
										position: 'absolute',
										right: 5,
										top: 6,
										color: '#d44950',
										fontSize: '0.9em'
									}}
								/>
							</Label>
						</h3>
					))}
					<Form style={{ marginTop: 20 }}>
						<FormGroup>
							<ControlLabel>Voter Field Name</ControlLabel>
							<FormControl
								type="text"
								value={this.state.newVoterField}
								placeholder="Enter text"
								onChange={(e) => {
									this.setState({
										newVoterField: e.target.value
									});
								}}
							/>
						</FormGroup>
						<Checkbox
							checked={this.state.isSearchable}
							onChange={() => {
								this.setState({ isSearchable: !this.state.isSearchable });
							}}
						>
							Is Searchable?
						</Checkbox>
						<DefaultButton type="submit" onClick={this.addVoterField} style={{ margin: 10 }}>
							Add A Voter Field
						</DefaultButton>
					</Form>
				</Panel>
			</Col>
		);
	}
}
