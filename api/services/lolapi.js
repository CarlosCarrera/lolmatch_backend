var request = require('request');
var querystring = require('querystring');

var api_key = querystring.stringify({api_key: process.env.LOLAPIKEY});

function lolService(region,api_key) {
  this.region = region;
  this.baseUrl = 'https://' + region + '.api.pvp.net';
}

// /api/lol/{region}/v1.4/summoner/by-name/{summonerNames}
lolService.prototype.getSummoner = function(summonerName,callback) {
  var options = {
    url: this.baseUrl + '/api/lol/'+ this.region + '/v1.4/summoner/by-name/' +
    summonerName + '?' + api_key,
    method: 'GET',
    json: true
  };
  request(options,function(error,response,body){
    if (!error && response.statusCode == 200) {
      return callback(null,body);
    } else return callback(error);
  });
};

// /api/lol/{region}/v2.5/league/by-summoner/{summonerIds}/entry
lolService.prototype.getSummonersLeague = function(summonerIds,callback) {
  var options = {
    url: this.baseUrl + '/api/lol/'+ this.region + '/v2.5/league/by-summoner/' +
    summonerIds +'/entry' + '?' + api_key,
    method: 'GET',
    json:true
  };
  request(options,function(error,response,body){
    if (!error && response.statusCode == 200) {
      return callback(null,body);
    } else return callback(error);
  });
};

// /observer-mode/rest/consumer/getSpectatorGameInfo/{platformId}/{summonerId}
lolService.prototype.getSummonerGame = function(summonerId,callback) {
  var options = {
    url: this.baseUrl + '/observer-mode/rest/consumer/getSpectatorGameInfo/EUW1/' +
    summonerId + '?' + api_key,
    method: 'GET',
    json: true
  };
  request(options,function(error,response,body){
    if (!error && response.statusCode == 200) {
      return callback(null,body);
    } else return callback(error);
  });
};

module.exports = lolService;
