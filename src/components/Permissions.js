import React, { Component } from 'react';
import { Row } from 'react-bootstrap';
import PermissionBlock from './PermissionBlock';

export default class Permissions extends Component {
	constructor(props) {
		super(props);
		this.state = {
			permissionSet: {}
		};
	}
	componentDidMount() {}
	render() {
		const { posts, voterFields, permissionSet, electionId } = this.props;
		return (
			<div>
				<Row>
					{posts.map((post) => {
						return (
							<PermissionBlock
								key={post.key}
								post={post}
								permissions={permissionSet[post.key] ? permissionSet[post.key].permissions : []}
								voterFields={voterFields}
								electionId={electionId}
							/>
						);
					})}
				</Row>
			</div>
		);
	}
}
