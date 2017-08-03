var express = require('express');
var app = express();
// var redis = require('redis');
var cookie = require('cookie-parser')
var bodyParser = require('body-parser');
var path = require('path');
var http = require('http');
var date = require('date-utils');
var httpServer = http.createServer(app).listen(3080, function(req,res){
  console.log('Socket IO server has been started');
});
var io = require('socket.io').listen(httpServer);
var secretKey = 'aka.willshine_deV_um_@33aa~@#5';
// var redisClient = redis.createClient();

var userList = {};
// var redisKey = 'userlist';
app.listen(3000, function(){
  var txt = '';
  if( process.env.NODE_ENV == 'production' ) {
    txt = 'Prod Mod';
  } else if( process.env.NODE_ENV == 'development' ) {
    txt = 'Dev Mod';
    app.locals.pretty=true;
  }
  else{
    txt = 'env undefine.. need command "export NODE_ENV=development"';
  }
});

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

app.use(express.static(path.resolve(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookie(secretKey));

// redisClient.on("error", function (err) {
//     console.log("Error " + err);
// });
//
// function updateUserList(_userList){
//   var str = JSON.stringify(_userList);
//   redisClient.set(redisKey, str, redis.print);
//   console.log(str);
//   // redisClient.get(redisKey, function(err, reply) {
//   //   console.log('data:'+reply);
//   //     var jsonData = JSON.parse(reply);
//   //     console.log('jsonData:'+jsonData);
//   // });
// }
// function getUserList(){
//   var jsonData = '';
//   redisClient.get(redisKey, function(err, reply) {
//     console.log('err:'+err);
//     console.log('reply:'+jsonData);
//       // jsonData = JSON.parse(reply);
//       jsonData =reply;
//   });
//
//   return jsonData;
// }

app.get('/', function(req, res){
    res.render('login');
});

app.post('/room', function(req, res){
  var nickname = req.body.nickname;
  res.cookie('nickname', nickname);
  res.render('room', {nickname: nickname});
});


//status 001 - connect, 002 - disconnect
io.on('connection', function(socket){
  socket.on('join_room', function(data){
    socket.join(data.roomId);
    var nickname = data.nickname;
    var socketId = socket.id;

    userList[socketId] = nickname;

    var datas = {
      connection: true,
      nickname: nickname,
      userlist: userList
    };

    socket.username = nickname;
    io.sockets.in(data.roomId).emit('room_arm', datas);
    console.log(nickname+'['+socketId+'] is join room :'+data.roomId);
  });

  socket.on('leave_room', function(data){
    socket.leave(data.roomId);
    var nickname = data.nickname;
    var socketId = socket.id;

    delete userList[socketId];

    var datas = {
      connection: false,
      nickname: nickname,
      userlist: userList
    };

    io.sockets.in(data.roomId).emit('room_arm', datas);
    console.log(nickname+'['+socketId+'] is leave room :'+data.roomId);
  });

  socket.on('chat_msg', function(data){
    var datetime = new Date().toFormat('YYYY-MM-DD HH24:MI:SS');
    var datas = {
      nickname: data.nickname,
      message: data.message,
      date: datetime
    };
    // socket.emit('chat_msg', datas);
    io.sockets.in(data.roomId).emit('room_msg', datas);
    // console.log('room:'+data.roomId
    //             +' / chat:'+data.nickname+':'+data.message);
  });
});
