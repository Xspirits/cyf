

// Imports ======================================================================

var express         = require('express')
, http              = require('http')
, socket            = require('socket.io');

// We define the key of the cookie containing the Express SID
var EXPRESS_SID_KEY = 'chachompcha.sid';
var COOKIE_SECRET   = 'oneDoesNotSimplychompi';

var cookieParser    = express.cookieParser(COOKIE_SECRET);

// Create a new store in memory for the Express sessions
var sessionStore    = new express.session.MemoryStore();

var app             = express();

var server          = http.createServer(app);
var io              = socket.listen(server);
io.set('log level', 1);
var redis           = require('redis');

var port            = process.env.PORT || 8080
, mongoose          = require('mongoose')
, passport          = require('passport')
, path              = require('path')
, moment            = require('moment')
, flash             = require('connect-flash')
, scheduler         = require('node-schedule')
, genUID            = require('shortid')
, _                 = require('underscore');

// Config Import
var configDB        = require('./config/database.js')
, challenge         = require('./config/challenge')
, users             = require('./config/users')
, relations         = require('./config/relations')
, games             = require('./config/game')
, social            = require('./config/social')
, ladder            = require('./config/ladder')
, img               = require('./config/img');

// functions Import
var notifs          = require('./app/functions/notifications.js')
, sio               = require('./app/functions/sio.js')(io)
, xp                = require('./app/functions/xp.js')(sio);

// generate a seed to build our UID (idCools)
genUID.seed(664);

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport, genUID, xp, notifs); // pass passport for configuration

app.configure(function() {

	// set up our express application
	app.use(express.logger('dev')); // log every request to the console
	app.use(express.bodyParser()); // get information from html forms
	app.use(cookieParser); // read cookies (needed for auth)	
	app.set('view engine', 'ejs'); // set up ejs for templating
	app.use(express.session({
		secret: 'jekingIsnotHereDamnIt',
		store: sessionStore,
		cookie: { httpOnly: true},
		key: EXPRESS_SID_KEY
	}));
	// app.use(express.session({ secret: EXPRESS_SID_KEY })); // session secret
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	app.use(express.compress());
	app.use(express.static(path.join(__dirname, 'public'), { maxAge: 2592000000 }));
	app.use(flash()); // use connect-flash for flash messages stored in session
});

// routes ======================================================================
require('./app/routes')(app, _,sio, passport, genUID, xp, notifs, moment, challenge, users, relations, games, social, ladder, img); // load our routes and pass in our app and fully configured passport

// Schedules, for the rankings
require('./app/schedule')(scheduler, ladder);

// launch ======================================================================
server.listen(port);


// sockets awesomization
require('./app/io')(io, cookieParser, sessionStore,EXPRESS_SID_KEY,COOKIE_SECRET, sio);

console.log('I challenge you to watch on port ' + port);