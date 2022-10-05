
init();


function init(){

var schema_form = document.getElementById("create_schema_form");

schema_form.style.display = "none";

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];
span.onclick = function() {
  schema_form.style.display = "none";
}

var at_requested = document.getElementById("at_requested");

at_requested.style.display = "none";

// Get the <span> element that closes the modal
var span2 = document.getElementsByClassName("at_requested_close")[0];
span2.onclick = function() {
  at_requested.style.display = "none";
}

// proof request form
var proof_request = document.getElementById("proof_request");

proof_request.style.display = "none";

// Get the <span> element that closes the modal
var span3 = document.getElementsByClassName("proof_request_close")[0];
span3.onclick = function() {
  proof_request.style.display = "none";
}

// proof form
var proof = document.getElementById("proof");

proof.style.display = "none";

// Get the <span> element that closes the modal
var span4 = document.getElementsByClassName("proof_close")[0];
span4.onclick = function() {
  proof.style.display = "none";
}

}

/**
 * Button send proof request
 * 
 */
var btn_proof_request_send = document.getElementById('proof_request_send');
btn_proof_request_send.addEventListener('click', async ()=>{

  // Identifiant de la requête
  const nonce = (await getNonce()).data;
  var n = parseInt(document.getElementById("proof_request_number").value);
  var schema = document.getElementById("schema").value;

  var endpoint_to = document.getElementById("proof_request_server").value

  var did = document.getElementById("info_did").innerText;
  var verkey = (document.getElementById("info_verkey").innerText);
  
  var proofReq = {
    nonce:nonce,
    name: "proof_req_"+nonce,
    version:"0.1" 
  }

    var reqAttr = {}
    var reqPred = {}
    var credId = document.getElementById("proof_request_credential").value
    console.log(credId)
    if(credId.length != 0 && endpoint_to.length != 0){
      var cpt_attr = 0;
      var cpt_pred = 0;    
      for(var i=0; i<n; i++){
          var check = document.getElementById('check'+i);
          console.log(check)
          if(check.checked){
            var pred = document.getElementById("proof_request_pred"+i).value;
            var val = document.getElementById("proof_request_pred_val"+i).value;
            if(pred != "" && val !=""){
              var attrName = document.getElementById("proof_request_att"+i).value
              try{
                Object.assign(reqPred, {['predicate'+(cpt_pred+1)+'_referent']: {
                  name: attrName,
                  p_type: ">=",
                  p_value: parseInt(val),
                  restrictions: { cred_def_id: credId } }
                })
                cpt_pred++;
              }
              catch(e){
                alert("Predicat value ", val, " is not Int" )
              }
              
            }
            else{
              var attrName = document.getElementById("proof_request_att"+i).value
              Object.assign(reqAttr, {['attr'+(cpt_attr+1)+'_referent']: {
                                              name: attrName,
                                            restrictions: { cred_def_id: credId } }
              })
              cpt_attr++;
            }
            if(JSON.stringify(reqAttr) != "{}")proofReq.requested_attributes = reqAttr;
            if(JSON.stringify(reqPred) != "{}")proofReq.requested_predicates = reqPred;
            
          }; 
      }
    
    if (proofReq.requested_attributes || proofReq.requested_predicates){
      var res = await sendProofRequestToProver(nonce, did, verkey, {'proofReq' : proofReq, 'nb_attrReq': cpt_attr, 'nb_predReq' : cpt_pred }, schema, credId, endpoint_to);
      if(res.success) {
        alert("Proof request has been sent to the prover " , endpoint_to);
        // proof request form
        var proof_request = document.getElementById("proof_request");
        proof_request.style.display = "none";
        refresh_request();

      }
      }
      else alert("Something is wrong. Please verify all information")
  }
  else alert("Fill all field please");
  
  console.log(proofReq);
})



