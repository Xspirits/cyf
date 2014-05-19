Badge = require("../models/badge")
User = require("../models/user")

module.exports = (async, _, mailer, notifs, sio) ->

  # create 'testout','lolielol', false,{reqType:'level', reqValue:1}, (done)->
  getList: (done)->
    Badge.find().sort('_id').exec (err,list)->
      mailer.cLog 'Error at '+__filename,err if err
      done list

  getNonUnlocked: (user, done)->
    Badge.find( { ownedBy: { $nin: [ user._id ] } } ).sort('_id').exec (err,list)->
      mailer.cLog 'Error at '+__filename,err if err
      done list


  # create 'testout','lolielol',icon, false,{reqType:'level', reqValue:1}, (done)->
  create: (title, desc, icon, reqBadges, requirement, done)->

    if reqBadges
      if(_.isArray(reqBadges))
        requiredBadges = reqBadges
      else
        requiredBadges = [reqBadges]

    # create the challenge
    newBadge = new Badge()
    newBadge.title = title
    newBadge.icon = icon
    newBadge.description = desc
    newBadge.reqBadges = requiredBadges
    
    # Format: [{reqType:'Strirng', reqValue:Number}]
    if(requirement)
      if(_.isArray(requirement))
        newBadge.requirement = requirement
      else
        newBadge.requirement = [requirement]

    console.log(newBadge);
    newBadge.save (err) ->
      mailer.cLog 'Error at '+__filename,err if err
      console.log err if err
      # console.log newBadge
      done [false, err] if err
      done [true,newBadge] 

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

          console.log 'testUnique result ',result, badge
          if result == true
            _this.unlock badge,user, (unlocked)->
              if unlocked == true
                console.log 'new badge pushed'
                next()
              else
                console.log 'new badge push failed'
                next()
          else
            next()
        return
      ), (err) ->
        done()
        return

    else
      _this.testUnique badges, user, (result)->
        console.log 'testUnique result ',result, badges
        if result == true
          _this.unlock badges,user, (result)->
            if result == true
              console.log 'new badge pushed'
              done()
            else
              console.log 'new badge push failed'
              done()
        else
          done()            

  # give the badge
  unlock: (badgeId, user, done)->
    console.log 'unlocking',badgeId, user.local.pseudo
    User.findByIdAndUpdate user._id,{$addToSet: {badges: {idBadge: badgeId}}}, (err, userUpdated) ->
      mailer.cLog 'Error at '+__filename,err if err
      console.log err if err
      console.log userUpdated.badges
      Badge.findByIdAndUpdate badgeId,{$addToSet: {ownedBy: user._id}}, (err, upBadge) ->
        mailer.cLog 'Error at '+__filename,err if err
        console.log err if err
        console.log upBadge.ownedBy
        done false if err
        done true

  # test a unique badge
  testUnique: (id, user, done)->
    console.log 'testUnique',id,user.local.pseudo
    Badge.findById(id).exec (err,badge)->
      # console.log 'testUnique 2',badge
      testBR = true
      pass = true

      if !_.isEmpty badge.reqBadges

        # test required badges first
        ownedBadges = _.pluck user.badges,'idBadge'
        console.log badge.reqBadges,ownedBadges
        _.each badge.reqBadges, (reqBadge)->
          console.log reqBadge, ' is contained in:',ownedBadges
          if(!_.contains(ownedBadges, reqBadge))
            testBR = false

      console.log 'test badge dependecy result:' ,testBR

      if testBR == true
        # set a passing variable which will switch to false if any test below isn't passed

        console.log 'badge Req: ',badge.requirement
        _.each badge.requirement, (required)->
          reqType = required.reqType
          minValue = required.reqValue

          console.log 'test Req: ',reqType,minValue 

          # filter by type
          switch reqType
            when 'level'
              console.log 'level test:', user.level + '>=' + minValue, (user.level >= minValue)
              if user.level < minValue
                pass = false
            when 'friend'
              console.log 'friends test:', user.friends.length + '>=' + minValue, (user.level >= minValue)
              console.log 'friends  test:', user.friends.length + '>=' + minValue
              if user.friends.length < minValue
                pass = false
            else
              console.log 'unwritten test:', reqType
              pass = false

          console.log 'test Req results: ',pass

        if pass == true
          done true
        else
          done false
      else
        done false


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
