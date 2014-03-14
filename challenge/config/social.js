var https = require('https')
, request = require('request');

exports.getFbData = function(accessToken, apiPath, callback) {
    var options = {
        host: 'graph.facebook.com',
        port: 443,
        path: apiPath + '?access_token=' + accessToken, //apiPath example: '/me/friends'
        method: 'GET'
    };

    var buffer = ''; //this buffer will be populated with the chunks of the data received from facebook
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

    callback('TO ENABLE GOTO social.js Line 30');
    //request.post({url: url, qs: params}, function(err, resp, body) {

    //   if (err) return console.error("Error occured: ", err);
    //   body = JSON.parse(body);
    //   if (body.error) return console.error("Error returned from facebook: ", body.error);

    //   callback(JSON.stringify(body, null, '\t'));
    //   }
   //);

}