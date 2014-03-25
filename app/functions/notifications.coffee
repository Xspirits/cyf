User = require("../models/user")
_ = require("underscore")
module.exports =
  
  ###
  Send a new notification to either one or many people.
  @param  {Array}  users	[array of people who will receive the notification]
  @param  {Boolean} isPersistant [description]
  @param  {Object}  notif	[notification's elements]
  @return {Object}[the updated User]
  ###
  newNotif: (users, isPersistant, notif, not_) ->
    query = undefined
    persist = undefined
    red = undefined
    if isPersistant is false
      if users.length > 0
        if not_ && not_.length > 0
          red = _.difference(users, not_)
          query =
            _id:
              $in: red

            isOnline: true
        else
          query =
            _id:
              $in: users

            isOnline: true
      else
        query =
          _id: users[0]
          isOnline: true
    else
      if users.length > 0
        if not_ && not_.length > 0
          red = _.difference(users, not_)
          query = _id:
            $in: red
        else
          query = _id:
            $in: users
      else
        query = _id: users[0]
    notification =
      type: (if notif.type then notif.type else "simple")
      persist: isPersistant
      idFrom: notif.idFrom
      from: notif.from
      link1: notif.link1
      to: notif.to
      link2: notif.link2
      icon: notif.icon
      title: notif.title
      message: notif.message

    User.update query,
      $push:
        notifications: notification
    ,
      multi: true
    , (err, result) ->
      throw err  if err
      result

    return
  ###
  Mark a notification as READ:if it's not persistant delete it.
  @param  {[type]}	data [description]
  @param  {Function} done [description]
  @return {[type]}	[description]
  ###
  markRead: (data, done) ->
    nowSeen = "notifications.isSeen": true
    thisNotif = data.idNotif
    if data.delete == true
      if thisNotif
        User.findByIdAndUpdate(data.idUser,
          $pull:
            notifications:
              _id: thisNotif
        ).exec (err, user) ->
          throw err  if err
          done true
      else
        done true
    else
      User.findOneAndUpdate({ _id: data.idUser,'notifications._id':thisNotif},{ $set: { 'notifications.$.isSeen': true} }).exec( done );
    return

  gainedXp: (user, amount, bonus, fromAction) ->
    toSelf = [user._id]
    isBonus = (if bonus > 0 then " (+" + bonus + " xp)" else "")
    notif =
      idFrom: user._id
      from: user.local.pseudo
      link1: "/u/" + user.idCool
      to: ""
      link2: ""
      icon: "fa fa-plus-square-o"
      title: "You gained " + amount + " xp" + isBonus + "."
      message: "by " + fromAction

    @newNotif toSelf, true, notif
    return
  
  ###
  I gained a level,this deserve a notification.
  @param  {[type]} user[description]
  @param  {[type]} newLevel [description]
  @return {[type]}[description]
  ###
  gainedLevel: (user, newLevel) ->
    toSelf = [user._id]
    notif =
      idFrom: user._id
      from: user.local.pseudo
      link1: "/u/" + user.idCool
      to: ""
      link2: ""
      icon: "fa fa-arrow-up"
      title: "You have reached level  " + newLevel + "!"
      message: "Congratulation! "

    @newNotif toSelf, true, notif
    return

  
  ###
  I gained a level,this deserve a notification.
  @param  {[type]} user[description]
  @param  {[type]} newLevel [description]
  @return {[type]}[description]
  ###
  askFriend: (user, to) ->
    toSelf = [user._id]
    notif =
      idFrom: user._id
      from: to.userName
      link1: "/u/" + to.idCool
      to: ""
      link2: ""
      icon: "glyphicon glyphicon-heart"
      title: "You have sent a friend request to  " + to.userName + "."
      message: " "

    @newNotif toSelf, true, notif
    return

  
  ###
  When the user log in,send a notification to his friends.
  @param  {[type]} user [description]
  @return {[type]} [description]
  ###
  login: (user) ->
    myFriends = _.map(user.friends, (num) ->
      num.idUser.toString()
    )
    notif =
      idFrom: user._id
      from: user.local.pseudo
      link1: "/u/" + user.idCool
      to: ""
      link2: ""
      icon: ""
      title: user.local.pseudo + " just connected."
      message: ""

    @newNotif myFriends, false, notif
    return
  
  ###
  When the user log in,send a notification to his friends.
  @param  {[type]} user [description]
  @return {[type]} [description]
  ###
  login: (user) ->
    myFriends = _.map(user.friends, (num) ->
      num.idUser.toString()
    )
    notif =
      idFrom: user._id
      from: user.local.pseudo
      link1: "/u/" + user.idCool
      to: ""
      link2: ""
      icon: ""
      title: user.local.pseudo + " just connected."
      message: ""

    @newNotif myFriends, false, notif
    return

  
  ###
  When user logout,notify his friends
  @param  {[type]} user [description]
  @return {[type]} [description]
  ###
  logout: (user) ->
    myFriends = _.map(user.friends, (num) ->
      num.idUser.toString()
    )
    notif =
      idFrom: user._id
      from: user.local.pseudo
      link1: "/u/" + user.idCool
      to: ""
      link2: ""
      icon: ""
      title: user.local.pseudo + " just disconnected."
      message: ""

    @newNotif myFriends, false, notif, false
    return

  
  ###
  User X and Y are now friends,so broadcast the news to their respective friends.
  @param  {[type]} newFriends [description]
  @return {[type]}  [description]
  ###
  nowFriends: (newFriends) ->
    from = newFriends[0]
    to = newFriends[1]
    friendsFrom = _.map(from.friends, (num) ->
      num.idUser.toString()
    )
    friendsTo = _.map(to.friends, (num) ->
      num.idUser.toString()
    )
    friendsList = _.union(friendsFrom, friendsTo)
    friendsList = _.without(friendsList, from._id.toString(), to._id.toString())
    notif =
      idFrom: from._id
      from: from.local.pseudo
      link1: "/u/" + from.idCool
      to: to.local.pseudo
      link2: "/u/" + to.idCool
      icon: "glyphicon glyphicon-heart"
      title: from.local.pseudo + " is now friend with"
      message: ""

    @newNotif friendsList, true, notif
    return

  
  ###
  When user X gain a level,it's good to let people know he's became more powerfull
  @param  {[type]} user [description]
  @return {[type]} [description]
  ###
  levelUp: (user) ->
    friends = _.map(user.friends, (num) ->
      num.idUser.toString()
    )
    notif =
      idFrom: user._id
      from: user.local.pseudo
      link1: "/u/" + user.idCool
      to: ""
      link2: ""
      icon: "fa fa-angle-double-up"
      title: user.local.pseudo + " is now level " + user.level + "!"
      message: ""

    @newNotif friends, true, notif
    return

  
  ###
  When the user create a challenge,let his friends know
  @param  {[type]} user	[description]
  @param  {[type]} idCool [description]
  @return {[type]}	[description]
  ###
  createdChallenge: (user, idCool) ->
    myFriends = _.map(user.friends, (num) ->
      num.idUser.toString()
    )
    notif =
      idFrom: user._id
      from: user.local.pseudo
      link1: "/u/" + user.idCool
      to: ""
      link2: "/c/" + idCool
      icon: "glyphicon glyphicon-saved"
      title: user.local.pseudo + " created a new challenge"
      message: "!"

    @newNotif myFriends, true, notif
    return

  
  ###
  When user X challenge user Y,let their friends know
  @param  {[type]} idChallenger [description]
  @param  {[type]} idChallenged [description]
  @return {[type]}	[description]
  ###
  launchChall: (idChallenger, idChallenged) ->
    _this = this
    not_ = [
      idChallenger
      idChallenged
    ]
    User.findById(idChallenger).exec (err, challenger) ->
      User.findById(idChallenged).exec (err, challenged) ->
        notif = undefined
        friends = _.map(challenger.friends, (num) ->
          num.idUser.toString()
        )
        friends = _.without(friends, challenged._id.toString())
        notif =
          type: "challengeReceive"
          idFrom: challenger._id
          from: challenger.local.pseudo
          link1: "/u/" + challenger.idCool
          to: challenged.local.pseudo
          link2: "/u/" + challenged.idCool
          icon: "glyphicon glyphicon-flash"
          title: challenger.local.pseudo + " challenged"
          message: ""

        
        #Friends
        _this.newNotif friends, true, notif
        notif =
          type: "challengeReceive"
          idFrom: challenger._id
          from: challenger.local.pseudo
          link1: "/u/" + challenger.idCool
          to: ""
          link2: ""
          icon: "glyphicon glyphicon-flash"
          title: challenger.local.pseudo + " challenged"
          message: "you !"

        
        #The challenged
        _this.newNotif [idChallenged], true, notif
        notif =
          type: "challengeReceive"
          idFrom: challenger._id
          from: challenger.local.pseudo
          link1: challenged.idCool
          title: challenged.local.pseudo + " has been challenged!"
          to: ""
          link2: ""
          message: ""

        
        #The challenger
        _this.newNotif [idChallenger], true, notif
        return

      return

    return

  
  ###
  When user Y accept the challenge of user X,let them friends know
  @param  {[type]} idChallenger [description]
  @param  {[type]} idChallenged [description]
  @return {[type]}	[description]
  ###
  acceptChall: (idChallenger, idChallenged) ->
    
    #var setup
    _this = this
    not_ = [
      idChallenger
      idChallenged
    ]
    User.findById(idChallenger).exec (err, challenger) ->
      User.findById(idChallenged).exec (err, challenged) ->
        notif = undefined
        friends = _.map(challenged.friends, (num) ->
          num.idUser.toString()
        )
        friends = _.without(friends, challenger._id.toString())
        notif =
          idFrom: challenged._id
          from: challenged.local.pseudo
          link1: "/u/" + challenged.idCool
          to: challenger.local.pseudo
          link2: "/u/" + challenger.idCool
          icon: "glyphicon glyphicon-flash"
          title: challenged.local.pseudo + " accepted a challenge from"
          message: ""

        
        #Friends notif
        _this.newNotif friends, true, notif, not_
        
        # It's up to the CHALLENGED to accept,thus "YOU" target the challenger.
        #The challenged
        notif =
          idFrom: challenger._id
          from: challenger.local.pseudo
          link1: challenger.idCool
          to: challenger.local.pseudo
          link2: "/u/" + challenger.idCool
          title: "You accepted a challenge from"
          message: ""

        _this.newNotif [challenged], true, notif
        
        #The challenged
        notif =
          idFrom: challenged._id
          from: challenged.local.pseudo
          link1: "/u/" + challenged.idCool
          to: "challenge"
          link2: ""
          title: challenged.local.pseudo + " accepted your"
          message: ""

        _this.newNotif [idChallenger], true, notif
        return

      return

    return

  
  ###
  User Y successfully completed the challenge of X,notify people.
  @param  {[type]} challenge [description]
  @return {[type]} [description]
  ###
  successChall: (challenge) ->
    friends = _.map(challenge._idChallenged.friends, (num) ->
      num.idUser.toString()
    )
    notif =
      idFrom: challenge._idChallenged._id
      from: challenge._idChallenged.local.pseudo
      link1: "/u/" + challenge._idChallenged.idCool
      to: challenge._idChallenge.title
      link2: "/c/" + challenge._idChallenge.idCool
      icon: "glyphicon glyphicon-tower"
      title: challenge._idChallenged.local.pseudo + " completed the challenge"
      message: ""

    @newNotif friends, true, notif
    notif =
      type: "challengeSuccess"
      idFrom: challenge._idChallenger._id
      from: challenge._idChallenger.local.pseudo
      link1: "/u/" + challenge._idChallenged.idCool
      to: challenge._idChallenge.title
      link2: "/c/" + challenge._idChallenge.idCool
      icon: "glyphicon glyphicon-tower"
      title: "You have completed the challenge " + challenge._idChallenge.title + " launched by " + challenge._idChallenger.local.pseudo
      message: ""

    @newNotif [challenge._idChallenged._id], true, notif
    return

  
  ###
  User X rated a challenge he has been involved in,good news to share.
  @param  {[type]} challenge [description]
  @return {[type]} [description]
  ###
  ratedChall: (challenge) ->
    friends = _.map(challenge.user.friends, (num) ->
      num.idUser.toString()
    )
    notif =
      idFrom: challenge.user._id
      from: challenge.user.local.pseudo
      link1: "/u/" + challenge.user.idCool
      to: challenge.challenge.title
      link2: "/c/" + challenge.challenge.idCool
      icon: "glyphicon glyphicon-stats"
      title: challenge.user.local.pseudo + " rated the challenge"
      message: " with a score of " + challenge.note

    @newNotif friends, true, notif
    return

  
  ###
  A case has been closed. Let the challenger and challenged know about the outcome
  @param  {Object} challenge [Populated Ongoing]
  ###
  caseClosed: (caseClosed) ->
    answer = (if caseClosed.tribunalAnswered is true then "validated,congratulation" else "invalidated")
    
    #Notify the challenger & challenged
    notif =
      idFrom: caseClosed._idChallenger._id
      from: caseClosed._idChallenger.local.pseudo
      icon: (if (answer is true) then "fa-thumbs-o-up" else "fa-thumbs-o-down")
      link1: "/o/" + caseClosed._idChallenge.idCool
      title: "Tribunal decision on the case " + caseClosed._idChallenge.idCool
      link2: ""
      to: ""
      message: "The case has been " + answer

    @newNotif [
      caseClosed._idChallenged._id
      caseClosed._idChallenger._id
    ], true, notif
    
    # The case was a success,let the friends of the challenged knows about it.
    @successChall caseClosed  if caseClosed.tribunalAnswered is true
    return

  linkedGame: (user, gameName) ->
    friends = _.map(user.friends, (num) ->
      num.idUser.toString()
    )
    notif =
      idFrom: user._id
      from: user.local.pseudo
      icon: "fa-link"
      link1: "/u/" + user.idCool
      title: user.local.pseudo + " linked his " + gameName + " account!"
      link2: ""
      to: ""
      message: ""

    @newNotif friends, true, notif
    return