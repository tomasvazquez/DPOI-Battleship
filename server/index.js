var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var socketConnections = 0;

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});

io.on('connection', function(socket){
   // console.log('a user connected');
    socket.on('message', function(msg){
        socketConnections++;
        console.log('user connected: ' + msg+", connections: "+socketConnections);
    });
    socket.on('disconnect', function(){
        socketConnections--;
        console.log('user disconnected, connections: '+socketConnections);
    });
    socket.on('getStatus', function(){

        socket.emit('updateStatus','waiting');

        console.log('status send');
    });
});



// io.on('connection', function(socket){
//     socket.on('message', function(msg){
//         console.log('message: ' + msg);
//     });
// });

//send message to everyone