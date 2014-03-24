
module.exports = (mandrill_client, keys, moment) ->

	accountConfirm: (user, callback) ->

		# preparing bash email
		emailList = [
			email: user.local.email
			name: user.local.pseudo
			type: "to"
		]
		gotoUrl = keys.cyf.domain + '/eval/'+ user.verfiy_hash
		  
		message =
		  html: "<h2>" + user.local.pseudo + ", one final step remain!</h2><p> To become a true challenger one does not simply only create an account but proves himself as a human being!</p><p>Please confirm your email by clicking <a href='" + gotoUrl + "' title=''>here</a></p><p> You can also copy/past the following link in your browser: " + gotoUrl + "</p>"
		  # text: "Example text content"
		  subject: user.local.pseudo + " please confirm your email adress to become a true challenger!"
		  from_email: keys.support.email
		  from_name: keys.support.name
		  to: emailList
		  headers:
		    "Reply-To": keys.support.email

		  important: true
		  preserve_recipients: true
		  tags: ["account-confirmation"]
		  metadata:
		    website: keys.cyf.domain

		mandrill_client.messages.send
		  message: message
		  async: false
		, ((result) ->
		  console.log result
		  callback result
		  return

		#
		#    [{
		#            "email": "recipient.email@example.com",
		#            "status": "sent",
		#            "reject_reason": "hard-bounce",
		#            "_id": "abc123abc123abc123abc123abc123"
		#        }]
		#    
		), (e) ->
		  
		  # Mandrill returns the error as an object with name and message keys
		  console.log "A mandrill error occurred: " + e.name + " - " + e.message
		  return