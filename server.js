// server.js

// set up ======================================================================

var express  = require('express')
, http       = require('http');

var app      = express();
var server   = http.createServer(app);
var io       = require('socket.io').listen(server);
var redis    = require('redis');

var port     = process.env.PORT || 8080
, mongoose   = require('mongoose')
, passport   = require('passport')
, path       = require('path')
, moment     = require('moment')
, flash      = require('connect-flash')
, _          = require('underscore');
//var sass       = require('node-sass')

var genUID 	 = require('shortid');
genUID.seed(664);

var configDB = require('./config/database.js')
, challenge  = require('./config/challenge')
, users      = require('./config/users')
, relations  = require('./config/relations')
, games      = require('./config/game')
, social     = require('./config/social');

var notifs   = require('./app/functions/notifications.js')
, xp         = require('./app/functions/xp.js');



// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport, genUID, xp, notifs); // pass passport for configuration

app.configure(function() {

	// set up our express application
	app.use(express.logger('dev')); // log every request to the console
	app.use(express.cookieParser()); // read cookies (needed for auth)
	app.use(express.bodyParser()); // get information from html forms

	app.set('view engine', 'ejs'); // set up ejs for templating
	// required for passport
	app.use(express.session({ secret: 'chachompicha' })); // session secret
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	app.use(express.compress());
	app.use(express.static(path.join(__dirname, 'public')));
	/*app.use(sass.middleware({
			src: __dirname + '/sass', //where the sass files are 
			dest: __dirname + '/public', //where css should go
			debug: true // obvious
		}));*/
	app.use(flash()); // use connect-flash for flash messages stored in session
});

/** 
 * Our redis client which subscribes to channels for updates
 */
 // redisClient = redis.createClient();

//look for connection errors and log
// redisClient.on("error", function (err) {
// 	console.log("error event - " + redisClient.host + ":" + redisClient.port + " - " + err);
// });

/**
 * Notification redis client
 */
 // redisNotifClient = redis.createClient();


// routes ======================================================================
require('./app/routes.js')(app, _, passport, genUID, xp, notifs, moment, challenge, users, relations, games, social); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
server.listen(port);

// SEE https://github.com/aviddiviner/Socket.IO-sessions

/**
 * socket io client, which listens for new websocket connection
 * and then handles various requests
 */
 io.sockets.on('connection', function (socket) {

  //on connect send a welcome message

  //on subscription request joins specified room
  //later messages are broadcasted on the rooms
  socket.on('subscribe', function (data) {
  	socket.join(data.channel);
  });

  socket.on('disconnect', function () {
  	// users.logout();
  	// io.sockets.emit('user disconnected');
  });
});

/**
 * subscribe to redis channel when client in ready
 */
 // redisClient.on('ready', function() {
 // 	redisClient.subscribe('notif');
 // });

/**
 * wait for messages from redis channel, on message
 * send updates on the rooms named after channels. 
 * 
 * This sends updates to users. 
 */
 // redisClient.on("message", function(channel, message){
 // 	var resp = {'text': message, 'channel':channel}
 // 	io.sockets.in(channel).emit('message', resp);
 // });

 // redisNotifClient.publish('notif', 'Generated random no ');

 console.log('I challenge you to watch on port ' + port);