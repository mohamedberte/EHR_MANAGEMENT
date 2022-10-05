// Importing modules
const mongoose = require('mongoose');
  
// Creating user schema
const s_request = mongoose.Schema({
    did : {
        type : String,
        required : true
    },

    verkey : {
        type : String,
        required : true
    },
    nonce : {
        type : String,
        required : true
    },
    type : {
        type : String,
        required : true
    },
    statut : {
        type : String,
        required : true
    },
    data : {
        type : String,
        required : true
    },
    endpoint_to : {
        type : String,
    },
    endpoint_from : {
        type : String,
    }
});
  
// Methode du modèle
s_request.methods.request = function(did, verkey, nonce, type, statut, data, endpoint_to="", endpoint_from="") {
    this.did = did;
    this.verkey = verkey;
    this.nonce = nonce;

    this.type = type;
    this.statut = statut;
    this.data = data;
    
    this.endpoint_to =endpoint_to,
    this.endpoint_from = endpoint_from
};
const Request = module.exports = mongoose.model('request_', s_request);