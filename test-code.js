const axios = require("axios");
const {LTO} = require("@ltonetwork/lto");

if (process.argv.length < 3) {
    console.error("No URL supplied");
    process.exit(1);
}

const lto = new LTO(process.env.LTO_NETWORK_ID || 'T');
const account = lto.account({seed: process.env.LTO_SEED});

const url = process.argv[2];

console.log(`Auth with ${account.address} at ${url}`);

axios
    .post(url,{
        keyType: account.keyType,
        publicKey: account.publicKey,
        signature: account.sign(`lto:sign:${url}`).base58,
    }, {timeout: 5000})
    .then(resp => console.log(resp.data));
