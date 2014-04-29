User = require("../app/models/user")

isLoggedIn = (req, res, next) ->
  return next()  if req.isAuthenticated()
  res.redirect "/"
  return
  
module.exports = (app, appKeys, eApi, mailer, _, grvtr, sio, passport, genUID, xp, notifs, moment, challenge, users, relations, games, social, ladder, shortUrl) ->

  app.get "/about", (req,res) ->
    res.render "about.ejs",
      currentUser: if req.isAuthenticated() then req.user else false

  # show the home page (will also have our login links)
  app.get "/", (req, res) ->
    if req.isAuthenticated()
      res.redirect "/profile"    
    else
      res.render 'index.ejs',
        currentUser: false

  app.get "/discover", (req, res) ->
    if req.isAuthenticated()
      res.render "discover.ejs",
        currentUser: req.user
    else
      ua = req.header 'user-agent'
      if /mobile/i.test(ua)
        res.render 'discover_mobile.ejs',
          currentUser: false
      else
        res.render 'discover.ejs',
          currentUser: false

  app.get "/eval/:hash", (req, res) ->
    hash = req.params.hash
    users.validateEmail hash, (result) ->
      res.redirect "/" if result == false
      mailer.sendMail result,'[Cyf] Account Confirmed, welcome aboard '+result.local.pseudo+'!','<h2>Your journey is about to begins!</h2><p>Thank you for taking the time to confirm your e-mail address.</p><p>We are proud to count you among the challengers on Cyf dear <strong>'+result.local.pseudo+'</strong>!</p><p>You can now enjoy fully Challenge your Friends, <a href="http://cyf-app.co/users">connect with some challengers</a> now and start <a href="" title="">sending and accepting</a> challenges right away! </p>',false
      res.redirect "/login"        

  # LOGOUT ==============================
  app.get "/logout", isLoggedIn, (req, res) ->
    notifs.logout req.user
    sio.glob "glyphicon glyphicon-log-out", req.user.local.pseudo + " disconnected"
    users.setOffline req.user, (result) ->
      req.session.notifLog = false
      req.session.isLogged = false
      req.logout()
      res.redirect "/"

  # FRIENDS LIST SECTION ======================
  app.get "/friends", isLoggedIn, (req, res) ->
    users.getFriendList req.user._id, (fList) ->
      res.render "friendList.ejs",
        currentUser: req.user
        friends: fList.friends

  # PROFILE SECTION ===========================
  app.get "/profile", isLoggedIn, (req, res) ->

    challenge.userAcceptedChallenge req.user._id, false, (data) ->
      ongoingChall = []
      _.each data, (value, key) ->
        cStart = data[key].launchDate
        cEnd = data[key].deadLine

        # Start has been reached but not end
        if moment(cStart).isBefore() and not moment(cEnd).isBefore() and data[key].progress < 100
          ongoingChall.push data[key]

      res.render "profile.ejs",
        ongoings: ongoingChall
        currentUser: req.user

  app.get "/settings", isLoggedIn, (req, res) ->
    res.render "setting.ejs",
      currentUser: req.user


  # CHALLENGES SECTION =========================
  app.get "/request", isLoggedIn, (req, res) ->
    
    #get Ongoing challenges for the current user
    
    # @todo : merge this
    challenge.challengerRequests req.user._id, (dataChallenger) ->
      challenge.challengedRequests req.user._id, (dataChallenged) ->
        obj =
          sent: dataChallenger
          request: dataChallenged

        res.render "request.ejs",
          currentUser: if req.isAuthenticated() then req.user else false
          challenges: obj

  # =============================================================================
  # TRIBUNAL   ==================================================================
  # =============================================================================

  # USER TRIBUNAL'S CASES SECTION =========================
  app.get "/tribunal", isLoggedIn, (req, res) ->
    challenge.userWaitingCases req.user, (data) ->
      
      # console.log(data);
      res.render "tribunal.ejs",
        currentUser: req.user
        cases: data

  # CASE DETAIL SECTION =========================
  # @TODO
  app.get "/t/:id", isLoggedIn, (req, res) ->
    id = req.params.id

  # =============================================================================
  # ONGOINGS   ==================================================================
  # =============================================================================

  # ONGOING DETAILS SECTION =========================
  app.get "/o/:id", (req, res) ->
    id = req.params.id
    challenge.ongoingDetails id, (data) ->
      
      # console.log(data);
      res.render "ongoingDetails.ejs",
        currentUser: if req.isAuthenticated() then req.user else false
        ongoing: data

  # USER'S ONGOINGS SECTION =========================
  app.get "/ongoing", isLoggedIn, (req, res) ->
    
    #get Ongoing challenges for the current user
    challenge.userAcceptedChallenge req.user._id, false, (data) ->
      upcomingChall = []
      ongoingChall = []
      endedChall = []
      reqValidation = []
      _.each data, (value, key) ->
        cStart = data[key].launchDate
        cEnd = data[key].deadLine
        
        # Is the challenge's deadline passed ?
        # If yes, mark it as not completed, failed        
        if moment(cEnd).isSame() or moment(cEnd).isBefore()
          challenge.crossedDeadline data[key]._id
          endedChall.push data[key]
        
        # Challenge is awaiting validation
        # To determine if its belong to the current user or not will be done client-side.
        else if data[key].waitingConfirm is true and data[key].progress < 100
          reqValidation.push data[key]
        
        # Start hasn't been reached
        else if not moment(cStart).isBefore() and not moment(cEnd).isBefore() and data[key].progress < 100
          upcomingChall.push data[key]
        
        # Start has been reached but not end
        else if moment(cStart).isBefore() and not moment(cEnd).isBefore() and data[key].progress < 100
          ongoingChall.push data[key]

      res.render "ongoing.ejs",
        currentUser: req.user
        toValidate: reqValidation
        upChallenges: upcomingChall
        onChallenges: ongoingChall
        endChallenges: endedChall

  # =============================================================================
  # CHALLENGES ==================================================================
  # =============================================================================

  # CHALLENGE LIST SECTION =========================
  app.get "/challenges", (req, res) ->
    challenge.getList false, (list) ->
      res.render "challenges.ejs",
        currentUser: if req.isAuthenticated() then req.user else false
        challenges: list

  # CHALLENGE DETAILS SECTION =========================
  app.get "/c/:id", (req, res) ->
    cId = req.params.id
    challenge.getChallenge cId, false, (data) ->
      res.render "challengeDetails.ejs",
        currentUser: if req.isAuthenticated() then req.user else false
        challenge: data


  # CREATE CHALLENGE SECTION =========================
  app.get "/newChallenge", isLoggedIn, (req, res) ->
    res.render "newChallenge.ejs",
      currentUser: req.user
      challenge: false

  app.post "/newChallenge", isLoggedIn, (req, res) ->
    challenge.create req, (done) ->
      notifs.createdChallenge req.user, done.idCool
      xp.xpReward req.user, "challenge.create"
      sio.glob "fa fa-plus-square-o", "<a href=\"/u/" + req.user.idCool + "\" title=\"" + req.user.local.pseudo + "\">" + req.user.local.pseudo + "</a> created a <a href=\"/c/" + done.idCool + "\" title=\"" + done.title + "\">new challenge</a>."
      res.render "newChallenge.ejs",
        currentUser: req.user
        challenge: done

  app.post "/validateChallenge", isLoggedIn, (req, res) ->
    data =
      oId: req.body.id
      pass: req.body.pass

    if typeof data.pass is "boolean" or data.pass instanceof Boolean
      
      #Update the ongoing
      challenge.validateOngoing data, (done) ->
        
        # Ongoing has been updated;
        # if the answer was "pass", mean it wasn't accepted, don't let people rate the challenge (yet).
        if data.pass is true
          obj =
            id: done._idChallenge._id
            _idChallenged: done._idChallenged._id
            _idChallenger: done._idChallenger._id

          xp.xpReward done._idChallenger, "ongoing.validate"
          xp.xpReward done._idChallenged, "ongoing.succeed", done._idChallenge.value
          ioText = "<a href=\"/c/" + done._idChallenged.idCool + "\" title=\"" + done._idChallenged.local.pseudo + "\">" + done._idChallenged.local.pseudo + "</a> completed the challenge <a href=\"/c/" + done._idChallenge.idCool + "\" title=\"" + done._idChallenge.title + "\">" + done._idChallenge.title + "</a>!"
          sio.glob "glyphicon glyphicon-tower", ioText
          notifs.successChall done
          
          #automaticall share on Twitter if allowed
          if done._idChallenged.share.twitter is true and done._idChallenged.twitter.token
            twitt = "I just completed a challenge (" + appKeys.cyf.app_domain + "/o/" + done.idCool + ") on Challenge your Friends! Join me now @cyf_app #challenge"
            social.postTwitter done._idChallenged.share.twitter, twitt, (data) ->
              if(data.id_str)
                text = "<a href=\"/u/" + done._idChallenged.idCool + "\" title=\"" + done._idChallenged.local.pseudo + "\">" + done._idChallenged.local.pseudo + "</a> shared his success on <a target=\"_blank\" href=\"https://twitter.com/" + data.user.screen_name + "/status/" + data.id_str + "\" title=\"see tweet\">@twitter</a>."
                sio.glob "fa fa-twitter", text
                ladder.actionInc req.user, "twitter"
          
          #Automatically share on facebook
          if done._idChallenged.share.facebook is true and done._idChallenged.facebook.token
            message = "I just completed the challenge \"" + done._idChallenge.title + "\"  on Challenge Your friends (@cyfapp)! I won " + xp.getValue("ongoing.succeed") + "XP! " + appKeys.cyf.app_domain + "/o/" + done.idCool

            social.postFbMessage done._idChallenged.facebook, message, false, (data) ->
              text = "<a href=\"/u/" + done._idChallenged.idCool + "\" title=\"" + done._idChallenged.local.pseudo + "\">" + done._idChallenged.local.pseudo + "</a> shared his success on facebook."
              sio.glob "fa fa-facebook", text
              ladder.actionInc req.user, "facebook"

          
          #Ask the challenger and challenged to rate the challenge.
          users.askRate obj, (done) ->
            res.send done

        else
          res.send true
    else
      res.send false, "not a boolean"


  # USER CHALLENGE TO BE RATED (ask opinion) ==================
  app.get "/rateChallenges", isLoggedIn, (req, res) ->
    users.userToRateChallenges req.user._id, (data) ->
      res.render "rateChallenge.ejs",
        currentUser: req.user
        challenge: data


  # PROFILE SECTION - USER Challenges =========================
  app.get "/myChallenges", isLoggedIn, (req, res) ->
    challenge.getUserChallenges req.user._id, (data) ->
      res.render "myChallenges.ejs",
        currentUser: req.user
        challenges: data

  # DELETE CHALLENGE SECTION =========================
  app.get "/removeChallenge/:id", isLoggedIn, (req, res) ->
    data = 
      id: req.params.id
      user: req.user
    challenge.delete data, (returned) ->
      res.redirect '/myChallenges'

  # LAUNCH A CHALLENGE REQUEST =======================
  app.get "/launchChallenge", isLoggedIn, (req, res) ->
    
    #Get the challenge list
    challenge.getList false, (challenges) ->
      
      #Get the users' friend list, because we need one which is up to date
      users.getUser req.user.idCool, false, (thisUser) ->
        res.render "launchChallenge.ejs",
          currentUser: req.user
          userList: thisUser.friends
          challenges: challenges

  app.post "/launchChallenge", isLoggedIn, (req, res) ->
    data =
      from: req.user._id
      idChallenged: req.body.idChallenged
      idChallenge: req.body.idChallenge
      deadLine: req.body.deadLine
      launchDate: req.body.launchDate
    notifs.launchChall data.from, data.idChallenged
    challenge.launch data, (result) ->
      users.getUser result._idChallenged, false, (uRet)->
        mailer.sendMail uRet,'[Cyf]Heads up '+uRet.local.pseudo+', you have been challenged by '+req.user.local.pseudo+'!','<h2>A new challenger appears!</h2> <p>The Challenger <strong>'+req.user.local.pseudo+'</strong>(LvL.'+req.user.level+') just challenged you!</p><p>The challenge id is '+result.idCool+',. If you accept, it <strong>will start on</strong><br> '+result.launchDate+'<br> and <strong> must be completed by</strong>:<br>'+result.deadLine+'</p><p>You can give your answer on <a href="http://cyf-app.co/request" title="go to Cyf request page now" target="_blank">your request page</a>.</p><p>The more friends you make the funnier it\'ll be!</p>',true
        res.send true

  #Ask a challenge validation to another user
  app.post "/validationRequest", isLoggedIn, (req, res) ->
    data =
      idUser: req.user._id
      idChallenge: req.body.idChallenge
      proofLink1: req.body.proofLink1
      proofLink2: req.body.proofLink2
      confirmComment: req.body.confirmComment
    challenge.requestValidation data, (result) ->
      mailer.sendMail result._idChallenged,'[Cyf]Challenge '+result._idChallenge.idCool+' validation request from '+result._idChallenged.local.pseudo,'<h2>'+result._idChallenger.local.pseudo+' as completed your challenge!</h2> <p>Your friend <strong>'+result._idChallenger.local.pseudo+'</strong>(LvL.'+result._idChallenger.level+') is asking your approval over the challenge '+result._idChallenge.idCool+'!</p><p>Here is one of his/her response: <img src="'+result._idChallenge.confirmLink1+'" alt="" style="max-width:300px; height:auto; display:inline-block;margin:1em auto"></p><p>You can give your answer on <a href="http://cyf-app.co/request" title="go to Cyf request page now" target="_blank">your request page</a>.</p>',true
      res.send result


  # =============================================================================
  # USERS PAGES (List and profiles===============================================
  # =============================================================================

  # User list
  app.get "/users", (req, res) ->
    users.getUserList false, (returned) ->
      res.render "userList.ejs",
        currentUser: if req.isAuthenticated() then req.user else false
        users: returned

  # leader board
  app.get "/leaderboard", (req, res) ->
    buffer = {}
    ladder.getLeaderboards "score",'global', false, (global) ->
      buffer.global = global
      ladder.getLeaderboards "score", 'monthly', false, (monthly) ->
        buffer.monthly = monthly
        ladder.getLeaderboards "score", 'weekly', false, (weekly) ->
          buffer.weekly = weekly
          ladder.getLeaderboards "score", 'daily', false, (daily) ->
            buffer.daily = daily
            res.render "leaderBoard.ejs",
              currentUser: if req.isAuthenticated() then req.user else false
              ranking: buffer
          return


  app.get "/u/:id", (req, res) ->
    users.getUser req.params.id, false, (returned) ->
      res.render "userDetails.ejs",
        currentUser: if req.isAuthenticated() then req.user else false
        user: returned
  # =============================================================================
  # AJAX CALLS ==================================================================
  # =============================================================================


  # ============
  # ANGULAR SPECIFICS & API CALLS
  # ============

  app.post "/api/register/:username/:email/:pass", (req,res) ->
    signup =
      pseudo: req.params.username
      password: req.params.pass
      email: req.params.email
    eApi.register signup, (done) ->
      res.send done


  app.get "/api/auth/:email/:pass", (req, res) ->
    creds=
      email: req.params.email
      password: req.params.pass

    if(creds.email && creds.password)
      eApi.login creds, (done) ->
        res.send done
    else
      res.send {passed: false, err: 'Bad credentials'}

  app.get "/api/users", (req, res) ->
    users.getUserList true, (returned) ->
      console.log returned
      res.send returned

  app.get "/api/users/:id", (req, res) ->
    users.getUser req.params.id, true, (returned) ->
      console.log returned
      res.send returned

  # userId MUST BE the user._id
  app.get "/api/ongoings/:userId", (req, res) ->

    challenge.userAcceptedChallenge req.params.userId, true, (data) ->
      console.log data
      res.send data

  app.get "/api/challenge/", (req, res) ->
    challenge.getList true, (returned) ->
      console.log returned
      res.send returned

  app.get "/api/challenge/:idCool", (req, res) ->
    challenge.getChallenge req.params.idCool, true, (returned) ->
      console.log returned
      res.send returned

  app.get "/api/ladder/:type/:scope", (req, res) ->
    type = req.params.type
    scope = req.params.scope
    ladder.getLeaderboards type, scope, true, (result) ->
      res.send result

  # ============
  # END ANGULAR SPECIFICS
  # ============


  # Game autocomplete research
  app.get "/search_game", (req, res) ->
    lookFor = req.query["term"]
    games.regexFind lookFor, (returned) ->
      res.send returned.data,
        "Content-Type": "application/json"
      , returned.go

  app.get "/unlink/game_lol", isLoggedIn, (req, res) ->
    users.unlinkLol req.user._id, (result) ->
      res.redirect "/settings"

  app.post "/syncLoLGames", isLoggedIn, (req,res) ->
    users.updateLastGames req.user, (result)->
      res.send if result then result else false


  app.post "/removePlayedGames", isLoggedIn, (req,res) ->
    users.removeGames req.user, req.body.gameId, (result)->
      res.send result

  app.post "/addPlayedGames", isLoggedIn, (req,res) ->
    idGame: req.body.id
    games.getGame req.body.id, (game)->
      users.addPlayedGames req.user, game, (result)->
        res.send result

  app.post "/invitedFriends", isLoggedIn, (req, res) ->

    invitedUsers = req.body.list

    obj =
      id: req.user._id
      fbInvitedFriends: invitedUsers

    users.fbInvites obj, (done) ->
      if done == true
        xp.xpReward req.user, "user.inviteFB", invitedUsers.length 
        res.send invitedUsers.length
      else
        res.send false

  app.post "/linkLol", isLoggedIn, (req, res) ->
    obj =
      id: req.user._id
      region: req.body.region
      summonerName: req.body.summonerName

    users.linkLol obj, (result) ->
      res.send if result == true then true else false

  app.post "/linklol_pickicon", isLoggedIn, (req, res) ->
    obj =
      id: req.user._id
      profileIconId_confirm: req.body.iconPicked

    users.linkLolIconPick obj, (result) ->
      res.send if result == true then true else false

  app.post "/changePassword", isLoggedIn, (req, res) ->
    # check we get the same pwd
    pwd1 = req.body.password1
    pwd2 = req.body.password2
    
    if(pwd1 == pwd2 && typeof pwd2 != "undefined" && typeof pwd1 != "undefined")
      users.changePassword req.user, pwd1, (done)->
        res.send true
    else
      res.send false,'Passwords did not match'

  app.post "/linkLol_confirm", isLoggedIn, (req, res) ->

    users.linkLol_confirm req.user, (result) ->

      if result == true
        xp.xpReward req.user, "connect.game"
        notifs.linkedGame req.user, "League of Legend"
        res.send true
      else
        res.send false,result

  app.post "/updateSettings", isLoggedIn, (req, res) ->
    obj =
      _id: req.user._id
      target: req.body.target
      value: req.body.value

    users.updateSettings obj, (result) ->
      res.send true

  app.post "/markNotifRead", isLoggedIn, (req, res) ->
    obj =
      idUser: req.user._id
      del: req.body.del
      idNotif: req.body.id

    notifs.markRead obj, (result) ->
      res.send true

  app.post "/sendTribunal", isLoggedIn, (req, res) ->
    obj =
      idUser: req.user._id
      id: req.body.id

    challenge.sendTribunal obj, (result) ->
      mailer.sendMail result._idChallenged,'[Cyf]Tribunal case submitted: '+result._idChallenge.idCool,'<h2>Your ongoing challenge has been submitted to the tribunal.</h2> <p>We are sorry to heard that you have been missjudged! To help you fix this a Tribunal composed by 3 members of the community selected randomly will now examine your challenge.</p><p>You can check its status on <a href="http://cyf-app.co/request" title="go to Cyf request page now" target="_blank">your request page</a>.</p>',false
      res.send true
  app.post "/rateChallenges", isLoggedIn, (req, res) ->
    obj =
      id: req.body.id
      idUser: req.user._id
      difficulty: req.body.difficulty
      quickness: req.body.quickness
      fun: req.body.fun

    challenge.rateChallenge obj, (data) ->
      xp.xpReward req.user, "challenge.rate"
      notifs.ratedChall data
      res.send true

  app.post "/voteCase", isLoggedIn, (req, res) ->
    obj =
      id: req.body.id
      idUser: req.user._id
      answer: req.body.answer

    challenge.voteCase obj, (result) ->
      xp.xpReward req.user, "tribunal.vote"
      challenge.remainingCaseVotes obj.id, (counter) ->
        if counter is 0
          challenge.completeCase obj.id, (cases) ->
            obj =
              id: cases._idChallenge
              _idChallenged: cases._idChallenged
              _idChallenger: cases._idChallenger

            notifs.caseClosed cases
            if cases.tribunalAnswered is true
              ioText = " The tribunal validated the case <a href=\"/c/" + cases.idCool + "\" title=\"" + cases._idChallenge.title + "\">" + cases.idCool + "</a> for <a href=\"/c/" + cases._idChallenged.idCool + "\" title=\"" + cases._idChallenged.local.pseudo + "\">" + cases._idChallenged.local.pseudo + "</a>."
              sio.glob "fa fa-legal", ioText
            users.askRate obj, (done) ->
              res.send true
              return

            return

        else
          res.send true

  app.post "/askFriend", isLoggedIn, (req, res) ->
    idFriend = req.body.id
    idCoolFriend = req.body.idCool
    nameFriend = req.body.pseudo
    obj =
      from:
        id: req.user._id
        idCool: req.user.idCool
        userName: req.user.local.pseudo

      to:
        id: idFriend
        idCool: idCoolFriend
        userName: nameFriend

    notifs.askFriend req.user, obj.to
    users.askFriend obj, (result) ->  
      mailer.sendMail result,'[Cyf] Friend request from '+req.user.local.pseudo,'<h2>'+result.local.pseudo+' your are getting famous!</h2> <p>The Challenger <strong>'+req.user.local.pseudo+'</strong>(LvL.'+req.user.level+') just send you a friend request on Cyf!</p><p>You can give your answer on <a href="http://cyf-app.co/request" title="go to Cyf request page now" target="_blank">your request page</a>.</p><p>The more friends you make the funnier it\'ll be!</p>',true
      res.send true

  app.post "/confirmFriend", isLoggedIn, (req, res) ->
    idFriend = req.body.id
    nameFriend = req.body.pseudo
    obj =
      from:
        id: idFriend
        userName: nameFriend

      to:
        id: req.user._id
        userName: req.user.local.pseudo

    relations.acceptRelation obj.from, obj.to, (result) ->
      xp.xpReward result[0], "user.newFriend"
      xp.xpReward result[1], "user.newFriend"
      notifs.nowFriends result
      sio.glob "fa fa-users", "<a href=\"/u/" + result[0].idCool + "\" title=\"" + result[0].local.pseudo + "\">" + result[0].local.pseudo + "</a> and <a href=\"/u/" + result[1].idCool + "\" title=\"" + result[1].local.pseudo + "\">" + result[1].local.pseudo + "</a> are now friends!"
      res.send true

  app.post "/cancelFriend", isLoggedIn, (req, res) ->
    idFriend = req.body.id
    nameFriend = req.body.pseudo
    obj =
      from:
        id: req.user._id
        userName: req.user.local.pseudo

      to:
        id: idFriend
        userName: nameFriend

    relations.cancelRelation obj.from, obj.to, (result) ->
      res.send true

  app.post "/denyFriend", isLoggedIn, (req, res) ->
    idFriend = req.body.id
    nameFriend = req.body.pseudo
    obj =
      from:
        id: idFriend
        userName: nameFriend

      to:
        id: req.user._id
        userName: req.user.local.pseudo

    relations.denyRelation obj.from, obj.to, (result) ->
      res.send true

  app.post "/acceptChallenge", isLoggedIn, (req, res) ->
    obj =
      id: req.body.id
      idUser: req.user._id

    challenge.accept obj, (result) ->
      xp.xpReward result._idChallenged, "ongoing.accept"
      xp.xpReward result._idChallenger, "ongoing.accept"
      notifs.acceptChall result._idChallenger, result._idChallenged
      ioText = '<a href="/u/' + result._idChallenged.idCool + '" title=" ' + result._idChallenged.local.pseudo + ' ">'
      ioText += result._idChallenged.local.pseudo + '</a> accepted <a href="/c/' + result._idChallenge.idCool + '" title="See details">the challenge</a> of <a href="/u/' + result._idChallenger.idCool + '" title="' + result._idChallenger.local.pseudo + '">' + result._idChallenger.local.pseudo + '</a>.'
      sio.glob "fa fa-gamepad", ioText
      res.send true

  app.post "/denyChallenge", isLoggedIn, (req, res) ->
    obj =
      id: req.body.id
      idUser: req.user._id

    challenge.deny obj, (result) ->
      if result
        res.send true
      else
        res.send result

  app.get "/lostPassword", (req, res) ->
    res.render "lostPassword.ejs",
      currentUser: if req.isAuthenticated() then req.user else false
      done: false

  app.post "/lostPassword", (req, res) ->
    users.retrievePassword req.body.email, (done)->
      res.render "lostPassword.ejs",
        currentUser: if req.isAuthenticated() then req.user else false
        done: true

  app.get "/login", (req, res) ->
    res.render "login.ejs",
      message: req.flash("loginMessage")

  app.post "/login", passport.authenticate("local-login",
    successRedirect: "/profile"
    failureRedirect: "/login"
    failureFlash: true
  )
  app.get "/signup/:done?", (req, res) ->
    nowConfirm = (if req.params.done is "great" then true else false)
    if nowConfirm && appKeys.app_config.email_confirm == true
      req.session.notifLog = false
      req.session.isLogged = false
      req.logout()
    res.render "signup.ejs",
      waitingConfirm: nowConfirm
      currentUser: if req.isAuthenticated() then req.user else false
      message: ""

  app.post "/signup", passport.authenticate("local-signup",
    successRedirect: "/signup/great"
    failureRedirect: "/signup"
    failureFlash: true
  )

  app.get "/auth/facebook", passport.authenticate("facebook",
    scope: [
      "email"
      "publish_actions"
      "manage_pages"
    ]
  )
  app.get "/auth/facebook/callback", passport.authenticate("facebook",
    successRedirect: "/profile"
    failureRedirect: "/"
  )
  app.get "/auth/twitter", passport.authenticate("twitter")
  app.get "/auth/twitter/callback", passport.authenticate("twitter",
    successRedirect: "/profile"
    failureRedirect: "/"
  )
  app.get "/auth/google", passport.authenticate("google",
    scope: [
      "profile"
      "email"
    ]
  )
  app.get "/auth/google/callback", passport.authenticate("google",
    successRedirect: "/profile"
    failureRedirect: "/"
  )
  # app.get "/connect/local", (req, res) ->
    # res.render "connect-local.ejs",
      # message: req.flash("loginMessage")
