import React, { Component } from 'react';
import * as firebase from 'firebase';
import { Table } from 'react-bootstrap';
import Uploader from './Uploader';

const flatten = (object) => {
	if (!object) return [];
	return Object.keys(object).map((key) => {
		return { ...object[key] };
	});
};

export default class Voters extends Component {
	constructor(props) {
		super(props);
		this.state = {
			voters: [],
			headers: []
		};
	}
	componentDidMount() {
		this.rootElectionRef = firebase.database().ref('elections');
		this.rootElectionRef.child(this.props.electionId).child('voters').once('value').then((snap) => {
			const values = flatten(snap.val());
			if (!snap.val()) return;
			this.setState({ voters: values, headers: Object.keys(values[0]) });
		});
	}
	updateComplete = () => {
		this.rootElectionRef.child(this.props.electionId).child('voters').once('value').then((snap) => {
			const values = snap.val();
			if (!snap.val()) return;
			this.setState({ voters: values, headers: Object.keys(values[0]) });
		});
	};
	render() {
		const { voterFields } = this.props;
		return (
			<div>
				<Uploader
					voterFields={this.props.voterFields}
					updateComplete={this.updateComplete}
					electionId={this.props.electionId}
				/>
				<Table striped bordered condensed hover>
					<thead>
						<tr>
							<th>Sr No</th>
							{voterFields.map((field) => <th key={field.key}>{field.name}</th>)}
						</tr>
					</thead>
					<tbody>
						{this.state.voters.map((field, i) => {
							return (
								<tr key={i}>
									<td>{i + 1}</td>
									{voterFields.map((item) => <td key={item.key}>{field[item.name]}</td>)}
								</tr>
							);
						})}
					</tbody>
				</Table>
			</div>
		);
	}
}
