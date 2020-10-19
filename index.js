const { group } = require('console');
const { query } = require('express');

var express  = require('express');

app = express.Router()
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var url = "mongodb://projectclout.com:27017/mydb";
var uniqid = require('uniqid')


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/website/index.html');
});


MongoClient.connect(url, function(err,db){
  if (err) throw err;
  dbo = db.db("smallProjects");
  io.on('connection', (socket) => {

    
    console.log('a user connected');
    //User wants to see list of a group
    socket.on('joinGroup', (data) => {
        console.log("Joining group: ", data.group)
        query1 = {
          name : data.group
        }
        dbo.collection("shopForAll").find(query1).toArray(function(err, result) {
          if (err) throw err;
          socket.emit('getGroup', result[0]);
          
          dbo.collection("chats").find(query1).toArray(function(err, resu) {
              console.log("starting to watch", resu[0])
  
            var local = resu
          // Define change stream
  
          var changeStream = dbo.collection("shopForAll").watch(query);
          // start listen to changes
          changeStream.on("change", function(event) {
            dbo.collection("shopForAll").find(query1).toArray(function(err, result) {
              if (err) throw err;
              socket.emit('getGroup', result[0]);
            })
          })
        })
        //Send group information to user
      })
        
     
            

    })

    socket.on('createGroup', (data) =>{

      var query = {
        id : uniqid(),
        name : data.name,
        key : data.key,
        list : [],
        people : []
      }
      dbo.collection("shopForAll").insertOne(query, function(err, result) {
        if (err) throw err;
        console.log("Added a new group")
        

      });

    })

  
    socket.on('addItem', (data) => {
      if(data.item != ""){
        hquery = {
          id : data.id
        }
        newValues = {
          $push: {
          list: data.item
          }
      }

        dbo.collection("shopForAll").updateOne(hquery, newValues, function(err, result) {
          if (err) throw err;
          console.log("Added a new group")
          dbo.collection("shopForAll").find(hquery).toArray(function(err, result) {
            if (err) throw err;
            socket.emit('getGroup', result[0]);
          })
       
  
        });
      
      }
      
      //Send group information to user
      
    
    })


    //When a person clicks on got items
    socket.on("gottenItems",(data) =>{
      
      console.log("removing item")
      console.log(typeof data)
      hquery = {
        id : data.groupId
      }
      dbo.collection("shopForAll").find(hquery).toArray(function(err, result) {
        if (err) throw err;
        var groupInfo = result[0]
        console.log("being passed", data.items)
        for(i=0;i<data.items.length;i++){
        
          //Remove item from array based on index given in data pass
          groupInfo.list.splice(data.items[i], 1);
          
        }
        newValues = {
          $set: {
          list: groupInfo.list
          }
        }

        dbo.collection("shopForAll").updateOne(hquery, newValues, function(err, result) {
          if (err) throw err;
          console.log("info",groupInfo)
          // Once we remove item for items we must send the updated list
          socket.emit('getGroup', groupInfo);
        })
     
       

      })
      
    
    })
  });


})
http.listen(3001)
module.exports = { app : app }
