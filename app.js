
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , Game = require('./lib/game')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

var server = http.createServer(app)
  , io = require('socket.io').listen(server);

var game = new Game();

io.set('log level', 1); // Let's turn down the pesky debug statements

io.sockets.on('connection', function(socket){
  console.log("Connecting...");
  socket.on('identify', function(data){
    console.log("IDENTIFYING!!!");
    game.identify(socket, data);
  });
});

// We register the sockets individually with game
// rather than relying on socket.io to isolate
// socket.io from game and to allow for any
// EventEmitter to act as an observer
io.of('/observer').on('connection', function(socket){
  console.log("REGISTERING>>>");
  game.registerObserver(socket);
});

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
