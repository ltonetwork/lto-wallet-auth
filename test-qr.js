const ws = require("ws");
const qrcode = require('qrcode-terminal');

const client = new ws('ws://localhost:3000/connect');

client.once('message', async code => {
    client.once('message', async json => {
        const data = JSON.parse(json);
        console.log('connected', data);

        client.close();
    });

    const data = {
        "@schema": "http://schema.lto.network/simple-auth-v1.json",
        url: `http://localhost:3000/${code}`
    };

    qrcode.generate(JSON.stringify(data), {small: true});
});
