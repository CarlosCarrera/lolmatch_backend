var request = require('request');
var querystring = require('querystring');

var lolService = {};
var baseUrl = 'https://' + region + '.api.pvp.net/';

lolService.getSummoner = function(summonerName, callback) {
var options = {
  url: '/api/lol/{region}/v1.4/summoner/by-name/' + summonerName +
  querystring.stringify({api_key: 'ee91b462-2a25-4dd6-a14f-9ff4adadf092'}),
  method: 'GET'
};
request(options,function(error,response,body){
  if (!error && response.statusCode == 200) {
    return callback(null,body);
  } else {
    return callback(error);
  }
});
}

module.exports = lolService;
