const router=require('express').Router();
const Message = require("../models/Message");
const CryptoJS = require("crypto-js");

router.post("/addmessage",async(req,res)=>{
    try{
        const { from, to, message } = req.body;
        const data = await Message.create({
          message: { text: CryptoJS.AES.encrypt(message,process.env.SECRET_KEY).toString() },
          users: [from, to],
          sender: from,
        });
        if(data) return res.json({status:true,msg:"Message added to database"});
        else return res.json({status:false,msg:"Message not added to database"});
    }catch(err){
      return res.json({status:false,msg:"server error"});
    }
})

router.post("/getallmessage",async(req,res)=>{
  try {
    const { from, to } = req.body;
    const messages = await Message.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 });

    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from,
        message: CryptoJS.AES.decrypt(msg.message.text, process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8),
      };
    });
    res.json(projectedMessages);
  } catch (error) {
    res.json(error);
  }
})

module.exports =router; 