async function sendProofRequestToProver(nonce_, did_, verkey_, proofReq_, schema_, credId_, endpoint_to_){

  var url = endpoint_to_;

  var params = {
    nonce: nonce_,
    type_request: "PROOF_REQUEST",
    fromDid :did_,
    credId : credId_,
    fromVerkey : verkey_,
    proofReq : proofReq_,
    schema : schema_,
    endpoint_to : endpoint_to_,
    // can be add in form to change it with cloud server
    endpoint_from : "http://localhost:3020/verifier_server"
  };

  console.log(params)

  var options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
      },
    body: JSON.stringify(params)  
  };

  try {
      var res = await fetch(url, options);
      return await res.json();
  } catch (error) {
      console.log(error);
  }
}

/**
 * 
 * @returns 
 * 
 */

async function getNonce(){
  var url = 'manage_request';

  var params = {
    param2: "GET_NONCE",
  };

  console.log(params)

  var options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
      },
    body: JSON.stringify(params)  
  };

  try {
      var res = await fetch(url, options);
      return await res.json();
  } catch (error) {
      console.log(error);
  }

}

// button clic
var btn_proof_request = document.getElementById("proof-request");
btn_proof_request.addEventListener('click', () => {
  var proof_request = document.getElementById("proof_request");
  proof_request.style.display = "block";
})

//get Schema
var btn_get_schema = document.getElementById("proof_request_get_schema");
btn_get_schema.addEventListener('click', async () => {
  var schemaId = document.getElementById("proof_request_schema").value;

  
  var did = document.getElementById("info_did").innerText;
  var poolhandler = parseInt(document.getElementById("info_pool").innerText);
  var wallet_handler = parseInt(document.getElementById("wallet_handler").innerText);

  if (schemaId !="") {
    var res = await getSchemaFromLedger(schemaId, did, poolhandler, wallet_handler);
    if(res.success){
      var schema = res.data;
      document.getElementById("schema").value = JSON.stringify(schema);
      var n = schema.attrNames.length;
      document.getElementById("proof_request_number").value = n;

      addInput_proof();

      
      for(var i=0; i<n; i++){
        document.getElementById("proof_request_att"+i).value = schema.attrNames[i];
      }


    }
    else(alert(res.data))
  }
  else alert("Input schema Id !")

} )

//:funtion
async function getSchemaFromLedger(schemaId_, did_, pool_, wallet_){
  var url = 'manage_request';

    var params = {
      schemaId: schemaId_,
      param2: "GET_SCHEMA_FROM_LEDGER",
      wallet: wallet_,
      pool : pool_,
      did: did_
    };

    console.log(params)

    var options = {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
        },
      body: JSON.stringify(params)  
    };

    try {
        var res = await fetch(url, options);
        return await res.json();
    } catch (error) {
        console.log(error);
    }
}



// Obtenir les schemas 
var btn_reflesh_schema = document.getElementById('refresh-schema');
btn_reflesh_schema.addEventListener('click', async () => {

  var did = document.getElementById("info_did").innerText;
  var poolhandler = parseInt(document.getElementById("info_pool").innerText);
  var wallet_handler = parseInt(document.getElementById("wallet_handler").innerText);

  var res = await getAllShema(poolhandler, did, wallet_handler);

  if(res.success){

    var tableblock = document.querySelector("#schema-table > tbody");
    tableblock.innerHTML ="";
    res.data.forEach(elt => {
        var tr = document.createElement('tr');
        
        var td1 = document.createElement('td');
        var td2 = document.createElement('td');
        var td3 = document.createElement('td');
        var td4 = document.createElement('td');
        var td5 = document.createElement('td');

        td1.setAttribute('class', 'th-sm' );
        td2.setAttribute('class', 'th-sm' );
        td3.setAttribute('class', 'th-sm' );
        td4.setAttribute('class', 'th-sm' );
        td5.setAttribute('class', 'th-sm' );

        td1.innerText = elt.id;
        td2.innerText = elt.name;
        td3.innerText = elt.version;
        td4.innerText = elt.attrNames;

        var button = document.createElement('button');
        button.innerText = "Definir"
        button.setAttribute('id', elt.id);

        button.addEventListener('click', async ()=>{
          console.log(elt.id)
        })
        td5.appendChild(button);
        
        tr.appendChild(td1)
        tr.appendChild(td2)
        tr.appendChild(td3)
        tr.appendChild(td4)
        tr.appendChild(td5)

        tableblock.appendChild(tr);
    });
  }
  console.log(res.data);
})

