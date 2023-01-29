const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
    },
    opposite:{
        type:String,
        require:true,
    },
    wonBy:{
        type:String,
    },
    tictac:{
        type:Array,
        required:true
    },
    roomPlayed:{
        type:"String",
        required:true
    },
    turn:{
        type:Boolean,
        default:false,
    },
    date:{
        type:Date,
        default:Date.now
    },
    

})

module.exports = mongoose.model('games',UserSchema);