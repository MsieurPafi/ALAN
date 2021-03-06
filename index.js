var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

// Server frontpage
app.get('/', function (req, res) {
    res.send('This is TestBot Server');
});

// Facebook Webhook
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === 'testbot_verify_token') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});

// generic function sending messages
function sendMessage(recipientId, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};

// handler receiving messages
app.post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging;
    console.log("Message received");
    for (i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.message && event.message.text) {
		    if (!kittenMessage(event.sender.id, event.message.text) && !testChoice(event.sender.id, event.message.text)) {
		        sendMessage(event.sender.id, {text: "Echo: " + event.message.text});
                console.log("Message : ' " + JSON.stringify(event.message.text) + " ' echoed to user : " + event.sender.id);
		    }
		} else if (event.postback) {
            var contentPostback = JSON.stringify(event.postback);
		    console.log("Postback received: " + contentPostback);
            if(contentPostback == "try Postback" ){
                tryPostback(event.sender.id);
            }
		// }else if(i < 1){
  //           welcomeMessage;
        }
    }
    res.sendStatus(200);
});

//send welcome message
// function welcomeMessage(){
//     message = {
//         "text":"Welcome to My Company!",
//       }

//     sendMessage(event.sender.id, message);
// }

//try postback calls
function tryPostback(recipientId){

    var mapUrl = "https://www.google.fr/maps/place/Sarthe/@48.0262663,-0.3261341,9z/data=!3m1!4b1!4m5!3m4!1s0x47e2896ea23f12bb:0x30d37521e092a00!8m2!3d47.9217014!4d0.1655803?hl=en";

    message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Map",
                            "subtitle": "Une petite carte de la Sarthe",
                            "image_url": mapUrl ,
                            "buttons": [{
                                "type": "web_url",
                                "url": mapUrl,
                                "title": "Afficher la carte"
                                }, {
                                "type": "postback",
                                "title": "I like this",
                                "payload": "User " + recipientId + " likes Sarthe",
                            }]
                        }]
                    }
                }
            };

    sendMessage(recipientId, message);

    return true;
}

// send rich message with kitten
function kittenMessage(recipientId, text) {
    
    text = text || "";
    var values = text.split(' ');
    
    if (values.length === 3 && values[0] === 'kitten') {
        if (Number(values[1]) > 0 && Number(values[2]) > 0) {
            
            var imageUrl = "https://placekitten.com/" + Number(values[1]) + "/" + Number(values[2]);
            
            message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": "Kitten",
                            "subtitle": "Cute kitten picture",
                            "image_url": imageUrl ,
                            "buttons": [{
                                "type": "web_url",
                                "url": imageUrl,
                                "title": "Show kitten"
                                }, {
                                "type": "postback",
                                "title": "I like this",
                                "payload": "User " + recipientId + " likes kitten " + imageUrl,
                            }]
                        }]
                    }
                }
            };
    
            sendMessage(recipientId, message);
            
            return true;
        }
    }
    
    return false;
    
};

function testChoice(recipientId, text){
	text = text || "";
	if(text === 'Que puis-je faire'){
		message ={
		    "attachment":{
		      "type":"template",
		      "payload":{
		        "template_type":"button",
		        "text":"Que voulez-vous faire ?",
		        "buttons":[
		          {
		            "type":"web_url",
		            "url":"https://bouquetco.me",
		            "title":"Allez sur le site"
		          },
		          {
		            "type":"postback",
		            "title":"Commencer à discuter",
		            "payload":"User " + recipientId + " wants to discuss",
		          },
                  {
                    "type":"postback",
                    "title":"Tester les postback",
                    "payload":"try Postback",
                  }
		        ]
		      }
		    }
		  };
		sendMessage(recipientId, message);

		return true;
	}

	return false;
}

  
