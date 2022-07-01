const express =require('express');
const app =express();
const dotenv = require('dotenv');
const mongoose =require('mongoose');
const cors =require('cors');
const socket =require("socket.io");

dotenv.config();
mongoose.connect(process.env.MONGODB_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
},()=>{
    console.log("DATABASE CONNECT SUCCESSFULLY");
})
app.use(cors()); 
app.use(express.json());
app.use("/api/auth",require('./routes/user'));
app.use("/api/message",require('./routes/messageapi'));

app.use("/",(req,res)=>{
  res.send("hii");
})


const server=app.listen(process.env.PORT,()=>
    console.log("SERVER IS CONNECTED SUCCESSFULLY")
)

const io=socket(server,{
    cors:{
        origin:"https://remarkable-kitsune-519653.netlify.app/",
        Credentials: true,
        methods: ["GET", "POST"]
    },
})

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});