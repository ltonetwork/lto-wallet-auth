const ws = require("ws");
const axios = require("axios");
const {LTO} = require("@ltonetwork/lto");

const lto = new LTO(process.env.LTO_NETWORK_ID || 'T');

const url = process.argv[2] || 'http://localhost:3000';
const client = new ws(url.replace(/^http/, 'ws') + '/connect');

client.once('message', async json => {
    const account = lto.account();
    const {code} = JSON.parse(json);
    
    if (!code) {
        console.error(`Invalid response: ${data}`);
        client.close();
    }

    console.log(`Auth with ${account.address} using ${code}`);

    client.once('message', async json => {
        const data = JSON.parse(json);
        console.log('connected', data);

        client.close();
    });

    try {
        console.log(`${url}/${code}`);
    
        await axios.post(`${url}/${code}`,{
            keyType: account.keyType,
            publicKey: account.publicKey,
            signature: account.sign(`lto:sign:${url}/${code}`).base58,
        }, {timeout: 5000});
    } catch (err) {
        console.error(`${err}. ${err.response.data}`);
        client.close();
    }
});
