const connetToMongo = require('./db');
const express = require('express');
const bodyParser= require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const http = require("http");
const {Server} = require("socket.io");
require('dotenv').config();


connetToMongo();
const app = express();

app.use(express.json());
app.use(cors())
app.use(bodyParser.urlencoded({extended:true}))
app.use(fileUpload());

const port = 4000;

app.use('/api/auth',require('./routes/auth.js'))

const server = http.createServer(app);

const io = new Server(server,{
    cors:{
        origin:"http://localhost:3000",
        methods:["GET","POST"],
    }
})

io.on("connection",(socket)=>{
    console.log(`User connected${socket.id}`);

    socket.on("join_room",(data)=>{
        console.log(`join room number : ${data.roo}`);
        socket.join(data.roo)
    })

    socket.on("send_message",(data)=>{
        console.log(data,"data");
        socket.to(data.room).emit("receive_message",data);
    })

    socket.on("played",(data)=>{
        socket.to(data.room).emit("play",data.index);
        console.log(data,"index");
    })

    socket.on("sub",(data)=>{
        console.log(data);
        socket.to(data).emit("opSub",data);
    })

})

server.listen(process.env.PORT || port,()=>{
    console.log(`Server is listening at ${port}`);
})