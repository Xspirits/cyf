/**
 *  Let's define our raw formulas
 * 
 * xpFormula = (level^2+level)/2*100-(level*100),
 * levelFormula = (sqrt(100(2 xp +25))+50)/100,
 * 
 */
 var User = require('../models/user')
 , _      = require('underscore')
 , notifs = require('./notifications');

 const xpRewardvalue = {
 	'user.register' : 55,
 	'user.newFriend'   : 60,
 	'challenge.create' : 110,
 	'challenge.rate'   : 60,
 	'ongoing.accept'   : 60,
 	'ongoing.validate' : 200,
 	'ongoing.succeed'  : 330,
 	'tribunal.vote' 	: 80
 };

 const xpRewardAction = {
 	'user.register' : 'creating an account',
 	'user.newFriend'   : 'making a new friend',
 	'challenge.create' : 'creating a new challenge',
 	'challenge.rate'   : 'rating a challenge',
 	'ongoing.accept'   : 'accepting a challenge',
 	'ongoing.validate' : 'validating a challenge',
 	'ongoing.succeed'  : 'completing successfully a challenge',
 	'tribunal.vote'    : 'voting on a case in the Tribunal'
 };

 var getLevel = function(xp) { 

 	var process = Math.round( (Math.sqrt( 100*( 2*xp + 25 ) )+ 50 )/100 );

 	return process;
 }
 , getXp      = function(level) { 

 	var process = ((( Math.pow(level,2) + level )/2 )*100 )-( level *100 );

 	console.log('processing lvl ' + level +' ... Required xp : ' +process);
 	return process;
 };

 module.exports = {	

 	isUp : function(xp, level) { 
 		var curLvL = level;

 		var xpNeeded = getXp(curLvL + 1)
 		, bugCheck = getXp(curLvL + 2);

 		console.log('Test ( '+curLvL+' to '+( curLvL + 1)+'): ?' +xp + ' <  ' + xpNeeded + ' || bugCheck  ( '+curLvL+' to '+( curLvL + 2)+')? ' +xp + ' <  ' + bugCheck);

 		if(xp > xpNeeded) {

 			if(xp > bugCheck) {
 				var flatten = getLevel(xp) - curLvL;

 				console.log(xp +' > ' +bugCheck + ' ==> ' + xpNeeded +' inc '+curLvL+' of ' + flatten);

 				return flatten; // $inc of the difference to make the level up to date
 			}
 			else
 				return 1;
 		}
 		else
 			return false; 
 	},

 	xpReward : function(user, action) {

 		var value = _.values(_.pick(xpRewardvalue, action))[0]
 		, uXp     = user.xp
 		, uLvl    = user.level;

 		var valueNext  = getXp(uLvl + 1)
 		, newXp = uXp + value;

 		var levelUp = this.isUp(newXp, uLvl);

 		console.log('add ' + value+ ' to xp ' + uXp + ' lvl ' + uLvl + '('+valueNext+') [levelUp]? ' + levelUp);

 		var inc = levelUp ? { level : levelUp, xp : value, xpNext : valueNext } : { xp : value, xpNext : valueNext } ;


 		User
 		.findByIdAndUpdate(user._id, { $inc: inc } )
 		.exec(function (err, userUpdated) {

 			if(err)
 				throw err;

 			var text = _.values(_.pick(xpRewardAction, action))[0];

 			if(levelUp) {
 				notifs.gainedLevel(userUpdated, uLvl + 1);
 				notifs.levelUp(userUpdated);
 			}

 			notifs.gainedXp(userUpdated, value, text);

 			return 'woo)';
 	});
 	},

 }