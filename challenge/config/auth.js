// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

	'facebookAuth' : {
		'clientID' 		: '624902070914410', // your App ID
		'clientSecret' 	: 'adeff0ed4fa13ed526ba4c133b1eed92', // your App Secret
		'callbackURL' 	: 'http://localhost:8080/auth/facebook/callback'
	},

	'twitterAuth' : {
		'consumerKey' 		: 'X9pznKqQ2wLoXXckDmvU9w',
		'consumerSecret' 	: 'bbDDJ0HPKbQXJsdvPrE69q1IGQUSmpnTx4IoPnO4w',
		'callbackURL' 		: 'http://localhost:8080/auth/twitter/callback'
	},

	'googleAuth' : {
		'clientID' 		: '90650508831.apps.googleusercontent.com',
		'clientSecret' 	: 'PvPJ5cCT_AgKNU0dDEP98HTb',
		'callbackURL' 	: 'http://localhost:8080/auth/google/callback'
	}

};