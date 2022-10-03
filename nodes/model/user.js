// Importing modules
const mongoose = require('mongoose');
var crypto = require('crypto');
  
// Creating user schema
const UserSchema = mongoose.Schema({
    username : {
        type : String,
        required : true
    },
    password : String,
    salt : String
});
  
// Methode du modèle
UserSchema.methods.setPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.password = crypto.pbkdf2Sync(password, this.salt, 
    1000, 64, `sha256`).toString(`hex`);
};
UserSchema.methods.validPassword = function(password) {
    var hashpass = crypto.pbkdf2Sync(password, 
    this.salt, 1000, 64, `sha256`).toString(`hex`);
    return this.password === hashpass;
};
const User = module.exports = mongoose.model('User', UserSchema);