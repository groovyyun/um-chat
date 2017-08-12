var express = require('express');
var app = express();
var redis = require('redis');
var cookie = require('cookie-parser');
var bodyParser = require('body-parser');
var path = require('path');
var http = require('http');
var date = require('date-utils');
var httpServer = http.createServer(app).listen(3080, function(req,res){
  console.log('Socket IO server has been started:3080');
});
var io = require('socket.io').listen(httpServer);
var secretKey = 'aka.willshine_deV_um_@33aa~@#5';
var redisClient = redis.createClient();

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
  console.log('express server is running on 3000 ->' + txt);
});
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

app.use(express.static(path.resolve(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookie(secretKey));

redisClient.on("error", function (err) {
    console.log("Error " + err);
});


app.use ('/', require('./router/home.js')(app));
app.use('/room', require('./router/room.js')(app, redisClient));

function refreshUserList(redis, roomId, user, push){
    // console.log(roomId + ' / '+user.nickname + ' / '+user.socketId+' / '+ push);
    if(push){
        redis.hset(roomId, user.socketId, user.nickname);
    }else{
        redis.hdel(roomId, user.socketId);
    }

    redis.hgetall(roomId, function (err, userlist) {
        // console.log(userlist);
        if(userlist != undefined && userlist != null){
            io.sockets.in(roomId).emit('room_userlist', userlist);
        }
    });
}

//status 001 - connect, 002 - disconnect
io.on('connection', function(socket){
  socket.on('join_room', function(data){
    socket.join(data.roomId);
    console.log(data.nickname+'['+socket.id+'] is join room :'+data.roomId);
    var nickname = data.nickname;
    var socketId = socket.id;
    var datas = {
      connection: true,
      nickname: nickname
    };
    socket.username = nickname;
    io.sockets.in(data.roomId).emit('room_arm', datas);
    refreshUserList(redisClient, data.roomId, {socketId: socketId, nickname: nickname}, true );
  });

  socket.on('leave_room', function(data){
    socket.leave(data.roomId);
    console.log(data.nickname+'['+socket.id+'] is leave room :'+data.roomId);
    var nickname = data.nickname;
    var socketId = socket.id;
    var datas = {
      connection: false,
      nickname: nickname
    };
    io.sockets.in(data.roomId).emit('room_arm', datas);
    refreshUserList(redisClient, data.roomId, {socketId: socketId, nickname: nickname}, false);
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
