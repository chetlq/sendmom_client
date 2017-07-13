
'use strict';
var Alexa = require("alexa-sdk");
var axios = require('axios');



exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    //alexa.appId = appId;
    //alexa.dynamoDBTableName = 'highLowGuessUsers';
    alexa.registerHandlers(newSessionHandlers, guessModeHandlers, startGameHandlers, guessAttemptHandlers);
    alexa.execute();
};

var states = {
    GUESSMODE: '_GUESSMODE', // User is trying to guess the number.
    STARTMODE: '_STARTMODE',  // Prompt the user to start or restart the game.
	ENDMODE: '_ENDMODE',
};

var newSessionHandlers = {
    'NewSession': function() {
        this.handler.state = states.STARTMODE;
        this.emit(':ask', 'Welcome to Sberbank. Say the nickname of the recipient');
            //'Say yes to start the game or no to quit.
    }
};

var startGameHandlers = Alexa.CreateStateHandler(states.STARTMODE, {
    'NewSession': function () {
        this.emit('NewSession'); // Uses the handler in newSessionHandlers
    },
    'AMAZON.HelpIntent': function() {
        var message = 'Tell the name of the recipient';
        this.emit(':ask', message, message);
    },
   /* */
"MyIntent": function () {
		var self = this;
      //this.handler.state = states.GUESSMODE;
     //this.attributes['name'] = this.event.request.intent.slots.MySlot.value;
     //this.emit(':ask', 'Myitem', 'Try saying a number.');
	 var e = this.event.request.intent.slots.MySlot.value;
	 if((e===undefined)||(e===null)){
		 self.handler.state = states.STARTMODE;
		 self.emit(':ask', 'Repeat the name of the recipient', 'Repeat the name of the recipient');}
	 else{


    foo2(e).then(function(res){
      if (res==200){
      self.handler.state = states.GUESSMODE;
      self.attributes['name'] = e;
      self.emit(':ask', 'Great! ' + 'Try saying the transfer amount to start the remittance.', 'Try saying a number.');

      console.log(res);
    }
    else{
      self.handler.state = states.STARTMODE;
      self.emit(':ask', 'Repeat the name of the recipient', 'Repeat the name of the recipient');
    }

    });

      }
	},

    "AMAZON.StopIntent": function() {
      console.log("STOPINTENT");
      this.emit(':tell', "Goodbye!");
    },
    "AMAZON.CancelIntent": function() {
      console.log("CANCELINTENT");
      this.emit(':tell', "Goodbye!");
    },
    'SessionEndedRequest': function () {
        console.log("SESSIONENDEDREQUEST");
        //this.attributes['endedSessionCount'] += 1;
        this.emit(':tell', "Goodbye!");
    },
    'Unhandled': function() {
        console.log("UNHANDLED");
        var message = 'Repeat the name of the recipient.';
        this.emit(':ask', message, message);
    }
});



var guessModeHandlers = Alexa.CreateStateHandler(states.GUESSMODE, {
    'NewSession': function () {

        this.handler.state = '';
        this.emitWithState('NewSession'); // Equivalent to the Start Mode NewSession handler
    },
    'NumberGuessIntent': function() {
     //var name = this.attributes['name'] ;
     //var number = parseInt(this.event.request.intent.slots.number.value);
var st_number = this.event.request.intent.slots.number.value;
var number=parseInt(st_number);
if(((typeof number)==="number")&&(st_number!=="?"))
{
      //var self = this;
      //foo().then(function(res){
       // self.emit(':tell', res.toString());
      //});
	  this.attributes['amount'] = st_number;
	  this.attributes['num_amount'] = number;
	  this.handler.state = states.ENDMODE;
        var message = "The recipient of money is "+this.attributes['name']
						+". The amount of money transfer is "+this.attributes['amount']+
						". Say yes to start the remittance or no to quit";
        this.emit(':ask', message, message);
      }
      else {
        this.emit(':ask', 'Try saying a number', 'Try saying a number');
      }

    },

    'AMAZON.HelpIntent': function() {
        this.emit(':ask', 'I can get of a number between zero and maximum on your bank account', 'Try saying a number.');
    },
    "AMAZON.StopIntent": function() {
        console.log("STOPINTENT");
      this.emit(':tell', "Goodbye!");
    },
    "AMAZON.CancelIntent": function() {
        console.log("CANCELINTENT");
    },
    'SessionEndedRequest': function () {
        console.log("SESSIONENDEDREQUEST");
        this.attributes['endedSessionCount'] += 1;
        this.emit(':tell', "Goodbye!");
    },
	'Unhandled': function () {
      //  this.handler.state = states.GUESSMODE;
   this.emit(':ask', 'Sorry, I didn\'t get that. Try saying a number.', 'Try saying a number.');



	},
    'NotANum': function() {
        this.emit(':ask', 'Sorry, I didn\'t get that. Try saying a number.', 'Try saying a number.');
    }
});

// These handlers are not bound to a state
var guessAttemptHandlers = Alexa.CreateStateHandler(states.ENDMODE, {
'AMAZON.YesIntent': function() {
  var self = this;
foo(this.attributes['name'],this.attributes['num_amount'])
.then(function(res){
        if(res == 200) {

          self.emit(':tell', "Transfer was successful. Goodbye!");
          this.attributes['endedSessionCount'] += 1;

        }
        else
        {
          self.emit(':tell', "Transfer was unsuccessful");
          this.attributes['endedSessionCount'] += 1;
        }
      })
      .catch(function(e) {
  // Функция не перевыбросила исключение 'e'
  // в результате произойдёт resolve(undefined)
  // для Promise, возвращённого функцией catch
  self.emit(':tell', "Error");
  this.attributes['endedSessionCount'] += 1;
  console.log(e); // "oh, no!"
});
},

    'AMAZON.NoIntent': function() {
        console.log("NOINTENT");
        this.emit(':tell', 'Money transfer was not successful. See you next time!');
    },
	"AMAZON.StopIntent": function() {
      console.log("STOPINTENT");
      this.emit(':tell', "Money transfer was not successful.Goodbye!");
    },
    "AMAZON.CancelIntent": function() {
        console.log("CANCELINTENT");
		this.emit(':tell', "Money transfer was not successful.Goodbye!");
    },

	    'Unhandled': function() {
        console.log("UNHANDLED");
        var message = 'Say yes to start the remittance or no to quit';
        this.emit(':ask', message, message);
    }

});

var foo =function (myname,amount) {
return axios.post('https://sbertech.herokuapp.com/transfers', { nick: myname ,transfer_amount: amount } )
            .then( function (response){return response.status;} );
};


 function foo2(name) {
return axios.get('https://sbertech.herokuapp.com/users/'+name.toLowerCase())
            .then( function (response){
              if(response.data===null) {return 400;}
              else {
                return response.status
              }} )
              .catch(function(e){
                return 404;
              });
};
