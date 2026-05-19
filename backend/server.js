require('dotenv').config()
const http = require('http')
const express = require('express')
const cors = require('cors')
const { Server} = require('socket.io')

const connection = require('./config/db')


let app = express()
//connect with db
connection()
app.use(cors());
//make the server 
const server = http.createServer(app)
//establish io 
const io = new Server(server,{
    cors: {
        origin: "http://localhost:5173"
    }
})

// socket.io servers

io.on ('connection',(socket)=>{
    console.log("A new user connected :",socket.id);

    socket.on("send_message", (message) => {
        socket.broadcast.emit("receive_message", message)
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });

})


app.get("/",(req,res)=>{
    res.send("service is live"); 
})

let PORT = process.env.PORT || 5000

server.listen(PORT,()=>{
    console.log(`server is running in port ${PORT}`);  
})