const ws = require("ws");
const axios = require("axios");
const {LTO} = require("@ltonetwork/lto");

const client = new ws('ws://localhost:3000/connect');
const lto = new LTO(process.env.LTO_NETWORK_ID || 'T');

client.once('message', async code => {
    const account = lto.account();

    console.log(`Auth with ${account.address} using ${code}`);

    client.once('message', async json => {
        const data = JSON.parse(json);
        console.log('connected', data);

        client.close();
    });

    await axios.post(`http://localhost:3000/${code}`,{
        keyType: account.keyType,
        publicKey: account.publicKey,
        signature: account.sign(`lto:sign:http://localhost/${code}`).base58,
    }, {timeout: 5000});
});
