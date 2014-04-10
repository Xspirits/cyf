database = require("./database")
auth = require("./auth")
# Note: The upload on IMGUR is done front-end side
# imgur = require("imgur-node-api")
# imgur.setClientID database.imgurClientId
googleapis = require("googleapis")
OAuth2 = googleapis.auth.OAuth2
oauth2Client = new OAuth2(database.google.client_email, database.google.client_secret, auth.cyf.app_domain)


exports.googleUrl = (url, callback) ->
  googleapis.discover("urlshortener", "v1").execute (err, client) ->
    oauth2Client.credentials =
      access_token: database.google.access_token
      refresh_token: database.google.refresh_token

    client.urlshortener.url.insert(longUrl: url).withAuthClient(oauth2Client).execute (err, result) ->
      
      #  result : { kind: 'urlshortener#url', id: 'http://goo.gl/VGZiNo', longUrl: 'http://i.imgur.com/cYi0SI9.png' }  
      console.log err  if err
      callback result.id
      return

    return

  return