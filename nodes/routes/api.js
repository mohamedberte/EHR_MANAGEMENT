// express configuration
var express = require('express');
var router = express.Router();
var pool = require('../modules/pool');
var ledger = require('../modules/ledger');

// Possible de faire un middleware pour gérer l'accès au lien indirectement

router.get('/', async function(req, res){
    var info  = await ledger.initStewardConfig();
    res.render('pages/index', {info_did : info[0], info_verkey : info[1], info_wallet : info[2] });
});


router.get('/pool-start', async function(req, res){
    var poolinfo = await pool.startPool();
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
        info : poolinfo
    }));
});

router.get('/node-info', async function(req, res){
    var nodeinfo = await pool.getNodeInformation();

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
        node: nodeinfo 
    }));
});

router.post('/pool-stop', async function(req, res){
    console.log(req.body);
    await pool.stopPool( parseInt( req.body.param1, req.body.param2) );
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
        info : "Le pool a été arrêté"
    }));
});


router.post('/get_role_info', async function(req, res){
    var request = await ledger.getRoleInfo(req.body.param1, req.body.param2, req.body.param3, req.body.param4);
    console.log(request.result);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
       data : request.result
    }));
})


router.post('/add_new_role', async function(req, res){
    var request = await ledger.sendNymRequest(req.body.param1,
        req.body.param2,
        req.body.param3,
        req.body.param4,
        req.body.param5,
        req.body.param6,
        req.body.param7);
    console.log(request);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
       data : request
    }));
});

module.exports = router;