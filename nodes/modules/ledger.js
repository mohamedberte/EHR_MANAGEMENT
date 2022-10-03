const indy = require('indy-sdk');

async function sendNymRequest(poolhandler, wallet, stewardDID, did, verkey, alias=null, role){
    var req = await indy.buildNymRequest(stewardDID, did, verkey, alias, role);
    var res = await indy.signAndSubmitRequest(poolhandler, wallet, stewardDID, req);

    const resMetadata = await indy.getResponseMetadata(res)

    return resMetadata;
}

async function getRoleInfo(poolhandler, wallet, steward_did, did){
    console.log(steward_did + "Info" + did)
    var req = await indy.buildGetNymRequest(steward_did, did);
    var res = await indy.signAndSubmitRequest(poolhandler, wallet, steward_did, req);
    return res;

}

async function initStewardConfig(){
    console.log("Sovrin Steward -> Create wallet");
    var config = {'id': 'stewardWalletName'}
    var credentials = {'key': 'steward_key'}
    try {
        await indy.createWallet(config, credentials)
    } catch(e) {
        if((e.message !== "WalletAlreadyExistsError")) {
            throw e;
        }
    }

    var walletHandler = await indy.openWallet(config, credentials);
    
    console.log("Create and store in Wallet DID from seed");
    let info = {
        'seed': '000000000000000000000000Steward1'
    };

    var [did, verkey] = await indy.createAndStoreMyDid(walletHandler, info);

    return [did, verkey, walletHandler];
}

module.exports = {
    sendNymRequest,
    initStewardConfig,
    getRoleInfo
}

