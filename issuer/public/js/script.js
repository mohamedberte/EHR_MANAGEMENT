
init();

/**
 * Fonction d'initialisation des éléments de formulaire js 
 * Il seront caché automatiquement dès le chargement du serveur et
 * vont réagit en foction des évènements qui leurs ont été attribué
 */
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
}

/**
 * Création des evenements listeners pour le boutton
 * qui va récupérer les schémas depuis le serveur
 */
var btn_reflesh_schema = document.getElementById('refresh-schema');
btn_reflesh_schema.addEventListener('click', async () => {

  // Ensemble d'informations requises
  var did = document.getElementById("info_did").innerText;
  var poolhandler = parseInt(document.getElementById("info_pool").innerText);
  var wallet_handler = parseInt(document.getElementById("wallet_handler").innerText);

  // Fonction de récupération
  var res = await getAllShema(poolhandler, did, wallet_handler);

  if(res.success){
    // si requête effectué avec succès, alors on construit le tableau
    // d'affichage
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
  // petit afficharge dans la console afin de savoir ce qui a été chargé
  console.log(res.data);
})


/**
 * Fonction qui récupère les informations des schémas créer via le serveur stocké et se trouvant sur Indy
 * @param {Int} poolHandle 
 * @param {String} did 
 * @param {Int} wallet_handler 
 * @returns 
 */
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

/**
 * Création des evenements listeners pour le boutton
 * qui va envoyer la reponse à la requête de demande d'attribut
 * par le patient
 */
var btn_create_schema = document.getElementById('s_send');
btn_create_schema.addEventListener('click', async () => {

  // Récupération des informations via le formulaire remplit sur la page
  var [s_server, my_endpoint] = document.getElementById("s_server").value.split("@");
  console.log(s_server, " <@< " , my_endpoint);
  var name = document.getElementById("s_name").value;
  var version  = document.getElementById("s_version").value

  var s_tag  = document.getElementById("s_tag").value
  var s_signtype  = document.getElementById("s_signtype").value
  console.log(s_signtype);

  // le nonce est notre identifiant de la requête, va nous permettre de suivre notre requête jusqu'a sa validation
  var nonce = document.getElementById("s_req_id").innerText;


  var no = document.getElementById("at_number").value;

  var did = document.getElementById("info_did").innerText;
  var verkey = document.getElementById("info_verkey").innerText;

  var poolhandler = parseInt(document.getElementById("info_pool").innerText);

  var wallet_handler = parseInt(document.getElementById("wallet_handler").innerText);


  // Cette partie récuperer les infos dans notre input intéractif
  var attr_val = [];
  for(var i=0; i<no; i++){
    var val = document.getElementById("att"+i).value;
    if(val != "") attr_val.push(val);
  }

  // on peut la visualiser dans le terminal
  console.log("Valeur : " + attr_val );

  
  if(attr_val.length == 0) alert("Vous avez oubliez les attributs");

  // Nous allons créer les schémas et les credential Definition
  var res = await createSchemaAndCredentialDefinition(poolhandler, did, name, version, attr_val, wallet_handler, s_tag, s_signtype);
  
  // Mise en place des conditions pour les mauvaises saisis ou mauvaise réponse du serveur ( peut s'améliorer aussi )
  if(res.data.op == "REQNACK"){
    alert("Vous n'avez pas le droit d'écriture sur la blockchain");
  }
  else{
    alert("Schema publié avec succes. ID transaction : " + res.data.result.txnMetadata.txnId);
    var schema_form = document.getElementById("create_schema_form");
    console.log("Sending for credential request info");


    if(s_server!=""){
      // On envoi les premiers identifiants des éléments créer précédement afin que le prover configure son porte feuille puis envoie la requête
      // request credential
      var res2 = await sendIDstoProver(nonce, s_server, res.schema, res.credDef, res.credOffer, did, verkey, s_server, my_endpoint);

      if(res2.success){
        console.log(res2);

        // Je supprime la requête traité à chaque fois. Mais on conserver aussi pour juste effctuer les mises
        // à jour sur le statut grace au nonce
        rejectRequest(nonce);
        refresh_request();
        schema_form.style.display = "none";
      }
    }
    else alert("Information not sent to prover cause field is empty");

  }
})

/**
 * Fonction qui va remplir les champs des attributs grâce au schéma associé
 */
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
      document.getElementById('attr_box').appendChild(textfield);
      document.getElementById('attr_box').appendChild(br);
  }
}

