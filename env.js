var keys = require("./keys.js")
var ABI = require("./ABI.js")
var env = {}
	
if(1)
{
	env = {
		live: false,
		test: true,
		ethProviders:['https://goerli.infura.io/v3/'+keys.infura],
		etcProviders:['https://www.ethercluster.com/mordor']
	}

	env.fomoChess = {
		contract: '0xaBFC3719d0F68C7B8d50dCfdb902D44Fa4b7b7C7',
		ABI: ABI
	}
}else{
	env = {
		live: true,
		test: false,
		polyProviders:['wss://speedy-nodes-nyc.moralis.io/'+keys.moralis+'/polygon/mainnet/ws'],
		bscProviders:['wss://speedy-nodes-nyc.moralis.io/'+keys.moralis+'/bsc/mainnet/ws'],
	}
}



module.exports = env