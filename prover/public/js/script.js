
init();


function init(){
var btn_schema = document.getElementById("create-schema");

var schema_form = document.getElementById("create_schema_form");

schema_form.style.display = "none";

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];
span.onclick = function() {
  schema_form.style.display = "none";
}

btn_schema.onclick = () => {
  schema_form.style.display = "block";
}

}

var btn_reflesh_wallet = document.getElementById('refresh-wallet');
btn_reflesh_wallet.addEventListener('click', async () => {
  var wallet_handler = parseInt(document.getElementById("wallet_handler").innerText);

  var res = await getAllCredentialFromWallet(wallet_handler);

  if(res.success){
    var tableblock = document.querySelector("#wallet-table > tbody");
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
        
        
        td1.innerText = elt.referent;
        td2.innerText = JSON.stringify(elt.attrs);
        td3.innerText = elt.schema_id;
        td4.innerText = elt.cred_def_id;

        var button = document.createElement('button');
        button.innerText = "Send credential"
        button.setAttribute('id', elt.referent);

        button.addEventListener('click', async ()=>{
          console.log(elt.referent)
        })
        td5.appendChild(button);
        
        tr.appendChild(td1)
        tr.appendChild(td2)
        tr.appendChild(td3)
        tr.appendChild(td4);
        tr.appendChild(td5)

        tableblock.appendChild(tr);
    });
  }
  else{
    alert(res.data);
  }
})

// Generer le couple DID Key
var btn_gen_key = document.getElementById('r_gen');
btn_gen_key.addEventListener('click', async () => {
  var wallet_handler = parseInt(document.getElementById("wallet_handler").innerText);
  var res = await getNewDidVerkey(wallet_handler);

  console.log(res);

  if(res.success){
    var did = document.getElementById("r_did")
    var verkey = document.getElementById("r_verkey")
    did.value = res.data.did;
    verkey.value = res.data.verkey;
  }
  else(
    alert(res.data)
  )
} )

