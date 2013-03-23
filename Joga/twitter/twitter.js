/*
 * @author: Thomas Plaindoux
 * @original script: Antoine de Chevigné
 * @Script credentials: https://github.com/AvianFlu/ntwitter
 * 
 * @todo tranform for web-based queries (form)
 * @todo add Database storage and filtering
 */


var twitter = require('ntwitter');
var config = require('./config.json');

/*-------------------------------*
 *          = OUTPUT = 
 *-------------------------------*
 created_at:(date),
 id:(int),
 text: (string),
 user:{
 id:(int),
 name:(string),
 screen_name:(string),
 location:(string),
 followers_count:(int),
 friends_count:(int),
 created_at:(date),
 verified:(boolean),
 statuses_count:(int),
 profile_image_url: (string),
 profile_banner_url:(string),
 },
 retweet_count:(int)
 *-------------------------------*/

var twit = new twitter({
    consumer_key: config.key,
    consumer_secret: config.secret,
    access_token_key: config.tokenKey,
    access_token_secret: config.tokenSecret
});

twit.stream('statuses/filter', {'track': config.query}, function(stream) {

    stream.on('data', function(data) {
        console.log(data);
    });

    // Disconnect stream after a defined duration
    setTimeout(stream.destroy, config.listeningTime);
});
