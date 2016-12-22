/**
* GameController
*
* @description :: Server-side logic for managing games
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
*/
var request = require('request');
var LolApi = require('../services/lolapi');
var async = require('async');
var _ = require('lodash');

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
			var gameObject = _.clone(game);
			addLeaguesToGameParticipants(gameObject,lolApi,function(error,gameObjectWithLeagues) {
				if(error) res.badRequest(error);
				else res.send(gameObjectWithLeagues);
			});
		}
	});
};

gameServices.testFunction =  function(req,res) {
	res.send({functionName: 'testFunction'});
};

function addLeaguesToGameParticipants(gameObject,lolApi, callback) {
	var participantsIds =  getParticipantsArray(gameObject);
	lolApi.getSummonersLeague(participantsIds, function(error,leagues) {
		if(error) return callback(error);
		else {
			var participantLeagues = {};
			for (var key in leagues) {
				if (leagues.hasOwnProperty(key)) {
					gameObject.participants.forEach(function(participant) {
						if(participant.summonerId.toString() === key.toString()){
							participant.league = leagues[key][0].tier + ' ' +
							leagues[key][0].entries[0].division;
						}
					});
				}
			}
			return callback(null,gameObject);
		}
	});
}

function getParticipantsArray (gameObject) {
  var participantsIds = [];
  gameObject.participants.forEach(function(participant){
    participantsIds.push(participant.summonerId);
  });
  return participantsIds;
}

module.exports = gameServices;
