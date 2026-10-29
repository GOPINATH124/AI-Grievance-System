const mongoose = require("mongoose");


const complaintSchema = mongoose.Schema({

userId:{
type:mongoose.Schema.Types.ObjectId,
ref:"User",
required:true
},


complaintId:{
type:String,
unique:true
},


title:String,


description:String,


department:{
type:String,
default:"Not Assigned"
},


officer:{
type:String,
default:"Not Assigned"
},


status:{
type:String,
default:"Pending"
},


language:String,

priority:{
type:String,
default:"Medium"
},


reply:{
type:String,
default:""
},


dueDate:{
type:Date
},

location:{
type:String,
default:"Not Specified"
},

aiLetter:{
type:String,
default:""
},

isAiGenerated:{
type:Boolean,
default:false
},

translationStatus:{
type:String,
default:"Not Required"
},
  feedbackRating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedbackComment: {
    type: String,
    default: ""
  },
  appealComment: {
    type: String,
    default: ""
  },
  appealDate: {
    type: Date
  },
  clarificationQuestion: {
    type: String,
    default: ""
  },
  clarificationAnswer: {
    type: String,
    default: ""
  },
  clarificationAnswerDate: {
    type: Date
  },
  interimReply: {
    type: String,
    default: ""
  },
  interimReplyDate: {
    type: Date
  },
  isDigiLockerAttached: {
    type: Boolean,
    default: false
  },
  digiLockerDocType: {
    type: String,
    default: ""
  },
  digiLockerDocName: {
    type: String,
    default: ""
  },
  latitude: {
    type: Number,
    default: 12.9716
  },
  longitude: {
    type: Number,
    default: 77.5946
  },
  subscriberCount: {
    type: Number,
    default: 0
  },
  subscribers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]
},{
  timestamps:true
});


module.exports =
mongoose.model("Complaint",complaintSchema);