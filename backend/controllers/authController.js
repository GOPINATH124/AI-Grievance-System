const User = require("../models/User");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");



// Register

exports.register = async(req,res)=>{

try{

const {name,email,password,language,role,adminSecret,phone}=req.body;


const existUser = await User.findOne({email});


if(existUser)
{
return res.status(400).json({
message:"User already exists"
});
}



const hashPassword = await bcrypt.hash(password,10);


let userRole = "citizen";
if (role === "admin") {
  const secretKey = process.env.ADMIN_SECRET_KEY || "admin123";
  if (adminSecret === secretKey) {
    userRole = "admin";
  } else {
    return res.status(403).json({
      message: "Invalid admin secret key"
    });
  }
} else if (role === "superadmin") {
  const secretKey = process.env.ADMIN_SECRET_KEY || "admin123";
  if (adminSecret === secretKey) {
    userRole = "superadmin";
  } else {
    return res.status(403).json({
      message: "Invalid admin secret key"
    });
  }
}


const user = await User.create({

name,

email,

password:hashPassword,

language,

role: userRole,

phone: phone || ""

});


res.json({

message:"Registration Success",

user

});


}
catch(error){

res.status(500).json(error.message);

}

};




// Login


exports.login = async(req,res)=>{


try{


const {email,password}=req.body;


const user = await User.findOne({email});


if(!user)
{
return res.status(404).json({
message:"User not found"
});
}



const checkPassword = await bcrypt.compare(
password,
user.password
);



if(!checkPassword)
{
return res.status(400).json({
message:"Wrong password"
});
}



const token = jwt.sign(

{
id:user._id
},

process.env.JWT_SECRET,

{
expiresIn:"1d"
}

);



res.json({

message:"Login Success",

token,

user

});


}
catch(error)
{

res.status(500).json(error.message);

}

}

exports.forgotPassword = async (req, res) => {
  try {
    const { email, phone, newPassword } = req.body;
    if (!email || !phone || !newPassword) {
      return res.status(400).json({ message: "Please provide email, phone, and new password" });
    }
    const user = await User.findOne({ email, phone });
    if (!user) {
      return res.status(404).json({ message: "User profile not found with these details." });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password reset successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Please provide old and new passwords" });
    }
    const check = await bcrypt.compare(oldPassword, req.user.password);
    if (!check) {
      return res.status(400).json({ message: "Incorrect current password" });
    }
    req.user.password = await bcrypt.hash(newPassword, 10);
    await req.user.save();
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, language } = req.body;
    if (name !== undefined) req.user.name = name;
    if (phone !== undefined) req.user.phone = phone;
    if (language !== undefined) req.user.language = language;
    await req.user.save();
    res.json({ message: "Profile updated successfully", user: req.user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};