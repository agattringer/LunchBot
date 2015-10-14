var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var cron = require('cron');

var app = express();
var menuJSON = { text : ""};
var url = 'http://heutemittag.at/index.php?site=tagesmenu&vars=lokal_id=17';

exports = module.exports = app;

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

// error handler
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(400).send(err.message);
});


app.listen(server_port, server_ip_address, function () {
  console.log( "Listening on " + server_ip_address + ", port " + server_port);
});

var cronJob = cron.job("00 18 18 * * 1-5", function(){ //daily on weekdays at 18:18+4
    request(url, function(error, response, html){

    // First we'll check to make sure no errors occurred when making the request
	if(!error){
        // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality
		var $ = cheerio.load(html);
		// Finally, we'll define the variables we're going to capture
		var headline = "*Today's menu at Campina:*"
		//css 
		var starter = $('.margintop tr:nth-child(1) b:nth-child(1)').text();
		var mainCourse1 = $('.margintop tr:nth-child(1) b:nth-child(3)').text();
		var mainCourse2 = $('.margintop tr+ tr b:nth-child(3)').text();
		var dessert = $('.margintop tr:nth-child(1) b:nth-child(5)').text();

		console.log(starter);
		console.log(mainCourse1);
		console.log(mainCourse2);
		console.log(dessert);
		//Format stuff for beautiful displaying in slack :)
		menuJSON.text = headline + "\n" + starter + "\n ----------\n" + mainCourse1 + "\n" + mainCourse2 + "\n ----------\n" + dessert; //write data to json;

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
    }
})
    console.info('cron job completed');
}); 

cronJob.start();