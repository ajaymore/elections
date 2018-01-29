import React, { Component } from 'react';
import * as firebase from 'firebase';
import { Col, Panel, Button, FormGroup, FormControl, Glyphicon } from 'react-bootstrap';

export default class PermissionBlock extends Component {
	constructor(props) {
		super(props);
		this.state = {
			permissions: this.props.permissions || [],
			saved: false
		};
	}

	componentDidMount() {
		this.rootElectionRef = firebase.database().ref('elections');
	}
	addPermissionItem = () => {
		this.setState({
			permissions: [ ...this.state.permissions, { field: '', value: '' } ]
		});
	};
	removePermissionItem = (i) => {
		let permissions = this.state.permissions;
		permissions.splice(i, 1);
		this.setState({ permissions });
	};
	savePermissionItem = () => {
		for (let i = 0; i < this.state.permissions.length; i++) {
			if (!this.state.permissions[i].field | !this.state.permissions[i].value) {
				alert('Please fill in appropriate values');
				return;
			}
		}
		this.rootElectionRef
			.child(this.props.electionId)
			.child('election-settings')
			.child('permissionSet')
			.child(this.props.post.key)
			.child('permissions')
			.set(this.state.permissions.length === 0 ? false : this.state.permissions)
			.then(() => {
				this.setState({ saved: true });
				setTimeout(() => {
					this.setState({ saved: false });
				}, 500);
			});
	};
	render() {
		const { post } = this.props;
		const { permissions } = this.state;
		return (
			<Col key={post.key} sm={4}>
				<Panel header={<h3>{post.name}</h3>} bsStyle="primary">
					{permissions.length === 0 ? <p>Anyone can vote.</p> : ''}
					{permissions.map((permItem, i) => {
						return (
							<Col sm={12} key={i}>
								<Col sm={6}>
									<FormGroup controlId="formControlsSelect">
										<FormControl
											componentClass="select"
											placeholder="select"
											value={this.state.permissions[i].field}
											onChange={(e) => {
												let permissions = this.state.permissions;
												permissions[i].field = e.target.value;
												this.setState({ permissions });
											}}
										>
											<option value="select">Voter Field</option>
											{this.props.voterFields.map((field) => {
												return (
													<option key={field.key} value={field.key}>
														{field.name}
													</option>
												);
											})}
										</FormControl>
									</FormGroup>
								</Col>
								<Col sm={6} style={{ position: 'relative' }}>
									<span style={{ position: 'absolute', top: 10 }}>=</span>
									<Glyphicon
										onClick={this.removePermissionItem.bind(this, i)}
										glyph="trash"
										style={{
											position: 'absolute',
											right: -10,
											top: 10,
											color: '#d44950',
											fontSize: '0.9em'
										}}
									/>
									<FormGroup style={{ marginLeft: 25 }}>
										<FormControl
											type="text"
											value={this.state.permissions[i].value}
											placeholder="Value"
											onChange={(e) => {
												let permissions = this.state.permissions;
												permissions[i].value = e.target.value;
												this.setState({ permissions });
											}}
										/>
									</FormGroup>
								</Col>
							</Col>
						);
					})}
					<Button bsStyle="link" onClick={this.addPermissionItem}>
						Add Permission
					</Button>
					<Button bsStyle="link" onClick={this.savePermissionItem}>
						Save
					</Button>
					{this.state.saved ? '  Saved!!' : ''}
				</Panel>
			</Col>
		);
	}
}