async function createCredentialDef(poolHandle, did, wallet_handler, schema){

  var url = '/send-credential-from';

    var params = {
      param1: poolHandle,
      param2: did,
      param3: wallet_handler
    };

    var options = {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
        },
      body: JSON.stringify(params)  
    };

    try {
        var res = await fetch(url, options);
        return await res.json();
    } catch (error) {
        console.log(error);
    }

}

async function getAllShema(poolHandle, did, wallet_handler){
    console.log('schema getting info')
    var url = '/schemas-info';

    var params = {
      param1: poolHandle,
      param2: did,
      param3: wallet_handler
    };

    var options = {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
        },
      body: JSON.stringify(params)  
    };

    try {
        var res = await fetch(url, options);
        return await res.json();
    } catch (error) {
        console.log(error);
    }
}


var btn_create_schema = document.getElementById('s_send');
btn_create_schema.addEventListener('click', async () => {

  var [s_server, my_endpoint] = document.getElementById("s_server").value.split("@");
  console.log(s_server, " <@< " , my_endpoint);
  var name = document.getElementById("s_name").value;
  var version  = document.getElementById("s_version").value

  var s_tag  = document.getElementById("s_tag").value
  var s_signtype  = document.getElementById("s_signtype").value
  console.log(s_signtype);


  var no = document.getElementById("at_number").value;

  var did = document.getElementById("info_did").innerText;
  var verkey = document.getElementById("info_verkey").innerText;

  var poolhandler = parseInt(document.getElementById("info_pool").innerText);

  var wallet_handler = parseInt(document.getElementById("wallet_handler").innerText);


  var attr_val = [];
  for(var i=0; i<no; i++){
    var val = document.getElementById("att"+i).value;
    if(val != "") attr_val.push(val);
  }

  console.log("Valeur : " + attr_val );

  if(attr_val.length == 0) alert("Vous avez oubliez les attributs");
  var res = await createSchemaAndCredentialDefinition(poolhandler, did, name, version, attr_val, wallet_handler, s_tag, s_signtype);
  
  if(res.data.op == "REQNACK"){
    alert("Vous n'avez pas le droit d'écriture sur la blockchain");
  }
  else{
    alert("Schema publié avec succes. ID transaction : " + res.data.result.txnMetadata.txnId);
    var schema_form = document.getElementById("create_schema_form");
    console.log("Sending for credential request info");
    if(s_server!=""){
      var res2 = await sendIDstoProver(s_server, res.schema, res.credDef, res.credOffer, did, verkey, s_server, my_endpoint);

      if(res2.success){
        console.log(res2);
      }
    }
    else alert("Information not sent to prover cause field is empty");


    schema_form.style.display = "none";
  }
})


function addInput() {
  /*Getting the number of text fields*/
  var no = document.getElementById("at_number").value;
  document.getElementById('attr_box').innerHTML="";
  /*Generating text fields dynamically in the same form itself*/
  for(var i=0;i<no;i++) {
      var textfield = document.createElement("input");
      var br = document.createElement("br");
      textfield.setAttribute("id","att"+i);
      textfield.type = "text";
      textfield.value = "";
      document.getElementById('attr_box').appendChild(textfield);
      document.getElementById('attr_box').appendChild(br);
  }
}

function addInput_requested() {
  /*Getting the number of text fields*/
  var no = document.getElementById("at_requested_number").value;
  document.getElementById('at_requested_attr_box').innerHTML="";
  /*Generating text fields dynamically in the same form itself*/
  for(var i=0;i<no;i++) {
      var textfield = document.createElement("input");
      var textfield2 = document.createElement("input");
      var br = document.createElement("br");
      textfield.setAttribute("id","requested_att"+i);
      textfield.type = "text";
      textfield.disabled = "true";

      textfield2.setAttribute("id","requested_att_value"+i);
      textfield2.type = "text";
      textfield2.placeholder = "Valeur " + (i+1);
      document.getElementById('at_requested_attr_box').appendChild(textfield);
      document.getElementById('at_requested_attr_box').appendChild(textfield2);
      document.getElementById('at_requested_attr_box').appendChild(br);
  }
}


