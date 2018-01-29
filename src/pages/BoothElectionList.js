import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, Row, ListGroup, ListGroupItem } from 'react-bootstrap';
import { Link, Redirect } from 'react-router-dom';
import { keys } from 'lodash';
import * as firebase from 'firebase';

class BoothElectionList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			elections: []
		};
	}

	componentDidMount() {
		this.rootElectionRef = firebase.database().ref('elections');
		this.rootElectionRef.child('election-list').on('value', (snap) => {
			if (snap.val()) {
				const elections = snap.val();
				this.setState({
					elections: keys(elections).map((key) => {
						return { key, name: elections[key].name };
					})
				});
			}
		});
	}

	componentWillUnmount() {
		this.rootElectionRef.child('election-list').off();
	}
	render() {
		if (this.props.auth.user.role !== 'booth') {
			return <Redirect to="/" />;
		}
		return (
			<Grid>
				<h2>Election list</h2>
				<Row>
					<ListGroup>
						{this.state.elections.map((election) => (
							<ListGroupItem key={election.key}>
								<Link to={`/booth/${election.key}`}>{election.name}</Link>
							</ListGroupItem>
						))}
					</ListGroup>
				</Row>
			</Grid>
		);
	}
}

const mapStateToProps = (state, ownProps) => {
	return {
		auth: state.auth
	};
};

export default connect(mapStateToProps)(BoothElectionList);
