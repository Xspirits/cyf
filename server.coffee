
# Imports       ======================================================================
express         = require("express")
http            = require("http")
socket          = require("socket.io")

appKeys         = require("./config/auth")

# We define the key of the cookie containing the Express SID
EXPRESS_SID_KEY = appKeys.express_sid_key
COOKIE_SECRET   = appKeys.cookie_secret
cookieParser    = express.cookieParser(COOKIE_SECRET)

# Create a new store in memory for the Express sessions
sessionStore    = new express.session.MemoryStore()
app             = express()
server          = http.createServer(app)
io              = socket.listen(server)
io.set "log level", 1
redis           = require("redis")
port            = process.env.PORT or 8080
mongoose        = require("mongoose")
passport        = require("passport")
path            = require("path")
async           = require("async")
moment          = require("moment")
moment          = require('moment-timezone')
mandrill        = require('mandrill-api/mandrill')
nodemailer      = require("nodemailer")
flash           = require("connect-flash")
scheduler       = require("node-schedule")
genUID          = require("shortid")
_               = require("underscore")
configDB        = require("./config/database")

# configuration ===============================================================
moment().tz("Europe/London").format()
genUID.seed 664
mandrill_client = new mandrill.Mandrill(appKeys.mandrill_key);
mongoose.connect configDB.url # connect to our database

# generate a seed to build our UID (idCools)
mailer          = require("./config/mailer")(mandrill_client, nodemailer, appKeys, moment)

# functions Import
sio             = require("./app/functions/sio")(io)
notifs          = require("./app/functions/notifications")(_, mailer)
xp              = require("./app/functions/xp")(_, mailer, notifs, sio)

# Config Import
google          = require("./config/google")
relations       = require("./config/relations")(mailer)
games           = require("./config/game")(moment)
social          = require("./config/social")
challenge       = require("./config/challenge")(_, mailer, moment, genUID)
users           = require("./config/users")(_, mailer, appKeys, social, relations, notifs, moment)
ladder          = require("./config/ladder")(async, scheduler, mailer, _,  sio, ladder, moment, social, appKeys, xp, notifs)

require("./config/passport") passport,challenge, social, appKeys, mailer, genUID, xp, notifs, google # pass passport for configuration

app.configure ->
  
  # set up our express application
  app.use express.bodyParser() # get information from html forms
  app.use cookieParser # read cookies (needed for auth)
  app.set "view engine", "ejs" # set up ejs for templating
  app.use express.session(
    secret: "jekingIsnotHereDamnIt"
    store: sessionStore
    cookie:
      httpOnly: true

    key: EXPRESS_SID_KEY
  )
  
  # app.use(express.session({ secret: EXPRESS_SID_KEY })); // session secret
  app.use passport.initialize()
  app.use passport.session() # persistent login sessions
  app.use express.compress()
  app.use express.static(path.join(__dirname, "public"),
    maxAge: 2592000000
  )
  app.use express.logger("dev") # log every request to the console
  app.use flash() # use connect-flash for flash messages stored in session


# routes ======================================================================
require("./app/routes") app,appKeys, mailer, _, sio, passport, genUID, xp, notifs, moment, challenge, users, relations, games, social, ladder, google 

# Schedules, for the rankings
require("./app/schedule") scheduler, mailer, _,  sio, ladder, moment, social, appKeys, xp, notifs

# launch ======================================================================
server.listen port
ping = ->
  sio.alive()
  return setTimeout ping, 50000
ping()

# sockets awesomization
require("./app/io") io, mailer, cookieParser, sessionStore, EXPRESS_SID_KEY, COOKIE_SECRET, sio
console.log '==========================================================='
console.log "I challenge you to watch on port " + port
console.log 'Current Application time : '+moment().format()
console.log '==========================================================='