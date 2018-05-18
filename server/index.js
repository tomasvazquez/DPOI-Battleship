var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var socketConnections = 0;
var waitingSocket = null;
var socketsPlay = new Map();
var socketId = 0;
var playId = 0;

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});

io.on('connection', function(socket){
   // console.log('a user connected');
    socket.on('message', function(msg){
        if(waitingSocket == null ){
            waitingSocket = msg;
        }
        console.log('user connected: ' +msg+", connections: "+socketConnections);
    });
    socket.on('disconnect', function(){
        socketConnections--;
        console.log('user disconnected '+ socket.id+', connections: '+socketConnections);
    });
    socket.on('getStatus', function(msg){
        console.log(msg);
        if (waitingSocket == msg){
            socket.emit('updateStatus','Waiting for oponent...' );
        }
        else {
            playId++;
            socketsPlay.set(msg,playId);
            var otherPlayer = waitingSocket;
            socketsPlay.set(otherPlayer,playId);
            waitingSocket = null;
            socket.emit('updateStatus','Ready to play with '+otherPlayer );

        }
        console.log('socket: '+msg+', status: '+waitingSocket);
    });
});
