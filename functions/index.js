const functions = require('firebase-functions');
var { reduce } = require('lodash');
var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const express = require('express');
const cookieParser = require('cookie-parser')();
const cors = require('cors')({ origin: true });
const app = express();

var SCOPES = [ 'https://www.googleapis.com/auth/spreadsheets.readonly' ];
var TOKEN_DIR = './credentials/';
var TOKEN_PATH = TOKEN_DIR + 'token.json';
var { generatePushID } = require('./utils');

const validateFirebaseIdToken = (req, res, next) => {
	if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) && !req.cookies.__session) {
		console.error(
			'No Firebase ID token was passed as a Bearer token in the Authorization header.',
			'Make sure you authorize your request by providing the following HTTP header:',
			'Authorization: Bearer <Firebase ID Token>',
			'or by passing a "__session" cookie.'
		);
		res.status(403).send('Unauthorized');
		return;
	}

	let idToken;
	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
		idToken = req.headers.authorization.split('Bearer ')[1];
	} else {
		console.log('Found "__session" cookie');
		// Read the ID Token from cookie.
		idToken = req.cookies.__session;
	}
	admin
		.auth()
		.verifyIdToken(idToken)
		.then((decodedIdToken) => {
			console.log(decodedIdToken);
			req.user = decodedIdToken;
			next();
		})
		.catch((error) => {
			console.error('Error while verifying Firebase ID token:', error);
			res.status(403).send('Unauthorized');
		});
};

app.use(cors);
app.use(cookieParser);
app.use(validateFirebaseIdToken);
app.post('/user', (req, res) => {
	const { email, displayName, role, password } = req.body;
	admin
		.auth()
		.createUser({
			email,
			emailVerified: false,
			password,
			displayName,
			disabled: false
		})
		.then(function(userRecord) {
			admin
				.database()
				.ref('elections')
				.child('users')
				.child(userRecord.uid)
				.set({
					email,
					displayName,
					role
				})
				.then(() => {
					res.send({ message: 'Successfully created new user', uid: userRecord.uid });
				});
		})
		.catch(function(error) {
			console.log('Error creating new user:', error);
			res.status(400).send('Error!');
		});
});
app.delete('/user/:uid', (req, res) => {
	const { uid } = req.params;
	admin
		.auth()
		.deleteUser(uid)
		.then(function() {
			admin.database().ref('elections').child('users').child(uid).set(null);
			res.send({ message: 'Delete Successful!' });
		})
		.catch(function(error) {
			console.log('Error deleting user:', error);
			res.status(400).send('Error!');
		});
});
app.put('/change-password/:uid', (req, res) => {
	const { newPassword } = req.body;
	const { uid } = req.params;
	admin
		.auth()
		.updateUser(uid, {
			password: newPassword
		})
		.then(function(userRecord) {
			res.send({ message: 'Password changed successfully' });
		})
		.catch(function(error) {
			console.log('Error updating user:', error);
			res.status(400).send('Error!');
		});
});
app.post('/update-voter-list', (req, res) => {
	fs.readFile('client_secret.json', function processClientSecrets(err, content) {
		if (err) {
			console.log('Error loading client secret file: ' + err);
			return;
		}
		authorize(JSON.parse(content), updateList, req, res);
	});
});

exports.app = functions.https.onRequest(app);

function authorize(credentials, callback, req, res) {
	var clientSecret = credentials.installed.client_secret;
	var clientId = credentials.installed.client_id;
	var redirectUrl = credentials.installed.redirect_uris[0];
	var auth = new googleAuth();
	var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

	fs.readFile(TOKEN_PATH, function(err, token) {
		if (err) {
			console.log(err);
			console.log('token is dead');
			res.status(400).send('Error!');
		} else {
			oauth2Client.credentials = JSON.parse(token);
			console.log('authorized!!');
			callback(oauth2Client, req, res);
		}
	});
}

function updateList(auth, req, res) {
	var sheets = google.sheets('v4');
	const { sheetId, electionId } = req.body;
	console.log(sheetId, electionId);
	sheets.spreadsheets.values.get(
		{
			auth: auth,
			spreadsheetId: sheetId,
			range: 'voters'
		},
		function(err, response) {
			if (err) {
				console.log('The API returned an error: ' + err);
				return;
			}
			var rows = response.values;
			console.log(rows.length)
			const header = rows[0];
			const headerLessData = rows.filter((row, i) => {
				return i !== 0;
			});
			const dataObject = {};
			headerLessData.forEach((row) => {
				const key = generatePushID();
				dataObject[key] = reduce(
					row,
					(voter, voterItem, i) => {
						voter[header[i]] = voterItem;
						return voter;
					},
					{ key }
				);
			});
			if (rows.length == 0) {
				console.log('No data found.');
			} else {
				admin.database().ref('elections').child(electionId).child('voters').set(dataObject);
				res.send({ status: 'Data is updated' });
			}
		}
	);
}

exports.createPost = functions.database
	.ref('/elections/{electionId}/election-settings/posts/{pushId}')
	.onCreate((event) => {
		console.log(event.params.electionId);
		console.log(event.params.pushId);
		admin
			.database()
			.ref('elections')
			.child(event.params.electionId)
			.child('election-settings')
			.child('permissionSet')
			.child(event.params.pushId)
			.set({ permissions: false });
	});

exports.removePost = functions.database
	.ref('/elections/{electionId}/election-settings/posts/{pushId}')
	.onDelete((event) => {
		admin
			.database()
			.ref('elections')
			.child(event.params.electionId)
			.child('election-settings')
			.child('permissionSet')
			.child(event.params.pushId)
			.set(null);
	});
