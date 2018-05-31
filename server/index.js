var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mySocket = require('./MySocket.js');
var game = require('./Game.js');

var socketConnections = 0;
var gamesList = [];
var playId = 0;
var gameId = 0;
var socketsList = [];

var waitingWebSocket = null;

function findObjectByName(array, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].user.name === value) {
            return array[i];
        }
    }
    return null;
}

function findObjectByOtherStatus(array, status, otherName) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].status === status && array[i].user.name != otherName) {
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

function findSocketById(array, value){
    if (array.ws1.id === value){
        return array.ws1;
    }else{
        return array.ws2;
    }
}

function findOtherSocket(array, value){
    if (array.ws1.id === value){
        return array.ws2;
    }else{
        return array.ws1;
    }
}

function updateGame(game,list) {
    var oldGame = findObjectById(list,game.id);
    var index = list.indexOf(oldGame);
    if (index > -1) {
        list.splice(index, 1);
    }
    list.push(game);
}

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});

io.on('connection', function(socket){
    socket.on('message', function(json){
        if(waitingWebSocket == null ){
           waitingWebSocket = new mySocket.MySocket(socket.id,json);
        }
        socketConnections++;
        console.log('user connected: ' +socket.id+", connections: "+socketConnections);
    });
    socket.on('disconnect', function(){
        socketConnections--;
        var ws = findObjectById(socketsList,socket.id);
        if(waitingWebSocket == null) {
            var otherSocket = findObjectByOtherStatus(socketsList, ws.status, ws.user.name);
            waitingWebSocket = otherSocket;
            var index = socketsList.indexOf(ws);
            socketsList.splice(index, 1);
            socket.to(otherSocket.id).emit('opponentDisconnect', ws.user.name);
        }else if (waitingWebSocket.id == socket.id){
            waitingWebSocket == null;
            console.log('ws deleted');
        }else{
            waitingWebSocket.status = ws.status;
            var index = socketsList.indexOf(ws);
            socketsList.splice(index,1);
            socketsList.push(waitingWebSocket);
            var json = {'oldSocket' : ws.user.name, 'newSocket' : waitingWebSocket.user.name};
            waitingWebSocket == null;
            socket.to(otherSocket.id).emit('opponentChange',json);
        }
        console.log('user disconnected '+ socket.id+', connections: '+socketConnections);
    });
    socket.on('getStatus', function(json){
        if (waitingWebSocket.user.name == json.name){
            socket.emit('updateStatus',undefined );
            console.log('socket: '+json.name+', status: waiting');
        }
        else {
            playId++;
            var ws = new mySocket.MySocket(socket.id,json);
            waitingWebSocket.playId = playId;
            ws.playId = playId;
            waitingWebSocket.status = 'warming';
            ws.status = 'warming';
            json.playId = playId;
            waitingWebSocket.user.playId = playId;
            // socketsList.push(ws);
            // socketsList.push(waitingWebSocket);
            var newGame = new game.Game(playId,ws,waitingWebSocket,'warming');
            gamesList.push(newGame);
            socket.emit('updateStatus',waitingWebSocket.user );
            socket.to(waitingWebSocket.id).emit('updateStatus', json);
            console.log('socket: '+json.name+', Ready to play with '+waitingWebSocket.user.name );
            waitingWebSocket = null;
        }

    });
    socket.on('setReady',function (json) {
        var thisGame = findObjectById(gamesList, json.playId);
        var thisSocket = findSocketById(thisGame,socket.id);
        var otherSocket = findOtherSocket(thisGame,socket.id);
        thisSocket.board = json.board;
        thisSocket.status = 'ready';
        thisGame.ws1 = thisSocket;
        thisGame.ws2 = otherSocket;
        if (thisSocket.status === 'ready' && otherSocket.status === 'ready'){
            thisGame.status = 'ready';
            console.log('game is ready to play');
            console.log(thisSocket.user.name+' board: '+thisSocket.board);
            console.log(otherSocket.user.name+' board: '+otherSocket.board);

        }
        updateGame(thisGame,gamesList);
        console.log('socket ready: '+thisSocket.user.name+' other socket: '+otherSocket.user.name);
        socket.to(otherSocket.id).emit('updateOponentReady', true);
    });
});
