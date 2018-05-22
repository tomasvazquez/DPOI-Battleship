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

function findObjectById(array, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].id === value) {
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
    socket.on('message', function(msg){
        if(waitingWebSocket == null ){
           waitingWebSocket = new mySocket.MySocket(socket.id,msg);
        }
        socketConnections++;
        console.log('user connected: ' +waitingWebSocket.id+", connections: "+socketConnections);
    });
    socket.on('disconnect', function(){
        socketConnections--;
        var ws = findObjectById(socketsList,socket.id);
        if(waitingWebSocket == null) {
            var otherSocket = findObjectByOtherStatus(socketsList, ws.status, ws.name);
            waitingWebSocket = otherSocket;
            var index = socketsList.indexOf(ws);
            socketsList.splice(index, 1);
            socket.to(otherSocket.id).emit('opponentDisconnect', ws.name);
        }else if (waitingWebSocket.id == socket.id){
            waitingWebSocket == null;
            console.log('ws deleted');
        }else{
            waitingWebSocket.status = ws.status;
            var index = socketsList.indexOf(ws);
            socketsList.splice(index,1);
            socketsList.push(waitingWebSocket);
            var json = {'oldSocket' : ws.name, 'newSocket' : waitingWebSocket.name};
            waitingWebSocket == null;
            socket.to(otherSocket.id).emit('opponentChange',json);
        }
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