function addInput_proof(){
  /*Getting the number of text fields*/
  var no = document.getElementById("proof_request_number").value;
  document.getElementById('proof_request_attr_box').innerHTML="";
  /*Generating text fields dynamically in the same form itself*/
  for(var i=0;i<no;i++) {
    console.log("dfgf");
    var br = document.createElement("br");
    var br3 = document.createElement("br");

    

    var div = document.createElement('div')
    div.setAttribute("id", "div"+i);
    div.appendChild(br3);

      var textfield = document.createElement("input");
      textfield.setAttribute("id","proof_request_att"+i);
      textfield.type = "text";
      textfield.disabled = "true";
      var br2 = document.createElement('br');

      var checkbox = document.createElement('input');
      checkbox.setAttribute('type', 'checkbox');
      checkbox.setAttribute('id', 'check'+i);


      var label = document.createElement('label');
      label.innerHTML = " Predicat ? "

      var textfield2 = document.createElement("input");
          textfield2.setAttribute("id","proof_request_pred"+i);
          textfield2.type = "text";
          textfield2.placeholder = "Predicat (Ex: >=)";

      var textfield3 = document.createElement("input");
          textfield3.setAttribute("id","proof_request_pred_val"+i);
          textfield3.type = "text";
          textfield3.placeholder = "Value";
    
      div.appendChild(textfield);
      div.appendChild(checkbox);
      div.appendChild(br);
      div.appendChild(label);
      div.appendChild(br2);
      

      div.appendChild(textfield2);
      div.appendChild(textfield3);
      
      
      document.getElementById('proof_request_attr_box').appendChild(div);
  }
}


async function sendIDstoProver(s_server, schemaId, credDefId, credOffer, did, verkey, endpoint_to, endpoint_from){
  console.log('sending_IDs >')
    var url = s_server;

    var params = {
        type_request: "GET_IDS_CREDENTIAL_REQUEST",
        s_id: schemaId,
        c_defId: credDefId,
        c_Offer: credOffer,
        did : did,
        verkey : verkey,
        endpoint_to : endpoint_to,
        endpoint_from :endpoint_from
    };

    console.log(JSON.stringify(params));

    var options = {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
        },
      body: JSON.stringify(params)  
    };

    try {
        var res = await fetch(url, options);
        return await res.json();
    } catch (error) {
        console.log(error);
    }
}

async function createSchemaAndCredentialDefinition(poolHandle, did, s_name, s_version, s_value, wallet_handler, s_tag, s_signtype){
  console.log('sending >')
    var url = '/manage_credential';

    var params = {
        type_request: "CREATE_SCHEMA_CREDENTIAL",
        pool: poolHandle,
        did: did,
        s_name: s_name,
        s_version: s_version,
        s_value: s_value,
        wallet: wallet_handler,
        tag: s_tag,
        signtype: s_signtype
    };

    console.log(JSON.stringify(params));

    var options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
          },
        body: JSON.stringify(params)  
    };
    try {
        var res = await fetch(url, options);
        return await res.json();
    } catch (error) {
        console.log(error);
    }
}


// Obtenir les requets 
var btn_reflesh_request = document.getElementById('refresh-request');
btn_reflesh_request.addEventListener('click', refresh_request);

