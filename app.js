var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

var app = express();
var menuJSON = { text : ""};
var url = 'http://heutemittag.at/index.php?site=tagesmenu&vars=lokal_id=17';

exports = module.exports = app;

// error handler
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(400).send(err.message);
});

request(url, function(error, response, html){

    // First we'll check to make sure no errors occurred when making the request
	if(!error){
        // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality
		var $ = cheerio.load(html);
		// Finally, we'll define the variables we're going to capture

        var menu1, menu2;

        $('.margintop').filter(function(){
        	$('')
        	// Let's store the data we filter into a variable so we can easily see what's going on.
			var data = $(this);

        	// In examining the DOM we notice that the title rests within the first child element of the header tag. 
        	// Utilizing jQuery we can easily navigate and get the text by writing the following code:
			menu1 = data.children().first().first().last().text();
			menu2 = data.children().first().last().last().text();

            // Once we have our menues, we'll store it to the our json object.
            console.log("writing" + menu1 + menu2 + "to slack");
			// menuJSON.text = menu1 + menu2; //menu1;

			//send data to slack
			request({
    			url: 'https://hooks.slack.com/services/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', //webhook url
    			method: 'POST',
    			//post menuJson
    			json: menuJSON
			}, function(error, response, body){
    			if(error) {
        			console.log(error);
    			} else {
        			console.log(response.statusCode, body);
				}
			});
        })
    }
})