https   = require("https")
request = require("request")
auth    = require("./auth")
RiotApi = require('irelia')
_       = require("underscore")
riotApi  = new RiotApi({host: 'prod.api.pvp.net',path: '/api/lol/',key: auth.leagueoflegend.key,debug: true});

exports.findSummonerLol = (region, name, callback) ->
  console.log region
  console.log name
  riotApi.getSummonerByName region,name, (err, summoner) ->
    throw err if err
    summoner = _.values(summoner)[0]
    callback summoner

exports.getFbData = (accessToken, apiPath, callback) ->
  options =
    host: "graph.facebook.com"
    path: apiPath + "?access_token=" + accessToken
    method: "GET"

  buffer = ""
  request = https.get(options, (result) ->
    result.setEncoding "utf8"
    console.log result
    result.on "data", (chunk) ->
      buffer += chunk
      return

    result.on "end", ->
      callback buffer
      return

    return
  )
  request.on "error", (e) ->
    console.log "error from facebook.getFbData: " + e.message
    return

  request.end()
  return

exports.postTwitter = (accessToken, message, callback) ->
  url = "https://api.twitter.com/1.1/statuses/update.json"
  unless accessToken
    params =
      consumer_key: auth.twitterAuth.consumerKey
      consumer_secret: auth.twitterAuth.consumerSecret
      token: auth.twitterCyf.token
      token_secret: auth.twitterCyf.tokenSecret
  else
    params =
      consumer_key: auth.twitterAuth.consumerKey
      consumer_secret: auth.twitterAuth.consumerSecret
      token: accessToken.token
      token_secret: accessToken.tokenSecret

  r = request.post(
    url: url
    oauth: params
  , (err, resp, body) ->
    return console.error("Error occured: ", err)  if err
    body = JSON.parse(body)
    return console.error("Error returned from  twitter: ", body.error)  if body.error
    console.log body
    return callback body
  )
  form = r.form()
  form.append "status", message
  return

exports.postFbMessage = (accessToken, message, link, callback) ->
  url = "https://graph.facebook.com/me/feed"
  
  #
  #    picture Determines the preview image associated with the link. string
  #    name Overwrites the title of the link preview. string
  #    caption Overwrites the caption under the title in the link preview. string
  #    description Overwrites the description in the link preview string
  #    
  params =
    access_token: accessToken
    link: "https://graph.facebook.com/"
    name: message.title
    description: message.body

  
  # callback('TO ENABLE GOTO social.js Line 30');
  request.post
    url: url
    qs: params
  , (err, resp, body) ->
    return console.error("Error occured: ", err)  if err
    body = JSON.parse(body)
    return console.error("Error returned from facebook: ", body.error)  if body.error
    callback JSON.stringify(body, null, "\t")

exports.updateWall = (message, callback) ->
  url = "https://graph.facebook.com/"+auth.facebookPage.id+"/feed"
  
  # Get page accss token here: https://developers.facebook.com/tools/explorer
  #    
  params =
    access_token: auth.facebookPage.accessToken
    link: "https://www.cyf-app.co"
    name: message.title
    description: message.body

  
  # callback('TO ENABLE GOTO social.js Line 30');
  request.post
    url: url
    qs: params
  , (err, resp, body) ->
    return console.error("Error occured: ", err)  if err
    body = JSON.parse(body)
    return console.error("Error returned from facebook: ", body.error)  if body.error
    callback JSON.stringify(body, null, "\t")