# 
  # app.post "/connect/local", passport.authenticate("local-signup",
    # successRedirect: "/profile"
    # failureRedirect: "/connect/local"
    # failureFlash: true
  # )
  app.get "/connect/facebook", passport.authorize("facebook",
    scope: [
      "email"
      "publish_actions"
    ]
  )
  app.get "/connect/facebook/callback", passport.authorize("facebook",
    successRedirect: "/profile"
    failureRedirect: "/"
  )
  app.get "/connect/twitter", passport.authorize("twitter",
    scope: "email"
  )
  app.get "/connect/twitter/callback", passport.authorize("twitter",
    successRedirect: "/profile"
    failureRedirect: "/"
  )
  app.get "/connect/google", passport.authorize("google",
    scope: [
      "profile"
      "email"
    ]
  )
  app.get "/connect/google/callback", passport.authorize("google",
    successRedirect: "/profile"
    failureRedirect: "/"
  )
  app.get "/unlink/local", (req, res) ->
    user = req.user
    user.local.email = `undefined`
    user.local.password = `undefined`
    user.local.pseudo = `undefined`
    user.save (err) ->
      res.redirect "/profile"

  app.get "/unlink/facebook", (req, res) ->
    user = req.user
    user.facebook.token = `undefined`
    user.save (err) ->
      res.redirect "/profile"

  app.get "/unlink/twitter", (req, res) ->
    user = req.user
    user.twitter.token = `undefined`
    user.save (err) ->
      res.redirect "/profile"

  app.get "/unlink/google", (req, res) ->
    user = req.user
    user.google.token = `undefined`
    user.save (err) ->
      res.redirect "/profile"

  app.get "*", (req, res) ->
    res.redirect "/"
