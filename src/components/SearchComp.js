import React, { Component } from 'react';
import * as firebase from 'firebase';
import { Col, Form, FormGroup, FormControl, ControlLabel, Row, Radio } from 'react-bootstrap';
import { values } from 'lodash';

export default class SearchComp extends Component {
	constructor(props) {
		super(props);
		this.state = {
			searchText: '',
			items: [],
			searchableFields: [],
			searchOn: ''
		};
	}
	componentDidMount() {
		const searchableFields = this.props.voterFields.filter((item) => item.isSearchable);
		this.setState({
			searchableFields: searchableFields.map((field, i) => {
				return {
					key: field.key,
					name: field.name,
					checked: i === 0 ? true : false
				};
			}),
			searchOn: searchableFields.length > 0 ? searchableFields[0].name : ''
		});
	}
	componentWillUnmpunt() {}
	componentWillReceiveProps(newProps) {
		const searchableFields = newProps.voterFields.filter((item) => item.isSearchable);
		this.setState({
			searchableFields: searchableFields.map((field, i) => {
				return {
					key: field.key,
					name: field.name,
					checked: i === 0 ? true : false
				};
			}),
			searchOn: searchableFields.length > 0 ? searchableFields[0].name : ''
		});
	}
	firebaseSearch = (value, cb) => {
		if (!value) {
			cb(null);
			return;
		}
		firebase
			.database()
			.ref('elections')
			.child(this.props.electionId)
			.child('voters')
			.orderByChild(this.state.searchOn)
			.startAt(value)
			.endAt(value + '\uf8ff')
			.once('value')
			.then((snap) => {
				cb(snap.val());
			});
	};
	render() {
		const { items } = this.state;
		return (
			<Row>
				<Col sm={6}>
					<Form style={{ marginTop: 20, position: 'relative' }}>
						<FormGroup>
							<FormControl
								type="text"
								value={this.state.searchText}
								placeholder="Search text"
								onChange={(e) => {
									this.setState({ searchText: e.target.value });
									clearTimeout(this.requestTimer);
									this.requestTimer = this.firebaseSearch(e.target.value, (data) => {
										if (data) {
											if (Array.isArray(data)) {
												const items = data.filter((item) => item !== undefined);
												this.setState({ items });
											} else {
												this.setState({ items: values(data) });
											}
										} else {
											this.setState({ items: [] });
										}
									});
								}}
							/>
						</FormGroup>
						<FormGroup>
							<ControlLabel>Search by</ControlLabel>&nbsp;&nbsp;
							{this.state.searchableFields.map((field) => {
								return (
									<Radio
										key={field.key}
										value={field.key}
										checked={field.checked}
										onChange={(e) => {
											let searchOn = this.state.searchOn;
											const searchableFields = this.state.searchableFields.map((field) => {
												if (field.key === e.target.value) {
													searchOn = field.name;
													return { ...field, checked: true };
												} else {
													return { ...field, checked: false };
												}
											});
											this.setState({
												searchableFields,
												searchOn
											});
										}}
										inline
									>
										{field.name}
									</Radio>
								);
							})}
						</FormGroup>
						<div className="search-container">
							{items.map((item, i) => (
								<div
									key={i}
									onClick={() => {
										this.setState({ searchText: '', items: [] });
										this.props.itemSearched(item);
									}}
								>
									<p>{item[this.state.searchOn]}</p>
								</div>
							))}
						</div>
					</Form>
				</Col>
			</Row>
		);
	}
}
