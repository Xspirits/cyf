// Generated by CoffeeScript 1.7.1
(function() {
  var currentlyOnline;

  currentlyOnline = 0;

  module.exports = function(io, db_chat, _, mailer, cookieParser, sessionStore, EXPRESS_SID_KEY, COOKIE_SECRET, sio) {
    io.set("authorization", function(data, callback) {
      if (!data.headers.cookie) {
        return callback("No cookie transmitted.", false);
      }
      return cookieParser(data, {}, function(parseErr) {
        var sidCookie;
        if (parseErr) {
          return callback("Error parsing cookies.", false);
        }
        sidCookie = (data.secureCookies && data.secureCookies[EXPRESS_SID_KEY]) || (data.signedCookies && data.signedCookies[EXPRESS_SID_KEY]) || (data.cookies && data.cookies[EXPRESS_SID_KEY]);
        if (sidCookie) {
          sidCookie = sidCookie.slice(2).split(".")[0];
        }
        return sessionStore.load(sidCookie, function(err, session) {
          if (err || !session || session.isLogged !== true) {
            return callback("Not logged in.", false);
          } else {
            data.session = session;
            return callback(null, true);
          }
        });
      });
    });
    io.on("connection", function(socket) {
      var hs, sUser, user;
      hs = socket.handshake;
      user = hs.session.user;
      sUser = {
        idCool: user.idCool,
        pseudo: user.local.pseudo,
        icon: user.icon,
        level: user.level,
        dailyRank: user.dailyRank
      };
      if (!hs.session.notifLog) {
        ++currentlyOnline;
        sio.onlineNumber(currentlyOnline);
        if (hs.session.newUser) {
          sio.glob("fa fa-user", " <a href=\"/u/" + sUser.idCool + "\">" + sUser.pseudo + "</a> joined the community!");
        } else {
          sio.glob("glyphicon glyphicon-log-in", " <a href=\"/u/" + sUser.idCool + "\">" + sUser.pseudo + "</a> connected");
        }
        hs.session.notifLog = true;
        hs.session.save();
      }
      return socket.set("nickname", sUser);
    });
    io.of('/chat').on("connection", function(chat) {
      return chat.get("nickname", function(err, user) {
        chat.on("message", function(data) {
          return sio.discuss(user, data);
        });
      });
    });
    return io.of('/chat').on("disconnect", function(chat) {
      --currentlyOnline;
      sio.onlineNumber(currentlyOnline);
    });
  };

}).call(this);
