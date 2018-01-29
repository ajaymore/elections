import React, { Component } from 'react';
import * as firebase from 'firebase';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Col, Form, FormControl, ControlLabel, FormGroup, Panel } from 'react-bootstrap';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';

export default class AddPost extends Component {
	constructor(props) {
		super(props);
		this.state = {
			newPost: '',
			newPostNum: 1
		};
	}
	componentDidMount() {
		this.rootElectionRef = firebase.database().ref('elections');
	}
	componentWillUnmount() {
		this.rootElectionRef.child(this.props.electionId).child('election-settings').off();
	}
	addPost = (e) => {
		e.preventDefault();
		const { newPost, newPostNum } = this.state;
		if ((newPost === '' || newPost.length > 20) && !isNaN(parseInt(newPost, 10))) {
			alert('Error! either post name is empty or longer than 20 characters!');
			this.setState({ newPost: '' });
			return;
		}
		this.rootElectionRef
			.child(this.props.electionId)
			.child('election-settings')
			.child('posts')
			.push({ name: newPost, postsCount: newPostNum });
		this.setState({ newPost: '' });
	};
	postRemove = (key) => {
		this.rootElectionRef
			.child(this.props.electionId)
			.child('election-settings')
			.child('posts')
			.child(key)
			.set(null);
	};
	render() {
		return (
			<Col sm={6}>
				<Panel header={<h3>Elections Posts</h3>} bsStyle="primary">
					{this.props.posts.map((post) => (
						<h3
							key={post.key}
							style={{
								display: 'inline-block',
								margin: '0 10px 10px 0',
								position: 'relative',
								fontSize: '1.5em'
							}}
						>
							<Label style={{ marginRight: 20 }}>
								<span>{post.name}&nbsp;</span>
								<span style={{ color: 'rgb(0, 120, 215)' }}>({post.postsCount})&nbsp;&nbsp;</span>
								<i
									onClick={this.postRemove.bind(this, post.key)}
									className="ms-Icon ms-Icon--ErrorBadge"
									aria-hidden="true"
									style={{
										color: 'red',
										position: 'absolute',
										right: 6,
										top: 6
									}}
								/>
							</Label>
						</h3>
					))}
					<Form style={{ marginTop: 20 }}>
						<Col sm={10}>
							<FormGroup>
								<ControlLabel>Post Name</ControlLabel>
								<FormControl
									type="text"
									value={this.state.newPost}
									placeholder="Enter text"
									onChange={(e) => {
										this.setState({
											newPost: e.target.value
										});
									}}
								/>
							</FormGroup>
						</Col>
						<Col sm={2}>
							<FormGroup>
								<ControlLabel>Number </ControlLabel>
								<FormControl
									type="number"
									value={this.state.newPostNum}
									placeholder="Enter text"
									onChange={(e) => {
										this.setState({
											newPostNum: e.target.value
										});
									}}
								/>
							</FormGroup>
						</Col>
						<DefaultButton type="submit" onClick={this.addPost} style={{ margin: 10 }}>
							Add A Post
						</DefaultButton>
					</Form>
				</Panel>
			</Col>
		);
	}
}
