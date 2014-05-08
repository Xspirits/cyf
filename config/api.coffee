User = require("../app/models/user")

module.exports = (app, appKeys, eApi, mailer, _, grvtr, sio, passport, genUID, xp, notifs, moment, challenge, users, relations, games, social, ladder, shortUrl) ->

  # LOGIN

  login: (credentials, done) ->
    User.findOne({"local.email": credentials.email}).populate({ path: 'friends.idUser'}).exec (err, userfound) ->
      # if there are any errors, return the error
      done {passed: false, err: err} if err
      
      # if no user is found, return the message
      done {passed: false, err: 'User not found, are you human?'}  unless userfound
      
      if !userfound.validPassword credentials.password
        done {passed: false, err: 'Account existing but...Wrong password.'}
      # all is well, return user
      else
        if appKeys.app_config.email_confirm          
          unless userfound.verified
            done {passed: false, 'Please confirm your email adress before entering the arena.'}
        
        unless userfound.sessionKey
          userfound.sessionKey = userfound.generateHash(userfound.local.pseudo + appKeys.express_sid_key) 
          userfound.save (err) ->
            mailer.cLog 'Error at '+__filename,err if err
            notifs.login userfound
            done {passed: true, user: userfound}
        else
          done {passed: true, user: userfound}

  # REGISTER

  register: (signup, done) ->
    uID = genUID.generate().substr(-6)
    uIDHash = genUID.generate().substr(-12)

    User.findOne
      "local.email": signup.email
    , (err, user) ->
      
      # if there are any errors, return the error
      return done {passed: false, err: err}  if err
      
      # check to see if theres already a user with that email
      if user
        done {passed: false, err: 'That email is already taken.'}
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
        newUser.local.email = signup.email
        newUser.local.password = newUser.generateHash(signup.password)
        newUser.local.friends = []
        newUser.local.pseudo = signup.pseudo
        newUser.local.sentRequests = []
        newUser.local.pendingRequests = []
        newUser.local.followers = []

        grvtr.create signup.email,
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
              done {passed: true, user: newUser, log: true}
            else
              mailer.accountConfirm user, (returned) ->
                done {passed: true, user: newUser, log: false}