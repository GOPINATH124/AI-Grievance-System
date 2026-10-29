const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true,
        unique:true
    },

    password:{
        type:String,
        required:false
    },

    clerkId:{
        type:String,
        unique:true,
        sparse:true
    },

    language:{
        type:String,
        default:"English"
    },

    role:{
        type:String,
        default:"citizen"
    },

    phone:{
        type:String,
        default:""
    },

    designation:{
        type:String,
        default:"Officer"
    },

    departments:{
        type:[String],
        default:[]
    },

    salary:{
        type:Number,
        default:0
    },

    officeLocation:{
        type:String,
        default:"Main Office"
    },

    status:{
        type:String,
        default:"Active"
    },
    joiningDate:{
        type:Date,
        default:Date.now
    },
    shift:{
        type:String,
        default:"Morning"
    },
    performanceScore:{
        type:Number,
        default:5
    }

},
{
    timestamps:true
});


module.exports = mongoose.model("User",userSchema);