
'use strict'

const util = require('./utils');
const indy = require('indy-sdk');

async function startPool(){

    var poolName = 'EHRPool';
    console.log(`Open Pool Ledger: ${poolName}`);
    var poolGenesisTxnPath = await util.getPoolGenesisTxnPath(poolName);
    //var poolGenesisTxnPath = '/home/indy'

    var poolConfig = {
        "genesis_txn": poolGenesisTxnPath
    };

    try {
        await indy.createPoolLedgerConfig(poolName, poolConfig);
    } catch(e) {
        if(e.message !== "PoolLedgerConfigAlreadyExistsError") {
            throw e;
        }
    }

    await indy.setProtocolVersion(2)
    var poolHandle = await indy.openPoolLedger(poolName);
    console.log('pool initialised and opened');
    return {name : poolName, handler : poolHandle };
}

async function getNodeInformation(){
    var poolIp = process.env.TEST_POOL_IP || "127.0.0.1";
    var node_info = [{"reqSignature": {}, "txn": {"data": {"data": {"alias": "Node1", "blskey": "4N8aUNHSgjQVgkpm8nhNEfDf6txHznoYREg9kirmJrkivgL4oSEimFF6nsQ6M41QvhM2Z33nves5vfSn9n1UwNFJBYtWVnHYMATn76vLuL3zU88KyeAYcHfsih3He6UHcXDxcaecHVz6jhCYz1P2UZn2bDVruL5wXpehgBfBaLKm3Ba", "blskey_pop": "RahHYiCvoNCtPTrVtP7nMC5eTYrsUA8WjXbdhNc8debh1agE9bGiJxWBXYNFbnJXoXhWFMvyqhqhRoq737YQemH5ik9oL7R4NTTCz2LEZhkgLJzB3QRQqJyBNyv7acbdHrAT8nQ9UkLbaVL9NBpnWXBTw4LEMePaSHEw66RzPNdAX1", "client_ip": poolIp, "client_port": 9702, "node_ip": poolIp, "node_port": 9701, "services": ["VALIDATOR"]}, "dest": "Gw6pDLhcBcoQesN72qfotTgFa7cbuqZpkX3Xo6pLhPhv"}, "metadata": {"from": "Th7MpTaRZVRYnPiabds81Y"}, "type": "0"}, "txnMetadata": {"seqNo": 1, "txnId": "fea82e10e894419fe2bea7d96296a6d46f50f93f9eeda954ec461b2ed2950b62"}, "ver": "1"},
    {"reqSignature": {}, "txn": {"data": {"data": {"alias": "Node2", "blskey": "37rAPpXVoxzKhz7d9gkUe52XuXryuLXoM6P6LbWDB7LSbG62Lsb33sfG7zqS8TK1MXwuCHj1FKNzVpsnafmqLG1vXN88rt38mNFs9TENzm4QHdBzsvCuoBnPH7rpYYDo9DZNJePaDvRvqJKByCabubJz3XXKbEeshzpz4Ma5QYpJqjk", "blskey_pop": "Qr658mWZ2YC8JXGXwMDQTzuZCWF7NK9EwxphGmcBvCh6ybUuLxbG65nsX4JvD4SPNtkJ2w9ug1yLTj6fgmuDg41TgECXjLCij3RMsV8CwewBVgVN67wsA45DFWvqvLtu4rjNnE9JbdFTc1Z4WCPA3Xan44K1HoHAq9EVeaRYs8zoF5", "client_ip": poolIp, "client_port": 9704, "node_ip": poolIp, "node_port": 9703, "services": ["VALIDATOR"]}, "dest": "8ECVSk179mjsjKRLWiQtssMLgp6EPhWXtaYyStWPSGAb"}, "metadata": {"from": "EbP4aYNeTHL6q385GuVpRV"}, "type": "0"}, "txnMetadata": {"seqNo": 2, "txnId": "1ac8aece2a18ced660fef8694b61aac3af08ba875ce3026a160acbc3a3af35fc"}, "ver": "1"},
    {"reqSignature": {}, "txn": {"data": {"data": {"alias": "Node3", "blskey": "3WFpdbg7C5cnLYZwFZevJqhubkFALBfCBBok15GdrKMUhUjGsk3jV6QKj6MZgEubF7oqCafxNdkm7eswgA4sdKTRc82tLGzZBd6vNqU8dupzup6uYUf32KTHTPQbuUM8Yk4QFXjEf2Usu2TJcNkdgpyeUSX42u5LqdDDpNSWUK5deC5", "blskey_pop": "QwDeb2CkNSx6r8QC8vGQK3GRv7Yndn84TGNijX8YXHPiagXajyfTjoR87rXUu4G4QLk2cF8NNyqWiYMus1623dELWwx57rLCFqGh7N4ZRbGDRP4fnVcaKg1BcUxQ866Ven4gw8y4N56S5HzxXNBZtLYmhGHvDtk6PFkFwCvxYrNYjh", "client_ip": poolIp, "client_port": 9706, "node_ip": poolIp, "node_port": 9705, "services": ["VALIDATOR"]}, "dest": "DKVxG2fXXTU8yT5N7hGEbXB3dfdAnYv1JczDUHpmDxya"}, "metadata": {"from": "4cU41vWW82ArfxJxHkzXPG"}, "type": "0"}, "txnMetadata": {"seqNo": 3, "txnId": "7e9f355dffa78ed24668f0e0e369fd8c224076571c51e2ea8be5f26479edebe4"}, "ver": "1"},
    {"reqSignature": {}, "txn": {"data": {"data": {"alias": "Node4", "blskey": "2zN3bHM1m4rLz54MJHYSwvqzPchYp8jkHswveCLAEJVcX6Mm1wHQD1SkPYMzUDTZvWvhuE6VNAkK3KxVeEmsanSmvjVkReDeBEMxeDaayjcZjFGPydyey1qxBHmTvAnBKoPydvuTAqx5f7YNNRAdeLmUi99gERUU7TD8KfAa6MpQ9bw", "blskey_pop": "RPLagxaR5xdimFzwmzYnz4ZhWtYQEj8iR5ZU53T2gitPCyCHQneUn2Huc4oeLd2B2HzkGnjAff4hWTJT6C7qHYB1Mv2wU5iHHGFWkhnTX9WsEAbunJCV2qcaXScKj4tTfvdDKfLiVuU2av6hbsMztirRze7LvYBkRHV3tGwyCptsrP", "client_ip": poolIp, "client_port": 9708, "node_ip": poolIp, "node_port": 9707, "services": ["VALIDATOR"]}, "dest": "4PS3EDQ3dW1tci1Bp6543CfuuebjFrg36kLAUcskGfaA"}, "metadata": {"from": "TWwCRQRZ2ZHMJFn9TzLp7W"}, "type": "0"}, "txnMetadata": {"seqNo": 4, "txnId": "aa5e817d7cc626170eca175822029339a444eb0ee8f0bd20d3b0b76e566fb008"}, "ver": "1"}];
    
    var list_node_info = [];

    node_info.forEach((elt) => {
        var node_info = {}
        node_info['no'] = elt.txnMetadata.seqNo
        node_info['alias'] = elt.txn.data.data.alias;
        node_info['node_ip'] = elt.txn.data.data.node_ip;
        node_info['node_port'] = elt.txn.data.data.node_port;
        node_info['client_ip'] = elt.txn.data.data.client_ip;
        node_info['client_port'] = elt.txn.data.data.client_port;
        node_info['service'] = elt.txn.data.data.services;
        node_info['verkey'] = elt.txn.data.dest;
        node_info['did'] = elt.txn.metadata.from;

        list_node_info.push(node_info);
    });
    
    console.log('info got');
    return list_node_info;
}

async function stopPool(poolHandle, poolName){
    await indy.closePoolLedger(poolHandle)
    await indy.deletePoolLedgerConfig("EHRPool")
    console.log('Closed');
}

async function test (){
    var info = await getNodeInformation();
    var list_node_info = [];

    info.forEach((elt) => {
        var node_info = {}
        node_info['no'] = elt.txnMetadata.seqNo
        node_info['alias'] = elt.txn.data.data.alias;
        node_info['node_ip'] = elt.txn.data.data.node_ip;
        node_info['node_port'] = elt.txn.data.data.node_port;
        node_info['client_ip'] = elt.txn.data.data.client_ip;
        node_info['client_port'] = elt.txn.data.data.client_port;
        node_info['service'] = elt.txn.data.data.service;
        node_info['verkey'] = elt.txn.data.dest;
        node_info['did'] = elt.txn.metadata.from;

        list_node_info.push(node_info);

    })

    console.log(JSON.stringify(list_node_info));
    return list_node_info;
}

//test()
module.exports = {
    startPool,
    getNodeInformation,
    stopPool
}