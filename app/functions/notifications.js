// Generated by CoffeeScript 1.7.1
(function() {
  var User;

  User = require("../models/user");

  module.exports = function(_, mailer) {
    return {

      /*
      Send a new notification to either one or many people.
      @param  {Array}  users	[array of people who will receive the notification]
      @param  {Boolean} isPersistant [description]
      @param  {Object}  notif	[notification's elements]
      @return {Object}[the updated User]
       */
      newNotif: function(users, isPersistant, notif, not_) {
        var notification, persist, query, red;
        query = void 0;
        persist = void 0;
        red = void 0;
        if (isPersistant === false) {
          if (users.length > 0) {
            if (not_ && not_.length > 0) {
              red = _.difference(users, not_);
              query = {
                _id: {
                  $in: red
                },
                isOnline: true
              };
            } else {
              query = {
                _id: {
                  $in: users
                },
                isOnline: true
              };
            }
          } else {
            query = {
              _id: users[0],
              isOnline: true
            };
          }
        } else {
          if (users.length > 0) {
            if (not_ && not_.length > 0) {
              red = _.difference(users, not_);
              query = {
                _id: {
                  $in: red
                }
              };
            } else {
              query = {
                _id: {
                  $in: users
                }
              };
            }
          } else {
            query = {
              _id: users[0]
            };
          }
        }
        notification = {
          type: (notif.type ? notif.type : "simple"),
          persist: isPersistant,
          idFrom: notif.idFrom,
          from: notif.from,
          link1: notif.link1,
          to: notif.to,
          link2: notif.link2,
          icon: notif.icon,
          title: notif.title,
          message: notif.message
        };
        return User.update(query, {
          $push: {
            notifications: notification
          }
        }, {
          multi: true
        }, function(err, result) {
          if (err) {
            mailer.cLog('Error at ' + __filename, err);
          }
          return result;
        });
      },

      /*
      Mark a notification as READ:if it's not persistant delete it.
      @param  {[type]}	data [description]
      @param  {Function} done [description]
      @return {[type]}	[description]
       */
      markRead: function(data, done) {
        var nowSeen, thisNotif;
        nowSeen = {
          "notifications.isSeen": true
        };
        thisNotif = data.idNotif;
        if (data.del === true) {
          if (thisNotif) {
            return User.findByIdAndUpdate(data.idUser, {
              $pull: {
                notifications: {
                  _id: thisNotif
                }
              }
            }).exec(function(err, user) {
              if (err) {
                mailer.cLog('Error at ' + __filename, err);
              }
              return done(true);
            });
          } else {
            return done(true);
          }
        } else {
          return User.findOneAndUpdate({
            _id: data.idUser,
            'notifications._id': thisNotif
          }, {
            $set: {
              'notifications.$.isSeen': true
            }
          }).exec(done);
        }
      },
      gainedXp: function(user, amount, bonus, fromAction) {
        var isBonus, notif, toSelf;
        toSelf = [user._id];
        isBonus = (bonus > 0 ? " (+" + bonus + " xp)" : "");
        notif = {
          idFrom: user._id,
          from: user.local.pseudo,
          link1: "/u/" + user.idCool,
          to: "",
          link2: "",
          icon: "fa fa-plus-square-o",
          title: "You gained " + amount + " xp" + isBonus + ".",
          message: "by " + fromAction
        };
        this.newNotif(toSelf, true, notif);
      },

      /*
      I gained a level,this deserve a notification.
      @param  {[type]} user[description]
      @param  {[type]} newLevel [description]
      @return {[type]}[description]
       */
      gainedLevel: function(user, newLevel) {
        var notif, toSelf;
        toSelf = [user._id];
        notif = {
          idFrom: user._id,
          from: user.local.pseudo,
          link1: "/u/" + user.idCool,
          to: "",
          link2: "",
          icon: "fa fa-arrow-up",
          title: "You have reached level  " + newLevel + "!",
          message: "Congratulation! "
        };
        this.newNotif(toSelf, true, notif);
      },

      /*
      I gained a level,this deserve a notification.
      @param  {[type]} user[description]
      @param  {[type]} newLevel [description]
      @return {[type]}[description]
       */
      askFriend: function(user, to) {
        var notif, toSelf;
        toSelf = [user._id];
        notif = {
          idFrom: user._id,
          from: to.userName,
          link1: "/u/" + to.idCool,
          to: "",
          link2: "",
          icon: "glyphicon glyphicon-heart",
          title: "You have sent a friend request to  " + to.userName + ".",
          message: " "
        };
        this.newNotif(toSelf, true, notif);
      },

      /*
      When the user log in,send a notification to his friends.
      @param  {[type]} user [description]
      @return {[type]} [description]
       */
      login: function(user) {
        var myFriends, notif;
        myFriends = _.map(user.friends, function(num) {
          return num.idUser.toString();
        });
        notif = {
          idFrom: user._id,
          from: user.local.pseudo,
          link1: "/u/" + user.idCool,
          to: "",
          link2: "",
          icon: "",
          title: user.local.pseudo + " just connected.",
          message: ""
        };
        this.newNotif(myFriends, false, notif);
      },

      /*
      When the user log in,send a notification to his friends.
      @param  {[type]} user [description]
      @return {[type]} [description]
       */
      login: function(user) {
        var myFriends, notif;
        myFriends = _.map(user.friends, function(num) {
          return num.idUser.toString();
        });
        notif = {
          idFrom: user._id,
          from: user.local.pseudo,
          link1: "/u/" + user.idCool,
          to: "",
          link2: "",
          icon: "",
          title: user.local.pseudo + " just connected.",
          message: ""
        };
        this.newNotif(myFriends, false, notif);
      },

      /*
      When user logout,notify his friends
      @param  {[type]} user [description]
      @return {[type]} [description]
       */
      logout: function(user) {
        var myFriends, notif;
        myFriends = _.map(user.friends, function(num) {
          return num.idUser.toString();
        });
        notif = {
          idFrom: user._id,
          from: user.local.pseudo,
          link1: "/u/" + user.idCool,
          to: "",
          link2: "",
          icon: "",
          title: user.local.pseudo + " just disconnected.",
          message: ""
        };
        this.newNotif(myFriends, false, notif, false);
      },

      /*
      User X and Y are now friends,so broadcast the news to their respective friends.
      @param  {[type]} newFriends [description]
      @return {[type]}  [description]
       */
      nowFriends: function(newFriends) {
        var friendsFrom, friendsList, friendsTo, from, notif, to;
        from = newFriends[0];
        to = newFriends[1];
        friendsFrom = _.map(from.friends, function(num) {
          return num.idUser.toString();
        });
        friendsTo = _.map(to.friends, function(num) {
          return num.idUser.toString();
        });
        friendsList = _.union(friendsFrom, friendsTo);
        friendsList = _.without(friendsList, from._id.toString(), to._id.toString());
        notif = {
          idFrom: from._id,
          from: from.local.pseudo,
          link1: "/u/" + from.idCool,
          to: to.local.pseudo,
          link2: "/u/" + to.idCool,
          icon: "glyphicon glyphicon-heart",
          title: from.local.pseudo + " is now friend with",
          message: ""
        };
        this.newNotif(friendsList, true, notif);
      },

      /*
      When user X gain a level,it's good to let people know he's became more powerfull
      @param  {[type]} user [description]
      @return {[type]} [description]
       */
      levelUp: function(user) {
        var friends, notif;
        friends = _.map(user.friends, function(num) {
          return num.idUser.toString();
        });
        notif = {
          idFrom: user._id,
          from: user.local.pseudo,
          link1: "/u/" + user.idCool,
          to: "",
          link2: "",
          icon: "fa fa-angle-double-up",
          title: user.local.pseudo + " is now level " + user.level + "!",
          message: ""
        };
        this.newNotif(friends, true, notif);
      },

      /*
      When the user create a challenge,let his friends know
      @param  {[type]} user	[description]
      @param  {[type]} idCool [description]
      @return {[type]}	[description]
       */
      createdChallenge: function(user, idCool) {
        var myFriends, notif;
        myFriends = _.map(user.friends, function(num) {
          return num.idUser.toString();
        });
        notif = {
          idFrom: user._id,
          from: user.local.pseudo,
          link1: "/u/" + user.idCool,
          to: "",
          link2: "/c/" + idCool,
          icon: "glyphicon glyphicon-saved",
          title: user.local.pseudo + " created a new challenge",
          message: "!"
        };
        this.newNotif(myFriends, true, notif);
      },

      /*
      When user X challenge user Y,let their friends know
      @param  {[type]} idChallenger [description]
      @param  {[type]} idChallenged [description]
      @return {[type]}	[description]
       */
      launchChall: function(idChallenger, idChallenged) {
        var not_, _this;
        _this = this;
        not_ = [idChallenger, idChallenged];
        User.findById(idChallenger).exec(function(err, challenger) {
          User.findById(idChallenged).exec(function(err, challenged) {
            var friends, notif;
            notif = void 0;
            friends = _.map(challenger.friends, function(num) {
              return num.idUser.toString();
            });
            friends = _.without(friends, challenged._id.toString());
            notif = {
              type: "challengeReceive",
              idFrom: challenger._id,
              from: challenger.local.pseudo,
              link1: "/u/" + challenger.idCool,
              to: challenged.local.pseudo,
              link2: "/u/" + challenged.idCool,
              icon: "glyphicon glyphicon-flash",
              title: challenger.local.pseudo + " challenged",
              message: ""
            };
            _this.newNotif(friends, true, notif);
            notif = {
              type: "challengeReceive",
              idFrom: challenger._id,
              from: challenger.local.pseudo,
              link1: "/u/" + challenger.idCool,
              to: "",
              link2: "",
              icon: "glyphicon glyphicon-flash",
              title: challenger.local.pseudo + " challenged",
              message: "you !"
            };
            _this.newNotif([idChallenged], true, notif);
            notif = {
              type: "challengeReceive",
              idFrom: challenger._id,
              from: challenger.local.pseudo,
              link1: challenged.idCool,
              title: challenged.local.pseudo + " has been challenged!",
              to: "",
              link2: "",
              message: ""
            };
            _this.newNotif([idChallenger], true, notif);
          });
        });
      },

      /*
      When user Y accept the challenge of user X,let them friends know
      @param  {[type]} idChallenger [description]
      @param  {[type]} idChallenged [description]
      @return {[type]}	[description]
       */
      acceptChall: function(idChallenger, idChallenged) {
        var not_, _this;
        _this = this;
        not_ = [idChallenger, idChallenged];
        User.findById(idChallenger).exec(function(err, challenger) {
          User.findById(idChallenged).exec(function(err, challenged) {
            var friends, notif;
            notif = void 0;
            friends = _.map(challenged.friends, function(num) {
              return num.idUser.toString();
            });
            friends = _.without(friends, challenger._id.toString());
            notif = {
              idFrom: challenged._id,
              from: challenged.local.pseudo,
              link1: "/u/" + challenged.idCool,
              to: challenger.local.pseudo,
              link2: "/u/" + challenger.idCool,
              icon: "glyphicon glyphicon-flash",
              title: challenged.local.pseudo + " accepted a challenge from",
              message: ""
            };
            _this.newNotif(friends, true, notif, not_);
            notif = {
              idFrom: challenger._id,
              from: challenger.local.pseudo,
              link1: challenger.idCool,
              to: challenger.local.pseudo,
              link2: "/u/" + challenger.idCool,
              title: "You accepted a challenge from",
              message: ""
            };
            _this.newNotif([challenged], true, notif);
            notif = {
              idFrom: challenged._id,
              from: challenged.local.pseudo,
              link1: "/u/" + challenged.idCool,
              to: "challenge",
              link2: "",
              title: challenged.local.pseudo + " accepted your",
              message: ""
            };
            _this.newNotif([idChallenger], true, notif);
          });
        });
      },

      /*
      User Y successfully completed the challenge of X,notify people.
      @param  {[type]} challenge [description]
      @return {[type]} [description]
       */
      successChall: function(challenge) {
        var friends, notif;
        friends = _.map(challenge._idChallenged.friends, function(num) {
          return num.idUser.toString();
        });
        notif = {
          idFrom: challenge._idChallenged._id,
          from: challenge._idChallenged.local.pseudo,
          link1: "/u/" + challenge._idChallenged.idCool,
          to: challenge._idChallenge.title,
          link2: "/c/" + challenge._idChallenge.idCool,
          icon: "glyphicon glyphicon-tower",
          title: challenge._idChallenged.local.pseudo + " completed the challenge",
          message: ""
        };
        this.newNotif(friends, true, notif);
        notif = {
          type: "challengeSuccess",
          idFrom: challenge._idChallenger._id,
          from: challenge._idChallenger.local.pseudo,
          link1: "/u/" + challenge._idChallenged.idCool,
          to: challenge._idChallenge.title,
          link2: "/c/" + challenge._idChallenge.idCool,
          icon: "glyphicon glyphicon-tower",
          title: "You have completed the challenge " + challenge._idChallenge.title + " launched by " + challenge._idChallenger.local.pseudo,
          message: ""
        };
        this.newNotif([challenge._idChallenged._id], true, notif);
      },

      /*
      User X rated a challenge he has been involved in,good news to share.
      @param  {[type]} challenge [description]
      @return {[type]} [description]
       */
      ratedChall: function(challenge) {
        var friends, notif;
        friends = _.map(challenge.user.friends, function(num) {
          return num.idUser.toString();
        });
        notif = {
          idFrom: challenge.user._id,
          from: challenge.user.local.pseudo,
          link1: "/u/" + challenge.user.idCool,
          to: challenge.challenge.title,
          link2: "/c/" + challenge.challenge.idCool,
          icon: "glyphicon glyphicon-stats",
          title: challenge.user.local.pseudo + " rated the challenge",
          message: " with a score of " + challenge.note
        };
        this.newNotif(friends, true, notif);
      },

      /*
      A case has been closed. Let the challenger and challenged know about the outcome
      @param  {Object} challenge [Populated Ongoing]
       */
      caseClosed: function(caseClosed) {
        var answer, notif;
        answer = (caseClosed.tribunalAnswered === true ? "validated,congratulation" : "invalidated");
        notif = {
          idFrom: caseClosed._idChallenger._id,
          from: caseClosed._idChallenger.local.pseudo,
          icon: (answer === true ? "fa-thumbs-o-up" : "fa-thumbs-o-down"),
          link1: "/o/" + caseClosed._idChallenge.idCool,
          title: "Tribunal decision on the case " + caseClosed._idChallenge.idCool,
          link2: "",
          to: "",
          message: "The case has been " + answer
        };
        this.newNotif([caseClosed._idChallenged._id, caseClosed._idChallenger._id], true, notif);
        if (caseClosed.tribunalAnswered === true) {
          return this.successChall(caseClosed);
        }
      },
      linkedGame: function(user, gameName) {
        var friends, notif;
        friends = _.map(user.friends, function(num) {
          return num.idUser.toString();
        });
        notif = {
          idFrom: user._id,
          from: user.local.pseudo,
          icon: "fa-link",
          link1: "/u/" + user.idCool,
          title: user.local.pseudo + " linked a " + gameName + " account!",
          link2: "",
          to: "",
          message: ""
        };
        return this.newNotif(friends, true, notif);
      }
    };
  };

}).call(this);