/**
 * Remplissage automatique des champs d'attribut lors de la réponse
 * des attributs demandé par le prover
 */
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

/**
 * Fonction envoyant les informations vers le serveur du prover pour la configuration de son portefeuille
 * @param {String} req_id 
 * @param {String} s_server 
 * @param {String} schemaId 
 * @param {*} credDefId 
 * @param {*} credOffer 
 * @param {*} did 
 * @param {*} verkey 
 * @param {*} endpoint_to 
 * @param {*} endpoint_from 
 * @returns Il renvoie un json avec success = true si OK ou false si non Ok
 */
async function sendIDstoProver(req_id,s_server, schemaId, credDefId, credOffer, did, verkey, endpoint_to, endpoint_from){
  console.log('sending_IDs >')
    var url = s_server;

    var params = {
      req_id : req_id,
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


/**
 * Fonction envoyant les informations vers le serveur pour la création des schémas et du crédentials definition
 * @param {*} poolHandle 
 * @param {*} did 
 * @param {*} s_name 
 * @param {*} s_version 
 * @param {*} s_value 
 * @param {*} wallet_handler 
 * @param {*} s_tag 
 * @param {*} s_signtype 
 * @returns 
 */
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


/**
 * Boutton reflesh pour récupérer les requêtes reçu sur le endpoint
 * Contient les evenements de reponse et de rejet de requête
 */
var btn_reflesh_request = document.getElementById('refresh-request');
btn_reflesh_request.addEventListener('click', refresh_request);

/**
 * Fonction associé au boutton d'actualisation de la requête
 */
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

            document.getElementById("s_req_id").innerText = elt.nonce;

            document.getElementById("s_server").value = elt.endpoint_from+"@"+elt.endpoint_to;

            var attr_val = JSON.parse("[" + elt.data + "]");
            console.log(attr_val[0]);
            document.getElementById("at_number").value = attr_val[0].length;
            addInput()
            for(var i=0; i<attr_val[0].length; i++){
              console.log(attr_val[0][i]);
              document.getElementById("att"+i).value = attr_val[0][i];
            }
          }
          
          // Formulaire d'attribution de valeur aux attributs
          if(elt.type == "CREDENTIAL_REQUEST"){
            var data_parse = JSON.parse(elt.data);
            console.log(data_parse);

            
            var at_requested = document.getElementById("at_requested");
            at_requested.style.display = "block";

            document.getElementById("at_requested_req_id").innerText = elt.nonce;

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


/**
 * 
 */
var btn_at_requested = document.getElementById('at_requested_s_send');
btn_at_requested.addEventListener('click', eventListenRequest )

async function eventListenRequest(){
  // Variable
  var [s_server, my_endpoint] = document.getElementById("at_requested_server").value.split("@");
  console.log(s_server, " <@< " , my_endpoint);

  var nonce = document.getElementById("at_requested_req_id").innerText;

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
    var att = document.getElementById("requested_att"+ i).value;
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
        var res2 = await sendCredentialToProver(nonce, mydid, did, res.data, metaData, credDef, s_server, my_endpoint);

        if(res2.success){
          alert("Credential sent to prover");
          var at_requested = document.getElementById("at_requested");
          rejectRequest(nonce);

          at_requested.style.display = "none";

        }
     }
  }
    //schema_form.style.display = "none";
  }

  /**
   * 
   * @param {*} req_id 
   * @param {*} fromDid 
   * @param {*} did 
   * @param {*} data 
   * @param {*} metaData 
   * @param {*} credDef 
   * @param {*} endpoint_to 
   * @param {*} endpoint_from 
   * @returns 
   */
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

  /**
   * 
   * @param {*} wallet_handler 
   * @param {*} credOffer 
   * @param {*} credReq 
   * @param {*} attr_val 
   * @returns 
   */
  async function certifiedCredential(wallet_handler, credOffer, credReq, attr_val){
    console.log('getting from with Indy >')
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


  /**
   * 
   * @param {*} nonce 
   * @returns 
   */
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

/**
 * Fonction permettant d'obtenir les schemas crée
 * @returns Une liste de schémas
 */
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