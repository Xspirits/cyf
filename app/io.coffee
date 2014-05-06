currentlyOnline = 0
module.exports = (io, db_chat, _, mailer, cookieParser, sessionStore, EXPRESS_SID_KEY, COOKIE_SECRET, sio) ->
  
  # We configure the socket.io authorization handler (handshake)
  io.set "authorization", (data, callback) ->
    return callback("No cookie transmitted.", false)  unless data.headers.cookie
    
    # We use the Express cookieParser created before to parse the cookie
    # Express cookieParser(req, res, next) is used initialy to parse data in "req.headers.cookie".
    # Here our cookies are stored in "data.headers.cookie", so we just pass "data" to the first argument of function
    cookieParser data, {}, (parseErr) ->
      return callback("Error parsing cookies.", false)  if parseErr
      
      # Get the SID cookie
      sidCookie = (data.secureCookies and data.secureCookies[EXPRESS_SID_KEY]) or (data.signedCookies and data.signedCookies[EXPRESS_SID_KEY]) or (data.cookies and data.cookies[EXPRESS_SID_KEY])
      
      # @todo: remove this as it should not be working with such a hack.
      sidCookie = sidCookie.slice(2).split(".")[0]  if sidCookie
      
      # sid = cookie.unsign(sid, "mySecret");
      
      # Then we just need to load the session from the Express Session Store
      sessionStore.load sidCookie, (err, session) ->
        
        # And last, we check if the used has a valid session and if he is logged in
        if err or not session or session.isLogged isnt true
          callback "Not logged in.", false
        else
          
          # If you want, you can attach the session to the handshake data, so you can use it again later
          # You can access it later with "socket.handshake.session"
          data.session = session
          callback null, true

  # upon connection, start a periodic task that emits (every 1s) the current timestamp
  io.on "connection", (socket) ->
    hs = socket.handshake
    user = hs.session.user
    # build a safe user-object:
    sUser = 
      idCool: user.idCool
      pseudo: user.local.pseudo
      icon: user.icon
      level: user.level
      dailyRank: user.dailyRank

    unless hs.session.notifLog
      ++currentlyOnline
      sio.onlineNumber currentlyOnline
      if hs.session.newUser
        sio.glob "fa fa-user", " <a href=\"/u/" + sUser.idCool + "\">" + sUser.pseudo + "</a> joined the community!"
      else
        sio.glob "glyphicon glyphicon-log-in", " <a href=\"/u/" + sUser.idCool + "\">" + sUser.pseudo + "</a> connected"
      hs.session.notifLog = true
      hs.session.save()
    socket.set "nickname", sUser
    
    #Handling events from users
    # socket.on "just happened", (data) ->
    #   socket.get "nickname", (err, name) ->
    #     sio.glob data.icon, data.event
# socket.on('disconnect', function() {
#  io.sockets.emit('globalevent', { icon: 'glyphicon glyphicon-log-out',message: user.local.pseudo + ' disconnected'});
# });
  # CHAT

  io.of('/chat').on "connection", (chat) ->
    chat.get "nickname", (err, user) ->

      #populate last messages
      db_chat.find({}).limit(100).sort('-dateSent').exec (err, messages)->
        sio.pushChat messages
      
      #Handling events from users
      chat.on "message", (data) ->
        sio.discuss user, data
      return

  io.of('/chat').on "disconnect", (chat) ->
    --currentlyOnline
    sio.onlineNumber currentlyOnline
    return
