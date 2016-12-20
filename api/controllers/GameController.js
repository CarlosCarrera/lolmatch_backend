/**
* GameController
*
* @description :: Server-side logic for managing games
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
*/
var request = require('request');
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
					else return done(null,game);
				});
	    }
	], function (err, gameObject) {
		if(err){
			console.log(err);
			return res.error(err);
		} else {
			var participantsIds =  getParticipantsArray(gameObject);
			lolApi.getSummonersLeague(participantsIds, function(err,leagues) {
				if(err) res.error(err);
				res.send(leagues);
			});
		}
	});
};

gameServices.testFunction =  function(req,res) {
	res.send({functionName: 'testFunction'});
};

function getParticipantsArray (gameObject) {
  var participantsIds = [];
  gameObject.participants.forEach(function(participant){
    participantsIds.push(participant.summonerId);
  });
  return participantsIds;
}

module.exports = gameServices;
