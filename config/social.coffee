https   = require("https")
request = require("request")
auth    = require("./auth")
RiotApi = require("../app/functions/riot-api")
_       = require("underscore")
api     = new RiotApi(auth.leagueoflegend.key)

exports.findSummonerLol = (region, name, callback) ->
  region = undefined
  name = undefined
  url = undefined
  buffer = {}
  api.getSummoner
    region: region
    summonerName: name  #-OR-'summonerId': 60783
  , (data) ->
    buffer = _.values(data)[0]
    callback buffer
    return

  return

exports.getFbData = (accessToken, apiPath, callback) ->
  options =
    host: "graph.facebook.com"
    port: 443
    path: apiPath + "?access_token=" + accessToken
    method: "GET"

  buffer = ""
  request = https.get(options, (result) ->
    result.setEncoding "utf8"
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
    return console.error("Error returned from facebook: ", body.error)  if body.error
    callback body
    return
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
    return

  return