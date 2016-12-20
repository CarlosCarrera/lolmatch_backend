/**
* GameController
*
* @description :: Server-side logic for managing games
* @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
*/
var request = require('request');
var lolApi = require('../services/lolapi');

var gameServices = {};

gameServices.featuredGame =  function(req,res,next) {
lolApi.getSummoner('fiinwar',next);
};

gameServices.testFunction =  function(req,res) {
	res.send({functionName: 'testFunction'});
};

module.exports = gameServices;
