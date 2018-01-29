import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Redirect } from 'react-router-dom';
import { keys } from 'lodash';
import { Col, Grid, Row } from 'react-bootstrap';
import * as firebase from 'firebase';
import VotingBooth from '../components/VotingBooth';

export class PollOfficerVotingDay extends Component {
	static propTypes = {
		auth: PropTypes.object.isRequired
	};
	constructor(props) {
		super(props);
		this.state = {
			voterFields: [],
			electionName: ''
		};
	}
	componentDidMount() {
		const { id } = this.props.match.params;
		this.rootElectionRef = firebase.database().ref('elections');
		this.rootElectionRef.child('election-list').child(id).once('value').then((snap) => {
			this.setState({ electionName: snap.val().name });
		});
		this.rootElectionRef.child(id).child('election-settings').child('voter-fields').once('value').then((snap) => {
			this.setState({
				voterFields: keys(snap.val()).map((key) => {
					return {
						key,
						name: snap.val()[key].name,
						isSearchable: snap.val()[key].isSearchable
					};
				})
			});
		});
	}
	render() {
		const { user } = this.props.auth;
		const booths = keys(user['associated-booths']).map((key) => {
			return { ...user['associated-booths'][key] };
		});
		if (user.role !== 'poll-officer') {
			return <Redirect to="/" />;
		}
		return (
			<Grid>
				<Row>
					<Col>
						<h2 className="ms-font-su">{this.state.electionName}</h2>
						<br />
					</Col>
					{booths.map((booth) => {
						return (
							<VotingBooth
								key={booth.key}
								booth={booth}
								voterFields={this.state.voterFields}
								electionId={this.props.match.params.id}
								itemSearched={this.itemSearched}
							/>
						);
					})}
				</Row>
			</Grid>
		);
	}
}

const mapStateToProps = (state) => ({ auth: state.auth });

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PollOfficerVotingDay);
