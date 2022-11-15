var keys = require("./keys.js")
var env = require("./env.js")
var Web3 = require('web3');
var ETHERS =  require('ethers')

var _ = {} //store global variables from database

const _web3 = new Web3(network)
var blue_machine = _web3.eth.accounts.wallet.add(keys.wallet);

var machineAddress = blue_machine.address;
var adminAddress = machineAddress;

//Polygon Contracts
var fomoChess_contract = new _web3.eth.Contract(env.fomoChess.ABI, env.fomoChess.contract)

var gotFirstBlockAlready = false;
//THIS IS STARTING THE WHOLE THING
catch_events()

function catch_events(){
	_web3.eth.getBlockNumber().then(function(latestBlock){
		if(gotFirstBlockAlready){
			if(latestBlock > _.latest_block_scanned){

				console.log({fromBlock:_.latest_block_scanned, toBlock:latestBlock})

				let promise0 = fomoChess_contract.getPastEvents('allEvents',{fromBlock:_.latest_block_scanned, toBlock:latestBlock},function(e,x){
					if(e) console.error(e)
					if(x)
					x.forEach((event)=>{
						switch(event.event){
							case "GAME":
								ROLL(event);
							break;
						}
					})
				})

				Promise.all([promise0]).then(()=>{
					console.log('----------checked----------',_.latest_block_scanned+" >>>> "+latestBlock)
					_.latest_block_scanned = latestBlock+1
				})
				
			}else{
				setTimeout(catch_events,3000)
			}
		}else{
			_.latest_block_scanned = latestBlock
			gotFirstBlockAlready = true
			catch_events()
		}
	}).catch(err=>{
		console.log(err)
		console.log("\n=========\n=========\n Gonna try continuing catching NFT events")
		catch_events()
	})
}

function ROLL(event){
	console.log("Roll Dice")
	
	let T = event.returnValues.T;
	
	if(T>0){
		insistTX(_web3,()=>{
			return fomoChess_contract.methods.randomness()
		},()=>{
			console.log("Successful ROLL")
		})
	}else{
		console.log("Someone accepted/pulled-out-of game")
	}
}


function insistTX(WEB3,txf,donef,timeout){
	//f = function(){return potatoContract.methods.newPieces(names, ipfs_links, metas)}
	function TX(){txf().send({ from:machineAddress, gasLimit: 2500000 }, function(r,hash){
		if(r) throw r;
		console.log( "Tx Hash: ", hash )
		let hashChecks = 0
		function readHash(){
			setTimeout(function(){
				WEB3.eth.getTransactionReceipt(hash)
				.then(function(res){
					//
					if(res === null){
						hashChecks += 1
						console.log("Nothing yet, trying again...", hashChecks)
						readHash();
					}else{
						if(res.status){
							//console.log('res',res.status)
							console.log("Tx Success", hash)
							if(donef)
								donef()
						}else{
							//console.log('res',res.status)
							console.log("Tx Dropped. Attempting again", hash)
							TX();
							//attempt tx again
						}
					}
				}).catch(function(r){
					console.error("------ ====== = ERROR = ====== ------")
					console.error(r)
				})
			},timeout?timeout:5000)	
		}

		readHash();
			
		})
		.catch(function(err){
			console.error("====== = ------ ERROR ------ = ======")
			console.error(err)
		})
	}
	TX();
}