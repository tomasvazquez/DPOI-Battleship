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

function findObjectById(array, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].id === value) {
            return array[i];
        }
    }
    return null;
}

function findSocketByName(array, value) {
    if (array.ws1.user.name === value){
        return array.ws1;
    }else{
        return array.ws2;
    }
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
        if (list.length === 1){
           gamesList = [];
        }else{
            gamesList = list.splice(index, 1);
        }
    }
    gamesList.push(game);
}

function countShipFire(board, shootBoard, value) {
    var size = 0;
    var shoot = 0;
    for (var i = 0; i < 10; i++) {
        for (var e = 0; e < 10; e++) {
            if (board[i][e] === value){
                size++;
                shoot += shootBoard[i][e];
            }
        }
    }
    return (size === shoot);
}
function getShipCells(board, value) {
    var cells = [];
    for (var i = 0; i < 10; i++) {
        for (var e = 0; e < 10; e++) {
            if (board[i][e] === value){
               var coord = [];
                coord.push(i);
                coord.push(e);
                cells.push(coord);
            }
        }
    }
    return cells;
}

function sinkShip(board, cells) {
    for (var i=0; i < cells.length; i++){
        var coords = cells[i];
        board[coords[0]][coords[1]] = 0;
    }
    var empty = true;
    for (var a = 0; a < 10; a++) {
        for (var e = 0; e < 10; e++) {
            if (board[a][e] !== 0){
                empty = false;
                return empty;
            }
        }
    }
    return empty;
}

function findGameBySocket(gameList, value) {
    for (var i = 0; i < gameList.length; i++) {
        if (gameList[i].ws1.id === value || gameList[i].ws2.id === value) {
            return gameList[i];
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
    socket.on('message', function(json){
        if(waitingWebSocket == null ){
           waitingWebSocket = new mySocket.MySocket(socket.id,json);
        }
        socketConnections++;
        console.log('user connected: ' +socket.id+", connections: "+socketConnections);
    });
    socket.on('disconnect', function(){
        console.log('disconnect '+socket.id);
        socketConnections--;
        if(waitingWebSocket == null) {
            var game = findGameBySocket(gamesList,socket.id);
            var ws = findSocketById(game, socket.id);
            var otherSocket = findOtherSocket(game,socket.id);
            if (game.status === 'playing'){
                var gameIndex = gamesList.indexOf(game);
                gamesList = gamesList.splice(gameIndex,1);
                socket.to(otherSocket.id).emit('gameOver', {"result": true, "disconnected": true});
            }else{
                var gameIndex = gamesList.indexOf(game);
                gamesList = gamesList.splice(gameIndex,1);
                otherSocket.status = 'waiting';
                waitingWebSocket = otherSocket;
                console.log(waitingWebSocket);
                socket.to(otherSocket.id).emit('opponentDisconnect');
            }

        }else if (waitingWebSocket.id == socket.id) {
            console.log("I was waitingWebSocket");
            waitingWebSocket == null;
        }else{
            playId++;
            var game = findGameBySocket(gamesList,socket.id);
            var ws = findSocketById(game, socket.id);
            var otherSocket = findOtherSocket(game,socket.id);
            var gameIndex = gamesList.indexOf(game);
            gamesList = gamesList.splice(gameIndex,1);
            socket.to(otherSocket.id).emit('opponentDisconnect');

            otherSocket.playId = playId;
            waitingWebSocket.playId = playId;
            waitingWebSocket.status = 'warming';
            otherSocket.status = 'warming';
            waitingWebSocket.user.playId = playId;
            otherSocket.user.playId = playId;
            var newGame = new game.Game(playId,otherSocket,waitingWebSocket,'warming');
            gamesList.push(newGame);
            console.log(waitingWebSocket);
            socket.to(otherSocket.id).emit('updateStatus',waitingWebSocket.user );
            socket.to(waitingWebSocket.id).emit('updateStatus', otherSocket.user);
            waitingWebSocket = null;
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
            socketsList.push(ws);
            socketsList.push(waitingWebSocket);
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
        console.log('socket ready: '+thisSocket.user.name+' other socket: '+otherSocket.user.name);
        if (thisSocket.status === 'ready' && otherSocket.status === 'ready'){
            thisGame.status = 'ready';
            console.log('game is ready to play');
        }
        updateGame(thisGame,gamesList);
        socket.to(otherSocket.id).emit('updateOponentReady', true);
    });
    socket.on('updateSocket', function(json){
       var game  = findObjectById(gamesList,json.playId);
       var thisSocket = findSocketByName(game,json.user.name);
       thisSocket.status = 'playing';
       var xBoard = [];
       for( var e=0; e<10; e++) {
           var yBoard = [];
           for (var i = 0; i < 10; i++) {
               yBoard.push(0);
           }
           xBoard.push(yBoard);
       }
       thisSocket.shootBoard = xBoard;
       if (game.ws2.status === 'playing' && game.ws1.status === 'playing'){
           game.status = 'playing';
       }
       updateGame(game,gamesList);
       if (game.status === 'playing'){
           var random = Math.floor(Math.random() * 1);
           if (random === 1){
               socket.to(game.ws1.id).emit('updateTurn',true);
               console.log(game.ws1.user.name +' arranca jugando');
           }else{
               socket.to(game.ws2.id).emit('updateTurn',true);
               console.log(game.ws2.user.name +' starts playing');

           }
       }
    });

    socket.on('shootOpponent',function (json) {
        var thisGame = findObjectById(gamesList,json.playId);
        var thisSocket = findSocketById(thisGame,socket.id);
        var otherSocket = findOtherSocket(thisGame,socket.id);
        var value = otherSocket.board[json.y][json.x];
        var isOccupied = value !== 0;
        var ship = undefined;
        var gameOver = false;
        if(isOccupied){
            otherSocket.shootBoard[json.y][json.x] = 1;
            if(countShipFire(otherSocket.board, otherSocket.shootBoard, value)){
                var cells = getShipCells(otherSocket.board, value);
                gameOver = sinkShip(otherSocket.board, cells);
                ship = {"id": value.substring(6,7), "size": value.substring(4,5), "cells": cells};
            }
        }
        var response = {"isOccupied" : isOccupied, "x": json.x, "y": json.y, "ship": ship};
        socket.emit('getMyShot', response);
        socket.to(otherSocket.id).emit('getOpponentShot', response);

        if(gameOver) {
            var gameIndex = gamesList.indexOf(thisGame);
            gamesList = gamesList.splice(gameIndex,1);
            socket.emit('gameOver', {"result": gameOver, "disconnected" : false});
            socket.to(otherSocket.id).emit('gameOver', {"win" : !gameOver});
        }else{
            socket.to(otherSocket.id).emit('updateTurn', true);
        }
    });
});
