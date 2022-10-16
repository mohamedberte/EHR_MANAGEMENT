// Importing modules
const mongoose = require('mongoose');
var crypto = require('crypto');

var indy = require('indy-sdk');
  
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
UserSchema.methods.setPassword = async function(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.password = crypto.pbkdf2Sync(password, this.salt, 
    1000, 64, `sha256`).toString(`hex`);
    var config = {'id': this.username};
    var credentials = {'key': this.password};
    try {
        console.log("[ Initialisation - wallet ]");
        console.log("Wallet Config and credentials : " + config, credentials);
        await indy.createWallet(config, credentials);
    } catch(e){
        if(e.message = "WalletAlreadyExistsError"){
            console.log("Wallet is already exist")
        }
        else throw e;
    }
};
UserSchema.methods.validPassword = function(password) {
    var hashpass = crypto.pbkdf2Sync(password, 
    this.salt, 1000, 64, `sha256`).toString(`hex`);
    return this.password === hashpass;
};

UserSchema.methods.initConnection = async function() {
    await indy.setProtocolVersion(2)
    var poolHandle = await indy.openPoolLedger("EHRPool");
    console.log('pool initialised and opened');
    var config = {'id': this.username};
    var credentials = {'key': this.password};
    var handler = await indy.openWallet(config, credentials);
    console.log("Create and store in Wallet DID from seed");
    var random = 32 - this.username.length;
    var seed = this.username;
    for(var i=0;i<random;i++) {
        seed = seed.concat("0");
    };
    
    let info = {
        'seed': seed
    };

    var [did, verkey] = await indy.createAndStoreMyDid(handler, info);
    return {'did' : did, 'verkey' : verkey, 'wallet' : handler, 'poolhandler': poolHandle};
};
const User = module.exports = mongoose.model('User', UserSchema);