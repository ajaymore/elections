import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import * as firebase from 'firebase';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import App from './pages/App';
import store, { history } from './store';
import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import config from './config'
firebase.initializeApp(config);

ReactDOM.render(
	<Fabric>
		<Provider store={store}>
			<ConnectedRouter history={history}>
				<div>
					<App />
				</div>
			</ConnectedRouter>
		</Provider>
	</Fabric>,
	document.getElementById('root')
);
registerServiceWorker();
