// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

	'leagueoflegend' : {
		'key' : '2822b5e7-ff7e-4e0d-bf25-880bb335eb83'
	},
	'facebookAuth' : {
		'clientID' 		: '624902070914410', // your App ID
		'clientSecret' 	: 'adeff0ed4fa13ed526ba4c133b1eed92', // your App Secret
		'callbackURL' 	: 'http://192.168.1.2:8080/auth/facebook/callback'
	},

	'twitterAuth' : {
		'consumerKey' 		: 'KqGJkpnwthwuOcrVpLoKA',
		'consumerSecret' 	: 'DmWpNqUNnctc2hoPj36rsWVRsItsKhwhbqfhSmcXOQ',
		'callbackURL' 		: 'http://192.168.1.2:8080/auth/twitter/callback'
	},

	'googleAuth' : {
		'clientID' 		: '90650508831.apps.googleusercontent.com',
		'clientSecret' 	: 'PvPJ5cCT_AgKNU0dDEP98HTb',
		'callbackURL' 	: 'http://192.168.1.2:8080/auth/google/callback'
	}

};