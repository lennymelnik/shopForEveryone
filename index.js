const { group } = require('console');

var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/website/index.html');
});

var groupOBJ = {
  name : "Bobs food",
  items : ["Chocolate Milk", "Nuggie", "Tendies", "Happiness"]
}


io.on('connection', (socket) => {
  console.log('a user connected');
  //User wants to see list of a group
  socket.on('joinGroup', (data) => {
      console.log("Joining group: ", data.group)
      //Send group information to user
      socket.emit('getGroup', groupOBJ);
     
  })
  socket.on('addItem', (data) => {
    if(data != ""){
      groupOBJ.items.push(data)
    }
    
    //Send group information to user
    socket.emit('getGroup', groupOBJ);
   
  })


  //When a person clicks on got items
  socket.on("gottenItems",(data) =>{
    console.log("removing item")
    console.log(typeof data)
    for(i=0;i<data.items.length;i++){
      
      //Remove item from array based on index given in data pass
      groupOBJ.items.splice(data.items[i], 1);
      
    }
    // Once we remove item for items we must send the updated list
    socket.emit('getGroup', groupOBJ);
  
  })
});


http.listen(80, () => {
  console.log('listening on *:80');
});
