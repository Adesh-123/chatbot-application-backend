const router =require('express').Router();
const User= require('../models/User');
const CryptoJS = require("crypto-js");

router.post("/register",async(req,res)=>{
    try{
        let existuser=await User.findOne({username:req.body.username});
        if(existuser){
         return res.json({msg:"User already exists with this username",status:false});
        }
        existuser=await User.findOne({email:req.body.email});
        if(existuser){
            return res.json({msg:"User already exist with this email",status:false});
        }
        req.body.password= CryptoJS.AES.encrypt(req.body.password,process.env.SECRET_KEY).toString()
        const newUser=new User({
            username:req.body.username,
            email:req.body.email,
            password:req.body.password,
            isAvatarImageSet:false,
        })
        await newUser.save();
        return res.json({user:newUser,msg:"User has been created", status:true});
    }catch(err){
        return res.json({msg:err,status:false});
    }
});

router.post("/login",async(req,res)=>{
    try{
      const user=await User.findOne({username:req.body.username});
      if(!user){
        return res.json({msg:"No such user exists",status:false});
      }
      const bytes  = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
      const originalText = bytes.toString(CryptoJS.enc.Utf8);
      if(req.body.password!==originalText) return res.json({msg:"Invalid credentail",status:false});
      delete user.password;
      return res.json({user,msg:"Successfully login",status:true});
    }catch(err){
        res.json({msg:err,status:false});
    }
})

router.post("/setAvatar/:id",async(req,res)=>{
    try{
        const userId = req.params.id;
        const avatarImage = req.body.image;
        const userData = await User.findByIdAndUpdate(
          userId,
          {
            isAvatarImageSet: true,
            avatarImage,
          },
          { new: true }
        );
        return res.json({
          isSet: userData.isAvatarImageSet,
          image: userData.avatarImage,
        });
    }catch(err){
        return res.json({msg:err,status:false});
    }
   
})

router.get("/getalluser/:id",async(req,res)=>{
  try {
    const users = await User.find({ _id: { $ne: req.params.id } }).select([
      "email",
      "username",
      "avatarImage",
      "_id",
    ]);
    return res.json(users);
  } catch (ex) {
    return res.json({status:false,msg:"server error"});
  }
})

router.get("/logout/:id",(req, res) => {
  try {
    if (!req.params.id) return res.json({ msg: "User id is required " });
    onlineUsers.delete(req.params.id);
    return res.status(200).send();
  } catch (error) {
    res.json(error);
  }
})

module.exports =router;