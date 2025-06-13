const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
                     
/*updated userSchema added validation part :
trimed name,
emial , password length should be atleast of 8 character
used password comparsion hook in user schema , 
timestamps for created at and updated at ,*/
const userSchema = new mongoose.Schema({
  name: { type: String, required: true,trim:true },
  email: { type: String, required: true, unique: true ,lowercase:true,match:[/^\S+@\S+\.\S+$/, 'Please provide a valid email'],},
  password: { type: String, required: true, minlength:[8,'must be at least 8 charcters'] ,select:false,},
  organizationName: { type: String, required: true, unique: true },
  organizationEmail: { type: String, required: true , lowercase: true,
  match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'] },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String, index: true },
  verificationTokenExpires:{               //added expiry to token
    type:Date,
  },
},{timestamps:true});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (err) {
    next(new Error(`password hashing failed:${err.message}`));
  }
});
//comparing password using bcrypt
userSchema.methods.comparePassword = async function (candidatePassword){
 return bcrypt.compare(candidatePassword, this.password);     
};

module.exports = mongoose.model('User', userSchema);