//function genDID key
async function getNewDidVerkey(wallet_handler_){
  console.log("Getting new DID key")
  var url = '/get_did_key';

    var params = {
      param1: wallet_handler_,
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


async function getAllCredentialFromWallet(wallet_handler, filter = null){
    console.log('wallet credential getting info')
    var url = '/manage_credential';

    var params = {
      type_request : "WALLET_CREDENTIAL_INFO",
      param1: wallet_handler,
      param2 : filter
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


var btn_send_r = document.getElementById('r_send');
btn_send_r.addEventListener('click', async () => {

  var endpoint = document.getElementById("r_endpoint").value;
  var did  = document.getElementById("r_did").value
  var verkey = document.getElementById("r_verkey").value;
  var request_type = "ATTRS_REQUEST";

  var no = document.getElementById("at_number").value;

  var attr_val = [];
  for(var i=0; i<no; i++){
    var val = document.getElementById("att"+i).value;
    if(val != "") attr_val.push(val.toLowerCase());
  }

  console.log("Valeur : " + attr_val );

  if(attr_val.length == 0 || endpoint.value=="") alert("Vous avez oubliez des informations");
  else{
    var res = await sendRequest(endpoint, did, verkey, attr_val, request_type);

    if(res.success) {
      console.log('pending challenge process');
      var wallet_handler = parseInt(document.getElementById("wallet_handler").innerText);
      
      var data_signed = await signMessage(res.data, wallet_handler, verkey);
      console.log(data_signed);
      
      var res2 = await challenge(endpoint, 'CHALLENGE_REPLY', did ,data_signed.data);
      
      if(res2.success){
        alert("Challenge response successfully. You can waiting for the response");
        var schema_form = document.getElementById("create_schema_form");
        schema_form.style.display = "none";
      }
      else
        alert("Challenge response failed");
    }
    else alert(res.data);
  }

})

// Crypto function
async function signMessage(msg, wallet, verkey){
  console.log('Sign message request');
  var url = 'sign_msg_request';

  var params = {
      param1: msg,
      param2: wallet,
      param3: verkey
  };

  var options = {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
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

async function challenge(endpoint, request_type, did, data){
  console.log('sending to  >' + endpoint)
    
    var url = endpoint;

    var params = {
        type_request: request_type,
        param2: {'did' : did, 'data':data},
        endpoint_to : endpoint,
        endpoint_from : "http://localhost:3010/prover_server"
    };

    console.log(JSON.stringify(params));

    var options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
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


async function sendRequest(endpoint, did, verkey, attr_val, request_type){
    console.log('sending to  >' + endpoint)
    
    var url = endpoint;

    var params = {
        type_request: request_type,
        param2: {'did' : did, 'verkey' : verkey, 'data': attr_val},
        endpoint_to : endpoint,
        endpoint_from : "http://localhost:3010/prover_server"
    };

    console.log(JSON.stringify(params));

    var options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
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

/*$(document).ready(function () {
  $('#schema-table').DataTable({
    "scrollY": "50vh",
    "scrollCollapse": true,
  });
  $('.dataTables_length').addClass('bs-select');
});
*/


// request management
// Obtenir les schemas 
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

        td1.setAttribute('class', 'th-sm' );
        td2.setAttribute('class', 'th-sm' );
        td3.setAttribute('class', 'th-sm' );
        td4.setAttribute('class', 'th-sm' );

        td1.innerText = elt.did;
        td2.innerText = elt.type;
        td3.innerText = elt.statut;

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
          
          console.log(JSON.parse(elt.data))

          // Issuer send him the id of schema and credential definition to configure his wallet
          if (elt.type  == "GET_IDS_CREDENTIAL_REQUEST"){
            var wallet_handler = parseInt(document.getElementById("wallet_handler").innerText);
            var pool_handler = parseInt(document.getElementById("info_pool").innerText);
            var did = document.getElementById("info_did").innerText;
            var res = await getCredentialRequest(wallet_handler, pool_handler, did, elt.did ,JSON.parse(elt.data))

            console.log(res.data);
        
            var res2 = await sendCredRequest(elt.nonce, res.data, elt.endpoint_from, elt.endpoint_to )
            if(res2.success){
              alert("Your credential request has been sent.")
              // reject
              rejectRequest(elt.nonce);
              refresh_request();


            }else alert("Your request has been rejected");
          }
          
          // Issuer send him the credential signed
          if(elt.type == "CERTIFIED_CREDENTIAL_REPLY"){
            
            var wallet_handler = parseInt(document.getElementById("wallet_handler").innerText);
            
            var res = await saveCredentialinWallet(elt.nonce, JSON.parse(elt.data).data, JSON.parse(elt.data).metaData, JSON.parse(elt.data).credDef, elt.did, wallet_handler);
            if(res.success){
              alert("Your credential is save in your wallet")
              rejectRequest(elt.nonce);
              refresh_request();
              // reject
            }else alert("Error during traitment");
          }

          // Verifier proof request
          if (elt.type  == "PROOF_REQUEST"){
            var wallet_handler = parseInt(document.getElementById("wallet_handler").innerText);
            var pool_handler = parseInt(document.getElementById("info_pool").innerText);
            var did = document.getElementById("info_did").innerText;

            // Prepare proof to send it to the verifier
            var res = await getProof(wallet_handler, pool_handler,JSON.parse(elt.data), did)
            
            // data :  {"proof" : proof, "proofReq" : req.body.data.proofReq.proofReq, "schemas" : schemas, "credDefs" : credDefs}
            if(res.success){
              // send proof directly to verifier
              var res2 = await sendProofToVerifier(elt.nonce, res.data, elt.endpoint_from, elt.endpoint_to);
              if(res2.success){
                alert("Your credential proof has been sent");
                //reject
                refresh_request()
              }
              else(alert("Verifier can't received any request now. Please wait !"))
            }else alert("Your request has been rejected due to proof generation error");

            
          }
        })

        button2.addEventListener('click', async ()=>{
          res = await rejectRequest(elt.nonce);
          console.log(res.data);
          refresh_request();
        })


        td4.appendChild(button1);
        td4.appendChild(button2);
        
        tr.appendChild(td1)
        tr.appendChild(td2)
        tr.appendChild(td3)
        tr.appendChild(td4)

        tableblock.appendChild(tr);
    });
  }
}

// getting proof
async function getProof(wallet_, pool_, data_, did_){
  var url = '/manage_credential';

      console.log("Getting proof")
      var params = {
        type_request: "GET_PROOF",
        wallet: wallet_,
        pool: pool_,
        data : data_,
        did : did_
    };

      console.log(JSON.stringify(params));

      var options = {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
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


// sent proof

async function sendProofToVerifier(req_id, data, endpoint_to, endpoint_from){

  console.log("sending credential proof")
  var url =  endpoint_to;
  var params = {
    req_id : req_id,
    type_request: "CREDENTIAL_PROOF",
    data :data,
    endpoint_to : endpoint_to,
    endpoint_from : endpoint_from
};

console.log(JSON.stringify(params));

var options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
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


// Saving in wallet

async function saveCredentialinWallet(req_id, credential, metaData, credDef, did, wallet){
  var url = '/manage_credential';

      console.log("Getting credential request")
      console.log(credential);
      var params = {
        type_request: "SAVE_CREDENTIAL_IN_WALLET",
        wallet: wallet,
        did: did,
        credDef : credDef,
        req_id:req_id,
        cred : credential,
        metaData : metaData
    };

      console.log(JSON.stringify(params));

      var options = {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
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

///////////// getting cred request
async function getCredentialRequest(wallet, poolHandle, did, issuerDid, data){

  var url = '/manage_credential';

      console.log("Getting credential request")
      var params = {
        type_request: "GET_CREDENTIAL_REQUEST",
        wallet: wallet,
        did: did,
        issuerDid : issuerDid,
        schema : data.schema,
        credDef : data.c_def,
        credOffer : data.c_offer,
        poolHandle : poolHandle,
    };

      console.log(JSON.stringify(params));

      var options = {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
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
//////////

////////////////////////// Sending credential Request
async function sendCredRequest(req_id, data, endpoint_to, endpoint_from ){

  console.log("sending credential request")
  var url =  endpoint_to;
  var params = {
    req_id : req_id,
    type_request: "CREDENTIAL_REQUEST",
    data :data,
    endpoint_to : endpoint_to,
    endpoint_from : endpoint_from
};

console.log(JSON.stringify(params));

var options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
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
    nonce: nonce,
    type_request: "REJECT"
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

//////////////////////////////////////////////////////

async function getAllRequest(){
  console.log('getting All Request >')
    var url = '/manage_request';

    var params = {
      nonce:"",
      type_request: "GET_ALL_REQUEST"
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