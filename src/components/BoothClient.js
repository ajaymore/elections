import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

export class BoothClient extends Component {
	static propTypes = {
		prop: PropTypes
	};

	render() {
		return <div>BoothClient</div>;
	}
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(BoothClient);
