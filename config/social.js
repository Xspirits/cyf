var https = require('https')
, request = require('request')
, auth    = require('./auth')
, RiotApi = require('../app/functions/riot-api')
, _       = require('underscore');

var api   = new RiotApi(auth.leagueoflegend.key);

exports.findSummonerLol = function(region , name, callback) {
    var region, name, url
    , buffer = {};

    api.getSummoner({
        'region': region,
        'summonerName': name
        //-OR-'summonerId': 60783
    }, function(data) {

        buffer = _.values(data)[0];
        callback(buffer);
    });
}


exports.getFbData = function(accessToken, apiPath, callback) {
    var options = {
        host: 'graph.facebook.com',
        port: 443,
        path: apiPath + '?access_token=' + accessToken, 
        method: 'GET'
    };

    var buffer = '';
    var request = https.get(options, function(result){
        result.setEncoding('utf8');
        result.on('data', function(chunk){
            buffer += chunk;
        });

        result.on('end', function(){
            callback(buffer);
        });
    });

    request.on('error', function(e){
        console.log('error from facebook.getFbData: ' + e.message)
    });

    request.end();
}

exports.postTwitter = function(accessToken, message, callback) {
    var url = 'https://api.twitter.com/1.1/statuses/update.json';

    var params = {
        consumer_key: auth.twitterAuth.consumerKey,
        consumer_secret: auth.twitterAuth.consumerSecret,
        token: accessToken.token,
        token_secret: accessToken.tokenSecret
    };

    var r = request.post({url:url, oauth:params}, function(err, resp, body) {
      if (err) return console.error("Error occured: ", err);
      body = JSON.parse(body);
      if (body.error) return console.error("Error returned from facebook: ", body.error);

      callback(body);
  });

    var form = r.form();
    form.append("status", message);


}
exports.postFbMessage = function(accessToken, message, link, callback) {

    var url = 'https://graph.facebook.com/me/feed';
    /*
    picture Determines the preview image associated with the link. string
    name Overwrites the title of the link preview. string
    caption Overwrites the caption under the title in the link preview. string
    description Overwrites the description in the link preview string
    */
    var params = {
        access_token: accessToken,
        link : 'https://graph.facebook.com/',
        name : message.title,
        description: message.body
    };

    // callback('TO ENABLE GOTO social.js Line 30');
    request.post({url: url, qs: params}, function(err, resp, body) {

      if (err) return console.error("Error occured: ", err);
      body = JSON.parse(body);
      if (body.error) return console.error("Error returned from facebook: ", body.error);

      callback(JSON.stringify(body, null, '\t'));
  }
  );

}