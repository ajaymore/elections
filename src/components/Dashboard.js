import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as firebase from 'firebase';
import { keys } from 'lodash';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';

const flatten = (object) => {
	return Object.keys(object).map((key) => {
		return { ...object[key] };
	});
};

export default class Dashboard extends Component {
	static propTypes = {
		electionId: PropTypes.string.isRequired,
		posts: PropTypes.array.isRequired
	};

	constructor(props) {
		super(props);
		this.state = {
			results: null
		};
	}

	componentDidMount() {
		this.rootRef = firebase.database().ref('elections');
		// Reset Votes
		// this.rootRef.child(this.props.electionId).child('voters').once('value').then((snap) => {
		// 	keys(snap.val()).forEach((key) => {
		// 		this.rootRef.child(this.props.electionId).child('voters').child(key).child('voted').set(null);
		// 	});
		// });
	}

	__displayResults = () => {
		this.rootRef.child(this.props.electionId).child('election-settings').child('posts').once('value', (snap) => {
			const posts = snap.val();
			this.rootRef.child(this.props.electionId).child('candidates').once('value', (snap) => {
				const snapVal = snap.val();
				keys(snapVal).forEach((postKey) => {
					const candidateArray = flatten(snapVal[postKey]);
					const candidateHash = {};
					candidateArray.forEach((candidate) => {
						candidateHash[candidate.key] = { ...candidate, votesReceived: 0, percent: 0 };
					});
					posts[postKey] = { ...posts[postKey], candidates: candidateHash, totalVotes: 0 };
				});
				this.rootRef.child(this.props.electionId).child('votes').once('value').then((snap) => {
					if (!snap.val()) {
						return;
					}
					const totalVotes = flatten(snap.val());
					totalVotes.forEach((voteItem) => {
						flatten(voteItem).forEach((vote) => {
							const postKey = vote.key;
							posts[postKey].totalVotes = posts[postKey].totalVotes + 1;
							vote.selectedValues.forEach((select) => {
								const candidateKey = select.key;
								posts[postKey]['candidates'][candidateKey].votesReceived =
									posts[postKey]['candidates'][candidateKey].votesReceived + 1;
							});
						});
					});
					this.setState({ results: posts });
				});
			});
		});
	};

	render() {
		const { results } = this.state;
		return (
			<div>
				<div className="post-list-results">
					<PrimaryButton onClick={this.__displayResults}>Show Results</PrimaryButton>
					{results ? (
						keys(results).map((postKey) => {
							return (
								<table key={postKey} className="table results-table" style={{ marginTop: 30 }}>
									<tbody>
										<tr>
											<th>{results[postKey].name}</th>
											<th>Votes Received / {results[postKey].totalVotes}</th>
											<th>Percent Votes</th>
										</tr>
										{keys(results[postKey].candidates).map((candidateKey) => {
											return (
												<tr key={candidateKey}>
													<td>{results[postKey].candidates[candidateKey].Name}</td>
													<td>{results[postKey].candidates[candidateKey].votesReceived}</td>
													<td>
														{(results[postKey].candidates[candidateKey].votesReceived /
															results[postKey].totalVotes *
															100).toFixed(2)}
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							);
						})
					) : (
						''
					)}
				</div>
			</div>
		);
	}
}
