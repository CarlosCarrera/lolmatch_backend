/**
* GameController
*
* @description :: Server-side logic for managing games
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
*/

var request = require('request');
var querystring = require('querystring');
var baseUrl = 'https://euw.api.pvp.net/';


var gameServices = {
	featuredGame: function(req,res) {
		var options = {
			url: '/observer-mode/rest/featured',
			baseUrl: baseUrl,
			qs: querystring.stringify({api_key: 'ee91b462-2a25-4dd6-a14f-9ff4adadf092'}),
			method: 'GET'
		};
		request(options,function(error,response,body){
			console.log(response.statusCode);
			if (!error && response.statusCode == 200) {
				console.log(body);
			}
		});
	},

	testFunction: function(req,res) {
		res.send({functionName: 'testFunction'});
	}
};

module.exports = gameServices;
