
// load up the user model
var User  = require('../app/models/user'),
Challenge = require('../app/models/challenge');

module.exports = {


	/**
	 * Return the current pending requests for a given user
	 * @param  {String}   idUser [user's id]
	 * @param  {Function} done   [description]
	 * @return {Object}          [List of ongoing requests]
	 */
	 getPending : function (idUser, done ) {

	 	Relation
	 	.findOne({'idUser' : idUser})
	 	.exec( function (err, data) {
	 		if(err)
	 			throw err;
	 		
	 		console.log(data);
	 		//return an array of objects
	 		return done(data.pendingRequests);
	 	});
	 },
	/**
	 * Create or update a relation with either a sending invite or pending one
	 * @param  {String}   from       [id of the sender]
	 * @param  {String}   to         [id of the receiver]
	 * @param  {Boolean}   thisIsSend [true or false]
	 * @param  {Function} done       [callback]
	 * @return {Boolean}              [true or false]
	 */
	 create : function (from, to, thisIsSend, done) {
	 	//Check if the relation exist or not.
	 	//
	 	if(thisIsSend) {

	 		User
	 		.findByIdAndUpdate(from.id,{ sentRequests : [{ idUser : to.id,idCool : to.idCool, userName : to.userName }]}, {upsert:true}, function(err, relation) {

	 			if(err)
	 				throw err;

	 			console.log('Pending: '+thisIsSend+' relation updated');
	 			done(true);

	 		});
	 	}
	 	else {

	 		User
	 		.findByIdAndUpdate(from.id,{ pendingRequests : [{ idUser : to.id,idCool : to.idCool, userName : to.userName }]}, {upsert:true}, function(err, relation) {

	 			if(err)
	 				throw err;

	 			console.log('Pending: '+thisIsSend+' relation updated');
	 			done(true);

	 		});
	 	}
	 },

	/**
	 * Accept a relation: add a new row and delete the pending ones
	 * @param  {[type]}   from [description]
	 * @param  {[type]}   to   [description]
	 * @param  {Function} done [description]
	 * @return {[type]}        [description]
	 */
	 acceptRelation : function (from, to, done) {

	 	User
	 	.findByIdAndUpdate(from.id,
	 		{ $pull: { sentRequests : { idUser : to.id }},
	 		friends : [{ idUser : to.id, idCool : to.idCool, userName : to.userName }] },
	 		{upsert:true},
	 		function(err, relation) {

	 			if(err)
	 				throw err;
	 			console.log(relation);
	 			console.log('Pending: relation updated  idUser :'+ from.id);

	 			User
	 			.findByIdAndUpdate(to.id,
	 				{ $pull: { pendingRequests : { idUser : from.id }}, 
	 				friends : [{ idUser : from.id ,idCool : to.idCool, userName : from.userName }] }, 
	 				{upsert:true},
	 				function(err, relation) {

	 					if(err)
	 						throw err;
	 					console.log(relation);
	 					console.log('Pending: relation updated  idUser :'+ from.id);
	 					done(true);
	 				});
	 		});

	 },

	 cancelRelation : function (from, to, done) {

	 	User
	 	.findByIdAndUpdate(from.id,{ $pull: { pendingRequests : { idUser : to.id }}}, function(err, relation) {

	 		if(err)
	 			throw err;
	 		console.log('Pending: relation canceled');

	 		User
	 		.findByIdAndUpdate(to.id,{ $pull: { sentRequests : { idUser : from.id }} }, function(err, relation) {

	 			if(err)
	 				throw err;

	 			console.log('Pending: relation canceled');
	 			done(true);

	 		});
	 	});

	 },

	/**
	 * Deny a relation: delete the pending one from whom denied it.
	 * @param  {[type]}   from [description]
	 * @param  {[type]}   to   [description]
	 * @param  {Function} done [description]
	 * @return {[type]}        [description]
	 */
	 denyRelation : function (from, to, done) {

	 	User
	 	.findByIdAndUpdate(to.id,{ $pull: { sentRequests : { idUser : from.id }} }, function(err, relation) {

	 		if(err)
	 			throw err;
	 		console.log('Pending: relation updated');
	 		done(true);
	 	});
	 },
	};