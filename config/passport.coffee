# load all the things we need
LocalStrategy = require("passport-local").Strategy
FacebookStrategy = require("passport-facebook").Strategy
TwitterStrategy = require("passport-twitter").Strategy
GoogleStrategy = require("passport-google-oauth").OAuth2Strategy

# load up the user model & challenge
User = require("../app/models/user")
grvtr = require('grvtr')

# load the auth variables
module.exports = (passport,challenge, social, appKeys, mailer, genUID, xp, notifs,shortUrl) ->
  
  # =========================================================================
  # passport session setup ==================================================
  # =========================================================================
  # required for persistent login sessions
  # passport needs ability to serialize and unserialize users out of session
  
  # used to serialize the user for the session
  passport.serializeUser (user, done) ->
    done null, user.id
    return

  
  # used to deserialize the user
  passport.deserializeUser (id, done) ->
    User.findById id, (err, user) ->
      done err, user
      return

    return

  
  # =========================================================================
  # LOCAL LOGIN =============================================================
  # =========================================================================
  passport.use "local-login", new LocalStrategy(
    
    # by default, local strategy uses username and password, we will override with email
    usernameField: "email"
    passwordField: "password"
    passReqToCallback: true # allows us to pass in the req from our route (lets us check if a user is logged in or not)
  , (req, email, password, done) ->
    # asynchronous
    process.nextTick ->
      opts = [{ path: 'friends.idUser'},{ path: 'games._idGame'}]
      User.findOne({"local.email": email}).populate(opts).exec (err, userfound) ->        
        # if there are any errors, return the error
        return done(err) if err
        # if no user is found, return the message
        return done(null, false, req.flash("loginMessage", "No user found."))  unless userfound
        if !userfound.validPassword password
          return done null, false, req.flash("loginMessage", "Oops! Wrong password.")

        # all is well, return user
        else
          if appKeys.app_config.email_confirm          
            unless userfound.verified
              return done null, false, req.flash("loginMessage", "Please confirm your email adress before entering the arena.")
          console.log 'logged'
          req.session.isLogged = true
          req.session.user = userfound
          userfound.isOnline = true
          userfound.save (err) ->
            mailer.cLog 'Error at '+__filename,err if err
            notifs.login userfound
            done null, userfound
  )
  
  # =========================================================================
  # LOCAL SIGNUP ============================================================
  # =========================================================================
  passport.use "local-signup", new LocalStrategy(
    
    # by default, local strategy uses username and password, we will override with email
    usernameField: "email"
    passwordField: "password"
    passReqToCallback: true # allows us to pass in the req from our route (lets us check if a user is logged in or not)
  , (req, email, password, done) ->
    uID = genUID.generate().substr(-6)
    uIDHash = genUID.generate().substr(-12)
    
    # asynchronous
    process.nextTick ->
      
      # check if the user is already logged ina
      unless req.user

        User.findOne
          "local.email": email
        , (err, user) ->
          
          # if there are any errors, return the error
          return done(err)  if err
          
          # check to see if theres already a user with that email
          if user
            done null, false, req.flash("signupMessage", "That email is already taken.")
          else
            # create the user
            newUser = new User()
            newUser.idCool = uID
            newUser.userRand = [
              Math.random()
              0
            ]
            newUser.verfiy_hash = uIDHash
            newUser.verified = true if appKeys.app_config.email_confirm == false
            newUser.local.email = email
            newUser.local.password = newUser.generateHash(password)
            newUser.local.friends = []
            newUser.local.pseudo = req.body.pseudo
            newUser.local.sentRequests = []
            newUser.local.pendingRequests = []
            newUser.local.followers = []

            grvtr.create email,
              size: 150 # 1 - 2048px
              defaultImage: "identicon" # 'identicon', 'monsterid', 'wavatar', 'retro', 'blank'
              rating: "g" # 'pg', 'r', 'x'
            , (gravatarUrl) ->
              newUser.icon = gravatarUrl
              newUser.save (err, user) ->
                mailer.cLog 'Error at '+__filename,err if err
                xp.xpReward user, "user.register"

                # send an email confirmation link
                if appKeys.app_config.email_confirm == false
                  console.log "pass false wtf"
                  req.session.user = user
                  req.session.isLogged = true
                  req.session.newUser = true
                  done null, newUser
                else
                  console.log "pass correctement"
                  mailer.accountConfirm user, (returned) ->
                    done null, newUser
      else
        user = req.user
        user.local.email = email
        user.local.password = user.generateHash(password)
        user.local.pseudo = req.body.pseudo
        user.save (err) ->
          mailer.cLog 'Error at '+__filename,err if err
          done null, user
  )
  
  # =========================================================================
  # FACEBOOK ================================================================
  # =========================================================================
  passport.use new FacebookStrategy(
    clientID: appKeys.facebookAuth.clientID
    clientSecret: appKeys.facebookAuth.clientSecret
    callbackURL: appKeys.facebookAuth.callbackURL
    passReqToCallback: true # allows us to pass in the req from our route (lets us check if a user is logged in or not)
  , (req, token, refreshToken, profile, done) ->
    
    # asynchronous
    process.nextTick ->
      console.log token
      console.log refreshToken
      console.log profile
      # check if the user is already logged in
      unless req.user
        User.findOne
          "facebook.id": profile.id
        , (err, user) ->
          return done(err)  if err
          if user
            
            # if there is a user id already but no token (user was linked at one point and then removed)
            unless user.facebook.token
              user.facebook.token = token
              user.facebook.name = profile.name.givenName + " " + profile.name.familyName
              user.facebook.email = profile.emails[0].value
              user.save (err) ->
                mailer.cLog 'Error at '+__filename,err if err
                done null, user

            done null, user # user found, return that user
          else
            
            # if there is no user, create them
            newUser = new User()
            newUser.facebook.id = profile.id
            newUser.facebook.token = token
            newUser.facebook.name = profile.name.givenName + " " + profile.name.familyName
            newUser.facebook.email = profile.emails[0].value
            newUser.save (err) ->
              mailer.cLog 'Error at '+__filename,err if err
              done null, newUser

          return

      else
        
        # user already exists and is logged in, we have to link accounts
        user = req.user # pull the user out of the session
        user.facebook.id = profile.id
        user.facebook.token = token
        user.facebook.name = profile.name.givenName + " " + profile.name.familyName
        user.facebook.email = profile.emails[0].value
        user.save (err) ->
          mailer.cLog 'Error at '+__filename,err if err
          done null, user
  )
  
  # =========================================================================
  # TWITTER =================================================================
  # =========================================================================
  passport.use new TwitterStrategy(
    consumerKey: appKeys.twitterAuth.consumerKey
    consumerSecret: appKeys.twitterAuth.consumerSecret
    callbackURL: appKeys.twitterAuth.callbackURL
    passReqToCallback: true # allows us to pass in the req from our route (lets us check if a user is logged in or not)
  , (req, token, tokenSecret, profile, done) ->
    
    # asynchronous
    process.nextTick ->
      
      # check if the user is already logged in
      unless req.user
        User.findOne
          "twitter.id": profile.id
        , (err, user) ->
          return done(err)  if err
          if user
            
            # if there is a user id already but no token (user was linked at one point and then removed)
            user.twitter.token = token
            user.twitter.tokenSecret = tokenSecret
            user.twitter.username = profile.username
            user.twitter.displayName = profile.displayName
            user.save (err) ->
              throw err if err
              profileUrl = appKeys.cyf.app_domain + '/'+ user.idCool
              shortUrl.googleUrl profileUrl, (shortened) ->
                console.log "New twitter linked %s to %s", profileUrl, shortened
                if appKeys.app_config.twitterPushNews
                  # Lets push on our timeline to let players now about the new member!             
                  twitt = "Welcome @"+user.twitter.username+" ("+shortened+") on Challenge your Friends! You are "+user.level+", a journey awaits you! @cyf_app #challenge"
                  social.postTwitter false, twitt, (data) ->
                    done null, user
          else
            # NOT OPERATING ANYMORE. Users Must create a local user. 
            # if there is no user, create them 
            newUser = new User()
            newUser.twitter.id = profile.id
            newUser.twitter.token = token
            newUser.twitter.tokenSecret = tokenSecret
            newUser.twitter.username = profile.username
            newUser.twitter.displayName = profile.displayName
            newUser.save (err) ->
              mailer.cLog 'Error at '+__filename,err if err
              done null, newUser

          return

      
      #
      else
        
        # user already exists and is logged in, we have to link accounts
        user = req.user # pull the user out of the session
        user.twitter.id = profile.id
        user.twitter.token = token
        user.twitter.tokenSecret = tokenSecret
        user.twitter.username = profile.username
        user.twitter.displayName = profile.displayName
        user.save (err) ->
          mailer.cLog 'Error at '+__filename,err if err
          console.log user
          done null, user

      return

    return
  )
  
  # =========================================================================
  # GOOGLE ==================================================================
  # =========================================================================
  passport.use new GoogleStrategy(
    clientID: appKeys.googleAuth.clientID
    clientSecret: appKeys.googleAuth.clientSecret
    callbackURL: appKeys.googleAuth.callbackURL
    passReqToCallback: true # allows us to pass in the req from our route (lets us check if a user is logged in or not)
  , (req, token, refreshToken, profile, done) ->
    
    # asynchronous
    process.nextTick ->
      
      # check if the user is already logged in
      unless req.user
        User.findOne
          "google.id": profile.id
        , (err, user) ->
          return done(err)  if err
          if user
            
            # if there is a user id already but no token (user was linked at one point and then removed)
            unless user.google.token
              user.google.token = token
              user.google.name = profile.displayName
              user.google.email = profile.emails[0].value # pull the first email
              user.save (err) ->
                mailer.cLog 'Error at '+__filename,err if err
                done null, user

            done null, user
          else
            newUser = new User()
            newUser.google.id = profile.id
            newUser.google.token = token
            newUser.google.name = profile.displayName
            newUser.google.email = profile.emails[0].value # pull the first email
            newUser.save (err) ->
              mailer.cLog 'Error at '+__filename,err if err
              done null, newUser

          return

      else
        
        # user already exists and is logged in, we have to link accounts
        user = req.user # pull the user out of the session
        user.google.id = profile.id
        user.google.token = token
        user.google.name = profile.displayName
        user.google.email = profile.emails[0].value # pull the first email
        user.save (err) ->
          mailer.cLog 'Error at '+__filename,err if err
          done null, user

      return

    return
  )
  return