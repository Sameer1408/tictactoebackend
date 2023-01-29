const express = require('express');
const User = require('./models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const JWT_SECRET = 'ABCDEFGHIGKLMNOPQRSTUWXYZ';
const fetchuser = require('./middleware/fetchUser');
const Games = require('./models/Games');

//Create a User using: POST "/api/auth/createUser" ->no authenticaton required
router.post('/createUser', [
  body('name', "Enter a valid name").isLength({ min: 3 }),
  body('email').isEmail(),
  body('password').isLength({ min: 5 }),
],
  async (req, res) => {
    const errors = validationResult(req);
    //if there are error
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      //Check whether the email exists already  
      console.log(req.body.email,"emaillll");
      let user = await User.findOne({ email: req.body.email })
      if (user) {
        return res.status(400).json({ error: "Sorry a user with this email already exists" })
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      user = await User.create({
        name: req.body.name,
        username:req.body.username,
        email: req.body.email,
        password: secPass,
      })
      
      const data = {
        user: {
          id: user.id
        }
      }
      const authtoken = jwt.sign(data, JWT_SECRET);

      res.status(201).json({success:true,authtoken })

    } catch (error) {
      console.error(error.message);
      res.status(500).send("Some error occured")
    }

  })
  
//Login a User using: POST "/api/auth/login" ->no authenticaton required
router.post('/login',  async (req, res) => {
  //if there are error
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { username, password } = req.body;
  try {
    let user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({
        error: "Sorry user not found"
      })
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(400).json({
        error: "Sorry invalid credentials"
      })
    }
    const data = {
      user: {
        id: user.id
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);
    res.status(201).json({success:true,authtoken });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Some error occured")
  }

})

//Get Logged in user details :POST"api/auth/getuser.Login or authentication required
router.get('/getuser',fetchuser, async (req, res) => {
 try {
    userId =req.user.id
    console.log("userId",userId);
    const user = await User.findById(userId).select("-password");
    res.status(200).json({user});

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Some error occured")
  }

})

router.post('/getname',fetchuser,async(req,res)=>{
  try{
    console.log(req.body.email,"reqemail")
    const name = await User.findOne({email:req.body.email}).select("name");
    console.log(name,"name");
    res.status(200).json({name});
  }catch(err){
    console.error(error.message);
    res.status(500).send("Some error occured")
  }
})

router.post("/submitGame",fetchuser,async(req,res)=>{
  try{
    const userId =req.user.id
    const {opposite,wonBy,tictac,roomPlayed,turn} = req.body;
    console.log(req.body);
    const game = await Games.create({
     userId,opposite,wonBy,tictac,roomPlayed,turn
    })
    res.status(200).json({game});
  }catch(err){
    console.error(err.message);
    res.status(500).send("Some error occured")
  }
})

router.get('/allGames',fetchuser,async(req,res)=>{
  try{
    const userId =req.user.id;
    const games = await Games.find({userId});
    res.status(200).json({games});
  }catch(err){
    console.error(err.message);
    res.status(500).send("Some error occured")
  }
})

module.exports = router;