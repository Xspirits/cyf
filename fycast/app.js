
/**
 * Module dependencies.
 */

var express = require('express')
  , passport = require('passport')
  , util = require('util')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , mongoose = require('mongoose')
  , path = require('path')
  , fs = require('fs') 
  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// API Access link for creating client ID and secret:
// https://code.google.com/apis/console/
var GOOGLE_CLIENT_ID = "90650508831.apps.googleusercontent.com";
var GOOGLE_CLIENT_SECRET = "PvPJ5cCT_AgKNU0dDEP98HTb";


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Google profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "//localhost:3434/auth/google/callback"
    //callbackURL: "http://192.168.2.86:3434/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Google profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Google account with a user record in your database,
      // and return that user instead.
      //console.log(profile);
      return done(null, profile);
    });
  }
));


var app = express();

//var Schema = mongoose.Schema
//  , ObjectId = Schema.ObjectId;

//Connect to mongodb server
//mongoose.connect('mongodb://localhost/subtitles');
//Creating Mongoose Schema
/*
var tweetSchema = new Schema({
      idtw                    : Number,
      idstring                : { type: String, unique: true},
      featured                : { type: Boolean, index: true},
      active                  : { type: Boolean, index: true,default: 1},
      deleted                 : { type: Boolean, index: true,default: 0}
});
*/
//Creating Model With Collection Name singles
//var database    = mongoose.model('Sub', tweetSchema);

// configure Express
app.set('port', process.env.PORT || 3434);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(passport.initialize());
  app.use(passport.session());
app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req, res){
  var dir = __dirname + '/public/dl'
  ,   videoList = []
  , regex = {
      mp4 : /.*\.mp4/i
    , HDTV  : /HDTV(.*)+/i
    , t1 : /(,|\\|\[|\])/i
    , t2 : /\.mp4/i
    , episode : /^s?\d{1,2}(e)?\d{1,2}/i
  };

  fs.readdir(dir, function (err, results) { 
    if (err) throw err;

    results.forEach(function (item){
       var video = item.split('/')
       ,  vname = video[video.length-1]
       ,  img;

       regTester(vname);

       if(vname.match(regex.mp4)){
        var title = vname.replace(regex.HDTV,'')
        , title = title.replace(regex.t1 , " ")
        , title = title.replace(regex.t2,'');

        if(title.match(/arrow/gi))
          img = 'arrow'
        else if(title.match(/thrones/ig))
          img = 'got'

            videoList.push({title: title, url: vname, img: img+'.jpg'});
       }

    })
     res.render('index', { title: 'tetot', user: req.user, list: videoList});
  });

});
app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { title: 'tetot', user: req.user });
});

app.get('/auth', function(req, res){
  res.render('auth', { title: 'tetot'});
});

// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback
app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile',
                                            'https://www.googleapis.com/auth/userinfo.email'] }),
  function(req, res){
    // The request will be redirected to Google for authentication, so this
    // function will not be called.
  });

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   welcome page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/welcome' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});



// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent welcome session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   welcome page.


var regTester = function (vTitle, callback){

var episodeReg = /(?!\d)s?(\d{1,2}(?!\d))[x|e|\.|\-]?(\d{1,2}(?!\d))/gi
  , result = episodeReg.exec(vTitle);

console.log(result)
if(result){
    var   subDir =__dirname + '/public/subs'
      , vEpisode = result[2]
      , testoChar = result[1].slice(0, 1)
      , vSeason =  (testoChar == 0)?result[1].charAt( result[1].length-1 ):result[1]
      , vItems = vTitle.split('.')
      , vReg  = new RegExp('('+vItems.join('|')+')', 'gi')
      , subReg  = new RegExp('(?!\d)s?'+vSeason+'[x|e|\.|\-]?'+vEpisode, 'gi');


    console.log('epis: '+ vEpisode);
    console.log('saison: '+ vSeason);

    fs.readdir(subDir, function (err, results) { 
      if (err) throw err;

      console.log(results)

      results.forEach(function (sub){
        var sub = sub.split('/')
          ,  subName = sub[sub.length-1]
          ,  cleanTitle= vTitle.replace('.mp4','')
          ,  cleanSrt= subName.replace('.srt','');

          console.log(cleanTitle +' :: '+ cleanSrt)

        if(cleanSrt != cleanTitle){
            if(subName.match(vReg) && subName.match(subReg)){
                var srtTitle = cleanTitle+'.srt';
                console.log('Encoding '+ subName+ ' => '+srtTitle);
                fs.renameSync(subDir+'/'+ subName+'', subDir+'/'+srtTitle);
            } else
            console.log('No match for the title')
        } else
          console.log(cleanTitle+ ' already has the correct srt');
      })
    });
  }
}

var ensureAuthenticated = function(req, res, next) { 
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/auth');
}