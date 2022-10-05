'use strict'




console.log('debut');

init_config();

async function init_config(){
    // Starting pool
    var res = await getNodeInfor();

    var stoppool = document.querySelector("#stop-pool");

    stoppool.disabled = true;

    var tableblock = document.querySelector("#schema-table > tbody");
    res.node.forEach(elt => {
        var tr = document.createElement('tr');
        
        var td1 = document.createElement('td');
        var td2 = document.createElement('td');
        var td3 = document.createElement('td');
        var td4 = document.createElement('td');
        var td5 = document.createElement('td');
        var td6 = document.createElement('td');
        var td7 = document.createElement('td');
        var td8 = document.createElement('td');
        var td9 = document.createElement('td');

        td1.setAttribute('class', 'th-sm' );
        td2.setAttribute('class', 'th-sm' );
        td3.setAttribute('class', 'th-sm' );
        td4.setAttribute('class', 'th-sm' );
        td5.setAttribute('class', 'th-sm' );
        td6.setAttribute('class', 'th-sm' );
        td7.setAttribute('class', 'th-sm' );
        td8.setAttribute('class', 'th-sm' );
        td9.setAttribute('class', 'th-sm' );

        td1.innerText = elt.no;
        td2.innerText = elt.alias;
        td3.innerText = elt.node_ip;
        td4.innerText = elt.node_port;
        td5.innerText = elt.client_ip;
        td6.innerText = elt.client_port;
        td7.innerText = elt.service;
        td8.innerText = elt.did;
        td9.innerText = elt.verkey;
        
        tr.appendChild(td1)
        tr.appendChild(td2)
        tr.appendChild(td3)
        tr.appendChild(td4)
        tr.appendChild(td5)
        tr.appendChild(td6)
        tr.appendChild(td7)
        tr.appendChild(td8)
        tr.appendChild(td9)

        tableblock.appendChild(tr);
    });
}

var startpool = document.querySelector("#star-pool");


startpool.addEventListener("click", async () =>{
    console.log('Star');
    var res = await startPool();
    console.log(res.info.name);
    var handler = document.getElementById('poolhandle');
    var name = document.getElementById('poolname');
    handler.innerText = res.info.handler;
    name.innerText = res.info.name;
    if(handler.innerText != "") alert("Le pool est en marche");

    var stoppool = document.querySelector("#stop-pool");
    stoppool.disabled = false;
    startpool.disabled = true;
});



var stoppool = document.querySelector("#stop-pool");

stoppool.addEventListener( "click", async () =>{
    console.log('Stop');
    var handler = document.getElementById('poolhandle');
    var name = document.getElementById('poolname');

    var res = await stopPool(handler.innerText, name.innerText);

    handler.innerHTML = res.info;
    name.innerHTML = 'NA';
    if(handler.innerText != "") alert("Le pool est arrêté");

    var startpool = document.querySelector("#star-pool");
    startpool.disabled = false;
    stoppool.disabled = true;
});



var add_role = document.querySelector("#add-role");


add_role.addEventListener("click", async () =>{
    var did = document.querySelector("#did").value;
    var verkey = document.querySelector("#verkey").value;
    var alias = document.querySelector("#alias").value;

    var steward_did = document.querySelector("#steward_did").value;
    var steward_verkey = document.querySelector("#steward_verkey").value;

    var e = document.querySelector("#role_type");
    var role = e.options[e.selectedIndex].value;

    var wallet_handler = document.querySelector("#wallet").value;
    console.log("wallet : " + wallet_handler);
    console.log("Steward : " + steward_did);
    var handler = document.getElementById('poolhandle').innerText;
    console.log("handler" + handler);
    if(did==""|| verkey=="" || alias=="" || steward_did=="" || steward_verkey =="") alert("Champ vide");
    else{
        if(handler =="" || handler=="Le pool a été arrêté") alert("Lancer d'abord le pool");
        else {
            var message = await submitRoleRequest(parseInt(handler), parseInt(wallet_handler), steward_did, did, verkey, alias, role)
            console.log(message);
            alert("Transaction effectué");
        }
    }
});


var search_role = document.querySelector("#search_role");


search_role.addEventListener("click", async () =>{
    var search = document.querySelector("#searchbar").value;
    var steward_did = document.querySelector("#steward_did").value;
    var wallet_handler = document.querySelector("#wallet").value;
    var handler = document.getElementById('poolhandle').innerText;



    if(search =="") alert("Champ vide");
    else{
            var message = await getInfo(parseInt(handler), parseInt(wallet_handler), steward_did, search);
            if(message.data.data == null) alert("Aucune attribution de rôle n'a été trouvée");
            else {
                console.log(JSON.parse(message.data.data));
                var data = JSON.parse(message.data.data);
                var tableblock = document.querySelector("#role-table > tbody");
                tableblock.innerHTML = "";
                var tr = document.createElement('tr');
                
                var td1 = document.createElement('td');
                var td2 = document.createElement('td');
                var td3 = document.createElement('td');
                var td4 = document.createElement('td');

                td1.setAttribute('class', 'th-sm' );
                td2.setAttribute('class', 'th-sm' );
                td3.setAttribute('class', 'th-sm' );
                td4.setAttribute('class', 'th-sm' );

                td1.innerText = data.identifier;
                td2.innerText = data.dest;
                td3.innerText = data.verkey;
                td4.innerText = data.role;
                
                tr.appendChild(td1)
                tr.appendChild(td2)
                tr.appendChild(td3)
                tr.appendChild(td4)

                tableblock.appendChild(tr);
            }
        }
    }
);

async function getInfo(poolhandler, wallet, steward_did, did){
    console.log('sending >')
    var url = '/get_role_info';

    var params = {
        param1: poolhandler,
        param2: wallet,
        param3: steward_did,
        param4: did
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

async function submitRoleRequest(poolhandler, wallet, didSteward, did, verkey, alias ,role) {
    console.log('sending >')
    var url = '/add_new_role';

    var params = {
        param1: poolhandler,
        param2: wallet,
        param3: didSteward,
        param4: did,
        param5: verkey,
        param6: alias,
        param7: role,
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


async function startPool() {
    console.log('pool-start getting info')
    var url = '/pool-start';
    try {
        var res = await fetch(url);
        return await res.json();
    } catch (error) {
        console.log(error);
    }
}

async function getNodeInfor() {
    console.log('node-info getting info')
    var url = '/node-info';
    try {
        var res = await fetch(url);
        return await res.json();
    } catch (error) {
        console.log(error);
    }
}

async function stopPool(poolnumber, poolname) {
    console.log('pool-stop >>>')
    var url = '/pool-stop';

    var params = {
        param1: poolnumber,
        param2: poolname
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

console.log('script jai finit');

