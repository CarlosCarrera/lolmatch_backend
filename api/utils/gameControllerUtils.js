
var gameControllerUtils = {};

gameControllerUtils.handleGameObjectResponse =  function(gameObject) {
  gameObject.firstTeam = [];
  gameObject.secondTeam = [];
  gameObject.participants.forEach(function(participant) {
    if(participant.teamId === 100) {
      gameObject.firstTeam.push(participant);
    } else if (participant.teamId === 200) {
      gameObject.secondTeam.push(participant);
    }
  });
  delete gameObject.participants;
  return gameObject;
};

gameControllerUtils.getParticipantsArray =  function(gameObject) {
  var participantsIds = [];
  gameObject.participants.forEach(function(participant){
    participantsIds.push(participant.summonerId);
  });
  return participantsIds;
};

gameControllerUtils.addLeaguesToGameParticipants = function(gameObject,lolApi, callback) {
  var participantsIds =  this.getParticipantsArray(gameObject);
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
};

module.exports = gameControllerUtils;
