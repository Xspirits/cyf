
# load up the user model
User = require("../app/models/user")
Challenge = require("../app/models/challenge")
module.exports = (_, mailer)->
  
  ###
  Return the current pending requests for a given user
  @param  {String}   idUser [user's id]
  @param  {Function} done   [description]
  @return {Object}          [List of ongoing requests]
  ###
  getPending: (idUser, done) ->
    Relation.findOne(idUser: idUser).exec (err, data) ->
      mailer.cLog 'Error at '+__filename,err if err
      #return an array of objects
      done data.pendingRequests
  
  ###
  Create or update a relation with either a sending invite or pending one
  @param  {String}   from       [id of the sender]
  @param  {String}   to         [id of the receiver]
  @param  {Boolean}   thisIsSend [true or false]
  @param  {Function} done       [callback]
  @return {Boolean}              [true or false]
  ###
  create: (from, to, thisIsSend, done) ->
    
    #Check if the relation exist or not.
    if thisIsSend
      pushing = "sentRequests"
      query = $push:
        sentRequests:
          idUser: to.id
          idCool: to.idCool
          userName: to.userName
    else
      pushing = "pendingRequests"
      query = $push:
        pendingRequests:
          idUser: to.id
          idCool: to.idCool
          userName: to.userName
    User.findOne(
      _id: from.id
      $or: [
        {
          "sentRequests.idUser": to.id
        }
        {
          "pendingRequests.idUser": to.id
        }
      ]
    ).exec (err, relation) ->

      mailer.cLog 'Error at '+__filename,err if err

      unless relation
        User.findByIdAndUpdate(from.id, query).exec (err, updated) ->
          done true
          return
      else
        done false, "already asked"
  
  ###
  Accept a relation: add a new row and delete the pending ones
  @param  {[type]}   from [description]
  @param  {[type]}   to   [description]
  @param  {Function} done [description]
  @return {[type]}        [description]
  ###
  acceptRelation: (from, to, done) ->

    User.findById from.id, (err, user) ->

      # does the request exist ?
      
      if user.sentRequests
        testReq = _.map(user.sentRequests, (u)-> u.idUser.toString() );
        # console.log testReq,to.id
        testReq = _.contains(testReq, to.id.toString());
        # console.log testReq


        testUnit = _.pluck(user.friends, 'idCool');
        # console.log testUnit,to.idCool
        testUnit = _.contains(testUnit, to.idCool);
        # console.log testUnit
        
        if testReq

          if !testUnit

            User.findByIdAndUpdate from.id,
              $pull:
                sentRequests:
                  idUser: to.id

              $push:
                friends:
                  idUser: to.id
                  idCool: to.idCool
                  userName: to.userName
            , (err, relationFrom) ->

              mailer.cLog 'Error at '+__filename,err if err

              User.findByIdAndUpdate to.id,
                $pull:
                  pendingRequests:
                    idUser: from.id

                $push:
                  friends:
                    idUser: from.id
                    idCool: to.idCool
                    userName: from.userName
              , (err, relationTo) ->

                mailer.cLog 'Error at '+__filename,err if err
                newRelation = [relationFrom,relationTo]
                done [true, newRelation]
          else
            done [false,'relation already exists']
        else
          done [false,'relation is not pending.']
      else
        done [false,'something went wrong with this request :/']

  # Unfriend
  unFriend: (from, to, done) ->

    User.findById from.id, (err, user) ->

      if user.friends
        testFriends = _.map(user.friends, (u)-> u.idUser.toString() );
        console.log testFriends,to.id
        testFriends = _.contains(testFriends, to.id.toString());
        console.log testFriends

        if testFriends

          User.findByIdAndUpdate from.id,
            $pull:
              pendingRequests:
                idUser: to.id
          , (err, relation) ->

            mailer.cLog 'Error at '+__filename,err if err
            # console.log relation.pendingRequests,err

            User.findByIdAndUpdate to.id,
              $pull:
                sentRequests:
                  idUser: from.id
            , (err, relation) ->
              mailer.cLog 'Error at '+__filename,err if err
              console.log relation.sentRequests,err
              done [true, '']
        else
          done [false,'You are not friends.']
      else
        done [false,'something went wrong with this request :/']

  
  ###
  Deny a relation: delete the pending one from whom denied it.
  @param  {[type]}   from [description]
  @param  {[type]}   to   [description]
  @param  {Function} done [description]
  @return {[type]}        [description]
  ###
  denyRelation: (from, to, done) ->

    User.findById from.id, (err, user) ->
      mailer.cLog 'Error at '+__filename,err if err

      if user.sentRequests
        testReq = _.map(user.sentRequests, (u)-> u.idUser.toString() );
        # console.log testReq,to.id
        testReq = _.contains(testReq, to.id.toString());
        # console.log testReq
        # console.log user.sentRequests

        if testReq
          User.findByIdAndUpdate from.id
          ,
            $pull:
              sentRequests:
                idUser: to.id
          ,
            safe: true
          , (err, user) ->
            # console.log user.local.pseudo,user.sentRequests,err
            User.findByIdAndUpdate to.id
            ,
              $pull:
                pendingRequests:
                  idUser: from.id
            ,
              safe: true
            , (err, user) ->
              mailer.cLog 'Error at '+__filename,err if err
              # console.log user.local.pseudo,user.pendingRequests,err
              done [true, '']
        else
          done [false,'This relation is not existing.']
      else
        done [false,'something went wrong with this request :/']