async function refresh_request(){
  console.log('clicked')
  var res = await getAllRequest();
  console.log(res);
  if(res.success){
    
    var tableblock = document.querySelector("#request-table > tbody");
    tableblock.innerHTML ="";
    res.data.forEach(elt => {
      console.log(elt);
      if(elt.statut == "PENDING")
        var tr = document.createElement('tr');
        
        var td1 = document.createElement('td');
        var td2 = document.createElement('td');
        var td3 = document.createElement('td');
        var td4 = document.createElement('td');
        var td5 = document.createElement('td');

        td1.setAttribute('class', 'th-sm' );
        td2.setAttribute('class', 'th-sm' );
        td3.setAttribute('class', 'th-sm' );
        td4.setAttribute('class', 'th-sm' );
        td5.setAttribute('class', 'th-sm' );

        td1.innerText = elt.did;
        td2.innerText = elt.verkey;
        td3.innerText = elt.type;
        td4.innerText = elt.statut;

        var button1 = document.createElement('button');
        button1.innerText = "Reply";
        button1.setAttribute('id', elt._id);
        button1.setAttribute('class', 'btn-reply');

        var button2 = document.createElement('button');
        button2.innerText = "Reject";
        button2.setAttribute('id', elt._id);
        button2.setAttribute('class', 'btn-reject');
        button2.style.backgroundColor = "rosybrown";
        //


        button1.addEventListener('click', async ()=>{
          
          console.log(elt.nonce);

          if(elt.type == "ATTRS_REQUEST"){
            document.getElementById("create_schema_form").style.display = "block";

            document.getElementById("s_server").value = elt.endpoint_from+"@"+elt.endpoint_to;

            var attr_val = JSON.parse("[" + elt.data + "]");
            console.log(attr_val[0]);
            document.getElementById("at_number").value = attr_val[0].length;
            addInput()
            for(var i=0; i<attr_val.length; i++){
              document.getElementById("att"+i).value = attr_val[0][i];
            }
          }
          
          // Formulaire d'attribution de valeur aux attributs
          if(elt.type == "CREDENTIAL_REQUEST"){
            var data_parse = JSON.parse(elt.data);
            console.log(data_parse);

            
            var at_requested = document.getElementById("at_requested");
            at_requested.style.display = "block";

            document.getElementById("at_requested_server").value = elt.endpoint_from + "@" + elt.endpoint_to;
            
            document.getElementById("at_requested_s_offer").value = JSON.stringify(data_parse.credOffer);

            document.getElementById("at_requested_did").value = elt.did;

            document.getElementById("at_requested_value").value = JSON.stringify(data_parse.credRequest);

            document.getElementById("at_requested_meta").value = JSON.stringify(data_parse.metaData);

            document.getElementById("at_requested_definition").value = JSON.stringify(data_parse.credDef);


            var schemaArray = data_parse.schema.attrNames; 

            document.getElementById("at_requested_number").value = schemaArray.length;
            console.log(schemaArray);
            addInput_requested();
            for(var i=0; i<schemaArray.length; i++){
              console.log(schemaArray[i])
              document.getElementById("requested_att"+i).value = schemaArray[i] ;
            }

          }

          // proof verification
          if(elt.type == "CREDENTIAL_PROOF"){
            var data_parse = JSON.parse(elt.data);

            var proof = document.getElementById("proof");
            proof.style.display = "block";

            document.getElementById("proof_data").value = elt.data
            
            document.getElementById("proof_attr").value = JSON.stringify(data_parse.proof.requested_proof.revealed_attrs);
            document.getElementById("proof_pred").value = JSON.stringify(data_parse.proof.requested_proof.predicates);
            
          }
          
          

          
        })

        button2.addEventListener('click', async ()=>{
          res = await rejectRequest(elt.nonce);
          console.log(res.data);
          refresh_request();
        })


        td5.appendChild(button1);
        td5.appendChild(button2);
        
        tr.appendChild(td1)
        tr.appendChild(td2)
        tr.appendChild(td3)
        tr.appendChild(td4)
        tr.appendChild(td5)

        tableblock.appendChild(tr);
    });
  }
}



// Button click send to verify proof
var btn_verify_proof = document.getElementById('proof_verify');
btn_verify_proof.addEventListener('click', eventListenProof )

async function eventListenProof(){
  var data = JSON.parse(document.getElementById("proof_data").value)

  var res = await verifyProof(data);
  if(res.success){
    alert("Document proof is valid");
  }
  else{
    alert("Proof refused");
  }

}

async function verifyProof(data){
  console.log('getting  with Indy>')
    var url = '/manage_credential';

    var params = {
      data : data,
      type_request: "VERIFY_PROOF"
      };
    console.log(params);

    var options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        },
      body: JSON.stringify(params)  
      };

      try {
        var res = await fetch(url, options);
        return await res.json();
      } catch (error) {
        console.log(error);
      }
}

