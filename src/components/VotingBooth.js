import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SearchComp from '../components/SearchComp';
import { Col, Panel } from 'react-bootstrap';
import * as firebase from 'firebase';
import { mapValues } from 'lodash';
const flatten = (object) => {
	return Object.keys(object).map((key) => {
		return { ...object[key], key };
	});
};

const flattenWithoutKey = (object) => {
	return Object.keys(object).map((key) => {
		return { ...object[key] };
	});
};

export default class VotingBooth extends Component {
	static propTypes = {
		booth: PropTypes.object.isRequired,
		voterFields: PropTypes.array.isRequired,
		electionId: PropTypes.string.isRequired
	};

	constructor(props) {
		super(props);
		this.state = {
			message: '',
			voting: '',
			voted: ''
		};
	}

	componentDidMount() {
		this.rootElectionRef = firebase.database().ref('elections');
		this.rootElectionRef
			.child(this.props.electionId)
			.child('booths')
			.child(this.props.booth.key)
			.on('value', (snap) => {
				if (!snap.val()) {
					this.setState({ message: 'Booth is open!' });
				} else {
					this.setState({ voting: snap.val().voting, voted: snap.val().voted });
				}
			});
	}

	itemSearched = async (item) => {
		if (item['voted'] || item['isVoting']) {
			alert('The person has voted already, please select another voter');
			return;
		}
		this.rootElectionRef
			.child(this.props.electionId)
			.child('booths')
			.child(this.props.booth.key)
			.child('voting')
			.set(item);

		const voter = item;
		const electionSettingsRef = this.rootElectionRef.child(this.props.electionId).child('election-settings');
		const candidatesRef = this.rootElectionRef.child(this.props.electionId).child('candidates');

		const candidateSnap = await candidatesRef.once('value');
		const candidates = mapValues(candidateSnap.val(), (item) => {
			return flattenWithoutKey(item);
		});

		const electionSettingsSnap = await electionSettingsRef.once('value');

		const electionSettings = electionSettingsSnap.val();
		const posts = flatten(electionSettings.posts);
		const perms = mapValues(electionSettings.permissionSet, (perm) => {
			if (perm.permissions) {
				return { ...perm, permissions: flatten(perm.permissions) };
			} else {
				return perm;
			}
		});
		const fieldMap = {};
		flatten(electionSettings['voter-fields']).forEach((item) => {
			fieldMap[item.key] = item.name;
		});
		const filteredPosts = posts.filter((post) => {
			if (!perms[post.key].permissions) {
				return true;
			} else {
				const permissions = perms[post.key].permissions;
				let allowed = false;
				for (let i = 0; i < permissions.length; i++) {
					if (voter[fieldMap[permissions[i].field]] === permissions[i].value) {
						allowed = true;
					} else {
						allowed = false;
						break;
					}
				}
				return allowed;
			}
		});
		const voterForm = filteredPosts.map((post) => {
			return {
				...post,
				candidates: candidates[post.key] ? candidates[post.key] : [],
				isValid: false,
				selectedValues: []
			};
		});
		this.rootElectionRef
			.child(this.props.electionId)
			.child('booths')
			.child(this.props.booth.key)
			.child('form')
			.set(voterForm);
		await this.rootElectionRef
			.child(this.props.electionId)
			.child('voters')
			.child(voter.key)
			.child('isVoting')
			.set(true);
	};

	render() {
		const { booth, voterFields, electionId } = this.props;
		const { voted, voting, message } = this.state;
		return (
			<Col sm={6}>
				<Panel header={<h3>{booth.displayName}</h3>} bsStyle="primary">
					{!voting && !voted ? <div>{message}</div> : ''}
					{voted && voted['Name'] ? <div>{voted['Name']} has voted</div> : ''}
					{voting && voting['Name'] ? <div>{voting['Name']} is voting</div> : ''}
					{!this.state.voting ? (
						<SearchComp
							voterFields={voterFields}
							electionId={electionId}
							itemSearched={this.itemSearched}
						/>
					) : (
						''
					)}
				</Panel>
			</Col>
		);
	}
}
