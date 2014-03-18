var database = require('./database')
, imgur = require('imgur-node-api')
, googleapis = require('googleapis')
, OAuth2 = googleapis.auth.OAuth2;

imgur.setClientID(database.imgurClientId);


var oauth2Client = new OAuth2(database.google.client_email, database.google.client_secret, 'http://localhost:8080');
exports.googleUrl = function(url, callback) {

    googleapis
    .discover('urlshortener', 'v1')
    .execute(function(err, client) {

        oauth2Client.credentials = {
            access_token: database.google.access_token,
            refresh_token:  database.google.refresh_token
        };

        client.urlshortener.url
        .insert({ longUrl: url })
        .withAuthClient(oauth2Client)
        .execute(function(err, result) {
            /*  result : { kind: 'urlshortener#url', id: 'http://goo.gl/VGZiNo', longUrl: 'http://i.imgur.com/cYi0SI9.png' }  */
            if(err)
                console.log(err)

            callback(result.id);
        });
    });
}