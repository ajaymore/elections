import React, { Component } from 'react';
import * as firebase from 'firebase';
import {
	Col,
	Row,
	ControlLabel,
	FormGroup,
	Panel,
	Glyphicon,
	Checkbox,
	ListGroup,
	ListGroupItem
} from 'react-bootstrap';
import { keys, isEqual } from 'lodash';
import SearchComp from './SearchComp';

class PostCandidate extends Component {
	constructor(props) {
		super(props);
		this.state = {
			candidates: [],
			voterFields: []
		};
	}
	componentDidMount() {
		this.rootElectionRef = firebase.database().ref('elections');
		this.rootElectionRef
			.child(this.props.electionId)
			.child('candidates')
			.child(this.props.post.key)
			.on('value', (snap) => {
				const snapVal = snap.val();
				if (snapVal) {
					this.setState({
						candidates: keys(snapVal).map((id) => {
							return { ...snapVal[id], id };
						})
					});
				} else {
					this.setState({ candidates: [] });
				}
			});
	}
	componentWillUnmpunt() {
		firebase
			.database()
			.ref('elections')
			.child(this.props.electionId)
			.child('candidates')
			.child(this.props.post.key)
			.off();
	}
	itemSearched = (item) => {
		const { permissionSet, post, voterFields } = this.props;
		const requiredPerms = permissionSet[post.key];
		const fieldMap = {};
		voterFields.forEach((item) => {
			fieldMap[item.key] = item.name;
		});
		if (requiredPerms.permissions) {
			const permissions = requiredPerms.permissions;
			let allowed = false;
			for (let i = 0; i < permissions.length; i++) {
				if (item[fieldMap[permissions[i].field]] === permissions[i].value) {
					allowed = true;
				} else {
					allowed = false;
					break;
				}
			}
			if (!allowed) {
				alert('This candidate is not eligible for the post!');
				return;
			}
		}
		const { candidates } = this.state;
		for (let j = 0; j < candidates.length; j++) {
			if (isEqual(candidates[j], { ...item, id: candidates[j].id })) {
				alert('candidate already registered!');
				return;
			}
		}
		this.rootElectionRef.child(this.props.electionId).child('candidates').child(this.props.post.key).push(item);
	};
	removeCandidate = (key) => {
		this.rootElectionRef
			.child(this.props.electionId)
			.child('candidates')
			.child(this.props.post.key)
			.orderByChild('key')
			.equalTo(key)
			.once('value', (snap) => {
				const removeKey = Object.keys(snap.val())[0];
				this.rootElectionRef
					.child(this.props.electionId)
					.child('candidates')
					.child(this.props.post.key)
					.child(removeKey)
					.set(null);
			});
	};
	render() {
		const { post, voterFields, electionId } = this.props;
		return (
			<Panel header={<h3>{post.name}</h3>} bsStyle="primary">
				<ListGroup style={{ height: 250, overflow: 'scroll' }}>
					{this.state.candidates.map((candidate) => (
						<ListGroupItem key={candidate.key} style={{}}>
							{this.props.showFields
								.filter((field) => field.checked)
								.map((field) => <span key={field.key}>{candidate[field.name]}, </span>)}
							<span>{candidate.name}</span>
							<Glyphicon
								onClick={this.removeCandidate.bind(this, candidate.key)}
								glyph="trash"
								style={{
									color: '#d44950',
									fontSize: '0.9em'
								}}
							/>
						</ListGroupItem>
					))}
				</ListGroup>
				<SearchComp voterFields={voterFields} electionId={electionId} itemSearched={this.itemSearched} />
			</Panel>
		);
	}
}

export default class Candidates extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showFields: []
		};
	}
	componentDidMount() {
		const showFields = this.props.voterFields.map((field) => {
			return {
				key: field.key,
				checked: field.isSearchable ? true : false,
				name: field.name
			};
		});
		this.setState({ showFields });
	}
	componentWillUnmpunt() {}
	componentWillReceiveProps(newProps) {
		const showFields = newProps.voterFields.map((field) => {
			return {
				key: field.key,
				checked: field.isSearchable ? true : false,
				name: field.name
			};
		});
		this.setState({ showFields });
	}
	onToggle = (e) => {
		const showFields = this.state.showFields.map((field) => {
			return e.target.value === field.key ? { ...field, checked: !field.checked } : { ...field };
		});
		this.setState({ showFields });
	};
	render() {
		const { posts, voterFields, electionId, permissionSet } = this.props;
		return (
			<Row>
				<Col sm={12}>
					<FormGroup>
						<ControlLabel>Show these fields</ControlLabel>&nbsp;&nbsp;
						{this.state.showFields.map((field) => {
							return (
								<Checkbox
									key={field.key}
									value={field.key}
									checked={field.checked}
									onChange={this.onToggle}
									inline
								>
									{field.name}
								</Checkbox>
							);
						})}
					</FormGroup>
				</Col>
				{posts.map((post) => {
					return (
						<Col key={post.key} sm={6}>
							<PostCandidate
								post={post}
								showFields={this.state.showFields}
								voterFields={voterFields}
								electionId={electionId}
								permissionSet={permissionSet}
							/>
						</Col>
					);
				})}
			</Row>
		);
	}
}
