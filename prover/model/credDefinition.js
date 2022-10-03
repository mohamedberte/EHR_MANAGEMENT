// Importing modules
const mongoose = require('mongoose');
  
// Creating user schema
const credDefinition = mongoose.Schema({
    credDef_id : {
        type : String,
        required : true
    },

    credDef_value : {
        type : String,
        required : true
    }
});
  
// Methode du modèle
credDefinition.methods.request = function(id, credDef) {
    this.credDef_id = id;
    this.credDef_value = credDef;
};
const CredDef = module.exports = mongoose.model('credDef', credDefinition);