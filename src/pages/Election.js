import React, { Component } from 'react';
import { Grid, Col, Row, FormControl, Button, ListGroup, ListGroupItem } from 'react-bootstrap';
import * as firebase from 'firebase';
import { Link } from 'react-router-dom';
import { keys } from 'lodash';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

class Election extends Component {
	constructor(props) {
		super(props);
		this.state = {
			elections: [],
			newElection: ''
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

	addElection = (e) => {
		e.preventDefault();
		const { newElection } = this.state;
		if (newElection === '' || newElection.length > 30) {
			alert('Error! either name is empty or longer than 30 characters!');
			this.setState({ newElection: '' });
			return;
		}
		this.rootElectionRef.child('election-list').push({ name: this.state.newElection });
		this.setState({ newElection: '' });
	};

	render() {
		if (this.props.auth.user.role !== 'Reviewer') {
			return <Redirect to="/" />;
		}
		return (
			<Grid>
				<h2>Election list</h2>
				<Row>
					<ListGroup>
						{this.state.elections.map((election) => (
							<ListGroupItem key={election.key}>
								<Link to={`/reviewer/${election.key}`}>{election.name}</Link>
							</ListGroupItem>
						))}
					</ListGroup>
					<Col>
						<form>
							<FormControl
								type="text"
								value={this.state.newElection}
								placeholder="Enter text"
								onChange={(e) => {
									this.setState({
										newElection: e.target.value
									});
								}}
							/>
							<Button type="submit" onClick={this.addElection} style={{ marginTop: 20 }}>
								Add Election
							</Button>
						</form>
					</Col>
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

export default connect(mapStateToProps)(Election);
