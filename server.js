// Generated by CoffeeScript 1.7.1
(function() {
  var COOKIE_SECRET, CronJob, EXPRESS_SID_KEY, app, appKeys, async, challenge, configDB, cookieParser, db_chat, eApi, ent, express, flash, games, genUID, google, grvtr, http, io, ladder, mailer, mandrill, mandrill_client, moment, mongoose, nodemailer, notifs, passport, path, ping, port, redis, relations, scheduler, server, sessionStore, sio, social, socket, users, xp, _;

  express = require("express");

  http = require("http");

  socket = require("socket.io");

  appKeys = require("./config/auth");

  EXPRESS_SID_KEY = appKeys.express_sid_key;

  COOKIE_SECRET = appKeys.cookie_secret;

  cookieParser = express.cookieParser(COOKIE_SECRET);

  sessionStore = new express.session.MemoryStore();

  app = express();

  server = http.createServer(app);

  io = socket.listen(server);

  io.set("log level", 1);

  redis = require("redis");

  port = process.env.PORT || 8080;

  mongoose = require("mongoose");

  ent = require('ent');

  passport = require("passport");

  path = require("path");

  grvtr = require("grvtr");

  async = require("async");

  moment = require("moment");

  moment = require('moment-timezone');

  mandrill = require('mandrill-api/mandrill');

  nodemailer = require("nodemailer");

  flash = require("connect-flash");

  scheduler = require("node-schedule");

  CronJob = require('cron').CronJob;

  genUID = require("shortid");

  _ = require("underscore");

  configDB = require("./config/database");

  db_chat = require("./app/models/chat");

  moment.utc().format();

  genUID.seed(664);

  mandrill_client = new mandrill.Mandrill(appKeys.mandrill_key);

  mongoose.connect(configDB.url);

  mailer = require("./config/mailer")(mandrill_client, nodemailer, appKeys, moment);

  google = require("./config/google");

  social = require("./config/social");

  sio = require("./app/functions/sio")(io, db_chat, ent, moment);

  notifs = require("./app/functions/notifications")(_, appKeys, social, mailer);

  xp = require("./app/functions/xp")(_, mailer, notifs, sio);

  relations = require("./config/relations")(mailer);

  games = require("./config/game")(ent, moment);

  users = require("./config/users")(_, mailer, appKeys, genUID, social, relations, notifs, moment);

  challenge = require("./config/challenge")(_, mailer, social, moment, genUID, users);

  ladder = require("./config/ladder")(async, scheduler, mailer, _, sio, ladder, moment, social, appKeys, xp, notifs);

  eApi = require('./config/api')(app, appKeys, mailer, _, grvtr, sio, passport, genUID, xp, notifs, moment, challenge, users, relations, games, social, ladder, google);

  require("./config/passport")(passport, challenge, social, appKeys, mailer, genUID, xp, notifs, google);

  app.configure(function() {
    app.use(express.bodyParser());
    app.use(cookieParser);
    app.set("view engine", "ejs");
    app.use(express.session({
      secret: "jekingIsnotHereDamnIt",
      store: sessionStore,
      cookie: {
        httpOnly: true
      },
      key: EXPRESS_SID_KEY
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(express.compress());
    app.use(express["static"](path.join(__dirname, "public"), {
      maxAge: 2592000000
    }));
    app.use(express.logger("dev"));
    app.use(flash());
    return app.use(function(req, res, next) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,X-cyf-AuthToken,content-type');
      res.setHeader('Access-Control-Allow-Credentials', true);
      return next();
    });
  });

  require("./app/routes")(app, appKeys, eApi, db_chat, mailer, _, grvtr, sio, passport, genUID, xp, notifs, moment, challenge, users, relations, games, social, ladder, google);

  require("./app/schedule")(CronJob, scheduler, mailer, _, sio, ladder, moment, social, appKeys, xp, notifs);

  server.listen(port);

  ping = function() {
    sio.alive();
    return setTimeout(ping, 50000);
  };

  ping();

  require("./app/io")(io, db_chat, _, mailer, cookieParser, sessionStore, EXPRESS_SID_KEY, COOKIE_SECRET, sio);

  console.log('===========================================================');

  console.log("I challenge you to watch on port " + port);

  console.log('Current Application time : ' + moment().utc().format());

  console.log('===========================================================');

}).call(this);
