// Importing modules
const mongoose = require('mongoose');
  
// Creating user schema
const SchemaCred = mongoose.Schema({
    id : {
        type : String,
        required : true
    },
    name : {
        type : String,
        required : true
    },
    version : {
        type : String,
        required : true
    }
});
  
// Methode du modèle
SchemaCred.methods.setSchemaCred = function(id, name, version) {
    this.id = id;
    this.name = name;
    this.version = version;
};
const SchemaCred = module.exports = mongoose.model('schema', SchemaCred);