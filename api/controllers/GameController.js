/**
* GameController
*
* @description :: Server-side logic for managing games
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
*/
var request = require('request');
var utils = require('../utils/gameControllerUtils');
var LolApi = require('../services/lolapi');
var async = require('async');

var gameServices = {};

gameServices.firstEndpoint =  function(req,res) {
	var lolApi = new LolApi(req.query.region);
	var summonerName = req.query.summonerName.replace(/\s+/g, '-').toLowerCase();
	if(!summonerName) return res.badRequest('Missing Summoner Name');

	async.waterfall([
	    function(done) {
				lolApi.getSummoner(summonerName, function(err,summoner) {
					if(err) return done(err);
					else done(null, summoner[summonerName].id);
				});
	    },
	    function(summonerId, done) {
				lolApi.getSummonerGame(summonerId,function(err,game) {
					if(err)	return done(err);
					else if (game === undefined) {
							return res.badRequest('Summoner not playing');
					} else {
						return done(null,game);
					}
				});
	    }
	], function (err, game) {
		if(err){
			console.log(err);
			return res.badRequest(err);
		} else {
			utils.addLeaguesToGameParticipants(game,lolApi,function(error,gameObjectWithLeagues) {
				if(error) res.badRequest(error);
				else res.json(utils.handleGameObjectResponse(gameObjectWithLeagues));
			});
		}
	});
};

gameServices.testFunction =  function(req,res) {
	res.send({functionName: 'testFunction'});
};

module.exports = gameServices;
