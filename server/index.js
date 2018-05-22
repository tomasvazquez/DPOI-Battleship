var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mySocket = require('./MySocket.js');

var socketConnections = 0;
var socketsPlay = new Map();
var playId = 0;
var socketsList = [];

var waitingWebSocket = null;

function findObjectByName(array, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].name === value) {
            return array[i];
        }
    }
    return null;
}

function findObjectByOtherStatus(array, status, otherName) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].status === status && array[i].name != otherName) {
            return array[i];
        }
    }
    return null;
}

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});

io.on('connection', function(socket){
   // console.log('a user connected');
    socket.on('message', function(msg){
        if(waitingWebSocket == null ){
           waitingWebSocket = new mySocket.MySocket(socket.id,msg);
        }
        socketConnections++;
        console.log('user connected: ' +waitingWebSocket.id+", connections: "+socketConnections);
    });
    socket.on('disconnect', function(){
        socketConnections--;
        console.log('user disconnected '+ socket.id+', connections: '+socketConnections);
    });
    socket.on('getStatus', function(msg){
        console.log(msg);
        if (waitingWebSocket.name == msg){
            socket.emit('updateStatus',undefined );
            console.log('socket: '+msg+', status: waiting');
        }
        else {
            playId++;
            var ws = new mySocket.MySocket(socket.id,msg);
            waitingWebSocket.status = playId;
            ws.status = playId;
            socketsList.push(ws);
            socketsList.push(waitingWebSocket);
            socket.emit('updateStatus',waitingWebSocket.name );
            socket.to(waitingWebSocket.id).emit('updateStatus', msg);
            console.log('socket: '+msg+', Ready to play with '+waitingWebSocket.name );
            waitingWebSocket = null;
        }

    });
    socket.on('setReady',function (msg) {
        var thisSocket = findObjectByName(socketsList,msg);
        var otherSocket = findObjectByOtherStatus(socketsList,thisSocket.status,thisSocket.name);
        console.log('socket ready: '+thisSocket.name+' other socket: '+otherSocket.name);
        socket.to(otherSocket.id).emit('updateOponentReady', true);
    });

});
