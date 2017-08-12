module.exports = function(app, redisClient){
  var express = require('express');
  var router = express.Router();

  router.get('/', function(req, res){
    // console.log('list');
    var nickname = req.body.nickname;
    res.cookie('nickname', nickname);
    var roomsInfo=[
                  // {title:'방제목이다11', max:8, num:1},
                  // {title:'방제목이다22', max:8, num:3}
                ];
    res.render('lobby', {rooms:roomsInfo});
  });

  router.get('/:id', function (req, res) {
    var roomId = '1818';
    redisClient.hgetall(roomId, function (err, userlist) {
        if(userlist != undefined && userlist != null){
            return res.json(userlist);
        }
    });
  });

  router.delete('/:id', function (req, res) {
  });

  router.post('/', function(req, res){
    var nickname = req.body.nickname;
    res.cookie('nickname', nickname);
    res.render('room', {nickname: nickname});
  });

  return router;
};