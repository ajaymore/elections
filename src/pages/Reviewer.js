import React from 'react';
import Settings from '../components/Settings';
import Voters from '../components/Voters';
import { Grid } from 'react-bootstrap';
import * as firebase from 'firebase';
import { keys } from 'lodash';
import { logout } from '../modules/auth';
import { connect } from 'react-redux';
import Candidates from '../components/Candidates';
import Booths from '../components/Booths';
import { PivotItem, Pivot } from 'office-ui-fabric-react/lib/Pivot';
import { Redirect } from 'react-router-dom';
import Footer from '../components/Footer';
import Dashboard from '../components/Dashboard';

class Reviewer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			electionName: '',
			posts: [],
			voterFields: [],
			status: '',
			selectedKey: '7'
		};
	}

	componentDidMount() {
		const { id } = this.props.match.params;
		this.rootElectionRef = firebase.database().ref('elections');
		this.rootElectionRef.child('election-list').child(id).once('value').then((snap) => {
			this.setState({ electionName: snap.val().name });
		});
		this.rootElectionRef.child(id).child('election-settings').on('value', (snap) => {
			if (snap.val()) {
				const electionSettings = snap.val();
				this.setState({
					posts: keys(electionSettings['posts']).map((key) => {
						return {
							key,
							name: electionSettings['posts'][key].name,
							postsCount: electionSettings['posts'][key].postsCount
						};
					}),
					voterFields: keys(electionSettings['voter-fields']).map((key) => {
						return {
							key,
							name: electionSettings['voter-fields'][key].name,
							isSearchable: electionSettings['voter-fields'][key].isSearchable
						};
					}),
					permissionSet: electionSettings.permissionSet
				});
			}
		});
	}

	componentWillUnmount() {
		this.rootElectionRef.child(this.props.match.params.id).child('election-settings').off();
	}

	render() {
		const { id } = this.props.match.params;
		const { posts, voterFields, permissionSet } = this.state;
		if (!this.props.auth.user || this.props.auth.user.role !== 'Reviewer') {
			return <Redirect to="/" />;
		}
		return (
			<Grid>
				<h2 className="ms-font-su">{this.state.electionName}</h2>
				<br />
				<Pivot
					selectedKey={this.state.selectedKey}
					onLinkClick={(e) => {
						this.setState({ selectedKey: e.props.itemKey });
					}}
				>
					<PivotItem linkText="Home" itemIcon="Home" itemKey="0">
						<Redirect to="/reviewer" />
					</PivotItem>
					<PivotItem linkText="Dashboard" itemIcon="PostUpdate" itemKey="7">
						<br />
						<Dashboard electionId={id} posts={posts} />
					</PivotItem>
					<PivotItem linkText="Settings" itemIcon="Settings" itemKey="1">
						<br />
						<Settings
							electionId={id}
							posts={posts}
							voterFields={voterFields}
							permissionSet={permissionSet}
						/>
					</PivotItem>
					<PivotItem linkText="Voters" itemIcon="Family" itemKey="3">
						<br />
						<Voters electionId={id} voterFields={voterFields} />
					</PivotItem>
					<PivotItem linkText="Candidates" itemIcon="AddFriend" itemKey="5">
						<br />
						<Candidates
							posts={posts}
							voterFields={voterFields}
							electionId={id}
							permissionSet={permissionSet}
						/>
					</PivotItem>
					<PivotItem linkText="Booths" itemIcon="Room" itemKey="4">
						<br />
						<Booths electionId={id} />
					</PivotItem>
				</Pivot>
				<Footer />
			</Grid>
		);
	}
}

const mapStateToProps = (state, ownProps) => {
	return {
		auth: state.auth
	};
};

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		logout: () => {
			dispatch(logout());
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Reviewer);
