Badge = require("../models/badge")
User = require("../models/user")

module.exports = (async, _, mailer, notifs, sio) ->

  # create 'testout','lolielol', false,{reqType:'level', reqValue:1}, (done)->
  create: (title, desc, reqBadges, requirement, done)->

    if reqBadges
      if(_.isArray(reqBadges))
        requiredBadges = reqBadges
      else
        requiredBadges = [reqBadges]


    # create the challenge
    newBadge = new Badge()
    newBadge.title = title
    newBadge.description = desc
    newBadge.reqBadges = requiredBadges
    
    if(requirement)
      # Format: [{reqType:'Strirng', reqValue:Number}]
      newBadge.requirement = requirement

    # console.log(newBadge);
    newBadge.save (err) ->
      mailer.cLog 'Error at '+__filename,err if err
      # console.log err if err
      # console.log newBadge
      done newBadge 

  # tryUnlock [1,4],req.user, (result)->
  # tryUnlock  3,req.user, (result)->
  # Test if a given user can unlock a badge or multiple badge
  tryUnlock: (badges, user, done)->
    console.log 'tryUnlock',badges,user.local.pseudo
    _this = @
    if(_.isArray(badges))
      async.eachSeries badges, ((badge, next) ->
        console.log 'eachSeries',badge
        _this.testUnique badge, user, (result)->
          if result == true
            _this.unlock badge,user, (result)->
              if result == true
                console.log 'new badge pushed'
              else
                console.log 'new badge push failed'
              next()
        return
      ), (err) ->
        done()
        return

    else
      _this.testUnique badges, user, (result)->
        if result == true
          _this.unlock badges,user, (result)->
            if result == true
              console.log 'new badge pushed'
            else
              console.log 'new badge push failed'
            done()

  # give the badge
  unlock: (badgeId, user, done)->
    console.log 'unlock',badgeId,user.local.pseudo
    User.findByIdAndUpdate user._id,{$addToSet: {'badges.idBadge': badgeId}}, (err, userUpdated) ->
      # mailer.cLog 'Error at '+__filename,err if err
      console.log err if err
      # console.log userUpdated.badges
      Badge.update {_id:badgeId},{$addToSet: {'ownedBy': user._id}}, (err,nrow, badge) ->
        console.log err if err
        # console.log badge
        done true

  # test a unique badge
  testUnique: (id, user, done)->
    console.log 'testUnique',id,user.local.pseudo
    Badge.findById(id).exec (err,badge)->
      # console.log 'testUnique 2',badge
      done true

  # remove a badge for a given user
  withdraw: (badgeId, user, done)->
    User.findByIdAndUpdate(user._id,
         $pull:
           badge:
            idBadge: badgeId
       ).exec (err, userUpdated) ->
         # mailer.cLog 'Error at '+__filename,err if err
         console.log err if err
         done true
