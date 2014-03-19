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
 	'connect.game' 		: 100,
 	'user.register' 	: 55,
 	'user.newFriend'    : 60,
 	'challenge.create'  : 110,
 	'challenge.rate'    : 60,
 	'ongoing.accept'    : 60,
 	'ongoing.validate'  : 200,
 	'ongoing.succeed'  	: 330,
 	'tribunal.vote' 	: 80
 };

 const xpRewardAction = {
 	'connect.game' 		: 'linking a game account',
 	'user.register' 	: 'creating an account',
 	'user.newFriend'   	: 'making a new friend',
 	'challenge.create' 	: 'creating a new challenge',
 	'challenge.rate'   	: 'rating a challenge',
 	'ongoing.accept'   	: 'accepting a challenge',
 	'ongoing.validate' 	: 'validating a challenge',
 	'ongoing.succeed'  	: 'completing successfully a challenge',
 	'tribunal.vote'    	: 'voting on a case in the Tribunal'
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

 module.exports = function(sio){

 	return {

 	/**
 	 * Return the value of an action
 	 * @param  {[type]} action [description]
 	 * @return {[type]}        [description]
 	 */
 	 getValue : function(action){
 	 	return _.values(_.pick(xpRewardvalue, action))[0]
 	 },
 	 isUp : function(xp, level) { 
 	 	var curLvL = level;

 	 	var xpNeeded = getXp(curLvL + 1)
 	 	, bugCheck = getXp(curLvL + 2);
 	 	var nextXpReq = xpNeeded - xp;

 	 	console.log('Test ( '+curLvL+' to '+( curLvL + 1)+'): ?' +xp + ' <  ' + xpNeeded + ' || bugCheck  ( '+curLvL+' to '+( curLvL + 2)+')? ' +xp + ' <  ' + bugCheck);

 	 	if(xp > xpNeeded) {
 	 		nextXpReq = bugCheck - xp;

 	 		if(xp > bugCheck) {
 	 			var flatten = getLevel(xp) - curLvL;
 	 			nextXpReq = getXp(flatten+curLvL) - xp;
 	 			console.log(xp +' > ' +bugCheck + ' ==> ' + xpNeeded +' inc '+curLvL+' of ' + flatten);

 				return [flatten, nextXpReq]; // $inc of the difference to make the level up to date
 			}
 			else
 				return [1, nextXpReq];
 		}
 		else
 			return [false, nextXpReq];
 	},

 	xpReward : function(user, action, bonus) {

 		var userDoubleXp = user.xpDouble ? true : false	
 		, bonus = (bonus ? bonus : 0)
 		, value = (_.values(_.pick(xpRewardvalue, action))[0] * (userDoubleXp ? 2 : 1 )) + bonus
 		, uXp     = user.xp
 		, uLvl    = user.level;

 		var valueNext  = getXp(uLvl + 1)
 		, valueNext2  = getXp(uLvl + 2)
 		, newXp = uXp + value;

 		var levelUp = this.isUp(newXp, uLvl);

 		console.log('add ' + value+ ' (bonus: '+bonus+') to xp ' + uXp + ' lvl ' + uLvl + '(Lvl + 1 = '+valueNext+')[ to reach : '+levelUp[1]+'] [levelUp]? ' + levelUp[0] + ' [XP x2]' + userDoubleXp);

 		var inc = levelUp[0] ? { level : levelUp[0], xp : value, 'daily.xp' : value, 'daily.level' : levelUp[0], 'weekly.xp' : value, 'weekly.level' : levelUp[0], 'monthly.xp' : value, 'monthly.level' : levelUp[0] } : { xp : value, 'daily.xp' : value, 'weekly.xp' : value, 'monthly.xp' : value } ;

 		User
 		.findByIdAndUpdate(user._id, { $inc: inc, $set: {xpNext : levelUp[1]} })
 		.exec(function (err, userUpdated) {

 			if(err)
 				throw err;

 			var text = _.values(_.pick(xpRewardAction, action))[0];

 			if(levelUp[0]) {
 				notifs.gainedLevel(userUpdated, uLvl + 1);
 				notifs.levelUp(userUpdated);
 				sio.glob('fa fa-angle-double-up',' <a href="/u/'+userUpdated.idCool+'">'+userUpdated.local.pseudo + '</a> is now level '+ userUpdated.level +' <i class="fa fa-exclamation"></i>');
 			}

 			notifs.gainedXp(userUpdated, value, bonus, text);

 			//endpoint :(
 			return 'woo';
 	});
 	},
 }
}
