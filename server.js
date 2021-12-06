var express = require('express'),
    app = express(),
    http = require('http'),
    socketIO = require('socket.io'),
    fs = require('fs'),
    path = require('path'),
    server, io;

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

server = http.Server(app);
server.listen(5000);

io = socketIO(server);
let imagePath = path.resolve(__dirname, './woodchuck.jpg')
io.on('connection', function (socket) {
    var readStream = fs.createReadStream(imagePath, {
        encoding: 'base64'
    }), chunks = [];

    readStream.on('data', function (chunk) {
        chunks.push(chunk);
        socket.emit('img-chunk', chunk);
    });

    readStream.on('end', function () {
        console.log('Image loaded');
        socket.emit('img-finish');
    });

    fs.watchFile(imagePath, { interval: 10 }, (curr, prev) => {
        socket.emit('img-reset');
        var readStream = fs.createReadStream(imagePath, {
            encoding: 'base64'
        }), chunks = [];
        readStream.on('data', function (chunk) {
            chunks.push(chunk);
            socket.emit('img-chunk', chunk);
        });

        readStream.on('end', function () {
            console.log('Image loaded');
            socket.emit('img-finish');

        });
    });
});
