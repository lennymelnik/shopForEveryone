var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/website/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('joinGroup', (data) => {
      console.log("Joining group: ", data.group)
  })

  
});

http.listen(80, () => {
  console.log('listening on *:3000');
});