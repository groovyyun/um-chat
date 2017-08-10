module.exports = function(app){
  var express = require('express');
  var router = express.Router();


  router.get('/list', function(req, res){
    var nickname = req.body.nickname;
    res.cookie('nickname', nickname);
    res.render('lobby', {nickname: nickname});
  });
  router.post('/in', function(req, res){
    var nickname = req.body.nickname;

    res.render('room', {nickname: nickname});
  });
  router.post('/', function(req, res){
    var nickname = req.body.nickname;
    res.cookie('nickname', nickname);
    res.render('room', {nickname: nickname});
  });
  return router;
}
