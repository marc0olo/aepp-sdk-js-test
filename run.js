const { Universal: Ae, MemoryAccount, Node, Crypto } = require('@aeternity/aepp-sdk')
const fs = require('fs')

const CONTRACT_SOURCE = fs.readFileSync('./contracts/example-contract-compiler-v5.aes', 'utf8')
const SECOND_SOURCE = fs.readFileSync('./contracts/ExampleContract.aes', 'utf8')

const KEYPAIR = {
    secretKey: 'bb9f0b01c8c9553cfbaf7ef81a50f977b1326801ebf7294d1c2cbccdedf27476e9bbf604e611b5460a3b3999e9771b6f60417d73ce7c5519e12f7e127a1225ca',
    publicKey: 'ak_2mwRmUeYmfuW93ti9HMSUJzCk1EYcQEfikVSzgo6k2VghsWhgU'
}
const AE_NETWORK = process.env.AE_NETWORK || 'LOCAL'
const SETTINGS = {
    TESTNET: {
        nodeUrl: 'https://testnet.aeternity.io',
        compilerUrl: 'https://compiler.aepps.com',
        middlewareUrl: 'https://testnet.aeternity.io/mdw/',
      },
    MAINNET: {
        nodeUrl: 'https://mainnet.aeternity.io',
        compilerUrl: 'https://compiler.aepps.com',
        middlewareUrl: 'https://mainnet.aeternity.io/mdw/',
    },
    LOCAL: {
        nodeUrl: 'http://localhost:3001',
        compilerUrl: 'http://localhost:3080',
        middlewareUrl: undefined
    }
}

const main = async () => {
    const node = await Node({ url: SETTINGS[AE_NETWORK].nodeUrl, internalUrl: SETTINGS[AE_NETWORK].nodeUrl });
    const account = MemoryAccount({ keypair: KEYPAIR });
    const client = await Ae({
        nodes: [
          { name: AE_NETWORK, instance: node },
        ],
        compilerUrl: SETTINGS[AE_NETWORK].compilerUrl,
        accounts: [account],
        address: KEYPAIR.publicKey
    });

    let contractInstance = await client.getContractInstance({source: CONTRACT_SOURCE});
    let deploymentResult = await contractInstance.deploy([]);
    console.log(`Contract deployed at ${deploymentResult.address}`);
    try {
        let callResult = await contractInstance.methods.say_hello('Marco');
        console.log(`decoded result of say_hello: ${callResult.decodedResult}`);
    } catch(e) {
        // why this error ?!?!
        console.log(e.responseError);
    }
    const human = new Map();
    human.set(42, 42);
    let callResult = await contractInstance.methods.add_human(human);
    console.log(`decoded result of add_human: ${callResult.decodedResult}`);
    console.log(callResult.decodedResult);

    contractInstance = await client.getContractInstance({source: SECOND_SOURCE});
    deploymentResult = await contractInstance.deploy([]);
    console.log(`Contract deployed at ${deploymentResult.address}`);
    try {
        callResult = await contractInstance.methods.nameExists('C.hamster');
        console.log(`decoded result of nameExists: ${callResult.decodedResult}`);
        callResult = await contractInstance.methods.createHamster('C.hamster');
        callResult = await contractInstance.methods.nameExists('C.hamster');
        console.log(`decoded result of nameExists: ${callResult.decodedResult}`);
    } catch(e) {
        // why this error ?!?!
        console.log(e.responseError);
    }
}

main()