module.exports = function(io, cookieParser, sessionStore,EXPRESS_SID_KEY,COOKIE_SECRET, sio) {

// 
// ================================================
// 
// We configure the socket.io authorization handler (handshake)
io.set('authorization', function (data, callback) {
    if(!data.headers.cookie) {
        return callback('No cookie transmitted.', false);
    }

    // We use the Express cookieParser created before to parse the cookie
    // Express cookieParser(req, res, next) is used initialy to parse data in "req.headers.cookie".
    // Here our cookies are stored in "data.headers.cookie", so we just pass "data" to the first argument of function
    cookieParser(data, {}, function(parseErr) {
        if(parseErr) { return callback('Error parsing cookies.', false); }

        // Get the SID cookie
        var sidCookie = (data.secureCookies && data.secureCookies[EXPRESS_SID_KEY]) ||
        (data.signedCookies && data.signedCookies[EXPRESS_SID_KEY]) ||
        (data.cookies && data.cookies[EXPRESS_SID_KEY]);

        // @todo: remove this as it should not be working with such a hack.
        if (sidCookie) {
            sidCookie = sidCookie.slice(2).split('.')[0];
            // sid = cookie.unsign(sid, "mySecret");
        }

        // Then we just need to load the session from the Express Session Store
        sessionStore.load(sidCookie, function(err, session) {
            // And last, we check if the used has a valid session and if he is logged in
            if (err || !session || session.isLogged !== true) {
                callback('Not logged in.', false);
            } else {
                // If you want, you can attach the session to the handshake data, so you can use it again later
                // You can access it later with "socket.handshake.session"
                data.session = session;

                callback(null, true);
            }
        });
    });
});

// upon connection, start a periodic task that emits (every 1s) the current timestamp
io.on('connection', function (socket) {

    var hs = socket.handshake;
    var user = hs.session.user;

    if(!hs.session.notifLog){

        if(hs.session.newUser) 
            sio.glob('fa fa-user',' <a href="/u/'+user.idCool+'">'+user.local.pseudo + '</a> joined the community!');
        else 
            sio.glob('glyphicon glyphicon-log-in',' <a href="/u/'+user.idCool+'">'+user.local.pseudo + '</a> connected');
        
        hs.session.notifLog = true;
        hs.session.save();
    }

    socket.set('nickname', user.local.pseudo);

    //Handling events from users
    socket.on('just happened', function (data) {
        socket.get('nickname', function (err, name) {

            sio.glob(data.icon,data.event);
        });
    });

    // socket.on('disconnect', function() {
    //  io.sockets.emit('globalevent', { icon: 'glyphicon glyphicon-log-out',message: user.local.pseudo + ' disconnected'});
    // });
});

}