// Button click envoyer pour credential
var btn_at_requested = document.getElementById('at_requested_s_send');
btn_at_requested.addEventListener('click', eventListenRequest )

async function eventListenRequest(){
  // variable
  var [s_server, my_endpoint] = document.getElementById("at_requested_server").value.split("@");
  console.log(s_server, " <@< " , my_endpoint);

  var credOffer = JSON.parse(document.getElementById("at_requested_s_offer").value);
  var credReq = JSON.parse(document.getElementById("at_requested_value").value)
  var metaData = JSON.parse(document.getElementById("at_requested_meta").value)

  var credDef = JSON.parse(document.getElementById("at_requested_definition").value)



  var no = document.getElementById("at_requested_number").value

  var did = document.getElementById("at_requested_did").value


  var mydid = document.getElementById("info_did").innerText;
  var myverkey = document.getElementById("info_verkey").innerText;

  var poolhandler = parseInt(document.getElementById("info_pool").innerText);

  var wallet_handler = parseInt(document.getElementById("wallet_handler").innerText);
  
  // att val
  var attr_val = {};
  for(var i=0; i<no; i++){
    var att = document.getElementById("requested_att"+i).value;
    var val = document.getElementById("requested_att_value"+i).value;
    if(val != ""){
      Object.assign(attr_val, { [att.toLowerCase()] : { raw : val, encoded : encodeURI(val)}}) ; 
    }else break;
  }

  console.log("Valeur : ")
  console.log(attr_val);

  if(attr_val.length == 0) alert("Fill all field");
  else{
     var res = await certifiedCredential(wallet_handler, credOffer, credReq, attr_val);
     if(res.success){
      // transfert to prover to store in wallet
        var res2 = await sendCredentialToProver(null, mydid, did, res.data, metaData, credDef, s_server, my_endpoint);

        if(res2.success){
          alert("Credential sent to prover");
          var at_requested = document.getElementById("at_requested");

          at_requested.style.display = "none";

        }
     }
  }
    //schema_form.style.display = "none";
  }

async function sendCredentialToProver(req_id, fromDid , did, data, metaData, credDef, endpoint_to, endpoint_from){
    console.log('Sending credential to prover >')
    var url = endpoint_to;

    var params = {
      fromDid: fromDid ,
      did : did,
      req_id : req_id,
      data: data,
      credDef : credDef,
      metaData : metaData,
      endpoint_from : endpoint_from,
      endpoint_to : endpoint_to,
      type_request: "CERTIFIED_CREDENTIAL_REPLY"
      };
    console.log(params);

    var options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        },
      body: JSON.stringify(params)  
      };

      try {
        var res = await fetch(url, options);
        return await res.json();
      } catch (error) {
        console.log(error);
      }


  }

  async function certifiedCredential(wallet_handler, credOffer, credReq, attr_val){
    console.log('getting  with Indy>')
    var url = '/manage_credential';

    var params = {
      wallet: wallet_handler,
      credOffer : credOffer,
      credReq: credReq,
      attr_val : attr_val,
      type_request: "CERTIFIED_CREDENTIAL"
      };
    console.log(params);

    var options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        },
      body: JSON.stringify(params)  
      };

      try {
        var res = await fetch(url, options);
        return await res.json();
      } catch (error) {
        console.log(error);
      }
  }


async function rejectRequest(nonce){
  console.log('Rejecting Request >')
  var url = '/manage_request';

  var params = {
    param1: nonce,
    param2: "REJECT"
};

console.log(JSON.stringify(params));

var options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
      },
    body: JSON.stringify(params)  
};
try {
    var res = await fetch(url, options);
    return await res.json();
} catch (error) {
    console.log(error);
}
}
async function getAllRequest(){
  console.log('getting All Request >')
    var url = '/manage_request';

    var params = {
      param1:"",
      param2: "GET_ALL_REQUEST"
      };
    var options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        },
      body: JSON.stringify(params)  
      };

    try {
        var res = await fetch(url, options);
        return await res.json();
    } catch (error) {
        console.log(error);
    }
}