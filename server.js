const express = require("express");
const bodyParser = require("body-parser");
const ws = require("ws");
const crypto = require("crypto");
const { LTO, Binary } = require("@ltonetwork/lto");

const app = express();
const wsSockets = new Map();
const lto = new LTO(process.env.LTO_NETWORK_ID || 'T');
const port = process.env.PORT || 3000;

const wsServer = new ws.Server({ noServer: true, path: "/connect" });
wsServer.on('connection', async socket => {
    const bytes = await crypto.randomBytes(32);
    const code = new Binary(bytes).base58;

    wsSockets.set(code, socket);

    socket.on('close', () => {
        wsSockets.delete(code);
    });

    socket.send(JSON.stringify({ code }));

    // Expecting a response within 10m
    setTimeout(() => socket.close(), 600000);
});

function clientError(res, status, message) {
    res.status(status).write(message)
    res.end();
}

app.use(bodyParser.json());

app.post('/:code', (req, res) => {
    const code = req.params.code;

    if (!wsSockets.has(code)) return clientError(res, 404, "Code is no longer active");
    if (!req.body.publicKey) return clientError(res, 400, "Missing required body param 'publicKey'");
    if (!req.body.signature) return clientError(res, 400, "Missing required body param 'signature'");

    const account = lto.account({
        keyType: req.body.keyType || 'ed25519',
        publicKey: req.body.publicKey,
    });

    // Accept both with and without port
    const messages = [
        `lto:sign:${req.protocol}://${req.hostname}${req.originalUrl}`,
        `lto:sign:${req.protocol}://${req.hostname}:${port}${req.originalUrl}`
    ];
    const verified = messages.filter(
        msg => account.verify(msg, Binary.fromBase58(req.body.signature))
    ).length > 0;

    if (!verified) {
        return clientError(res, 400, "Invalid signature");
    }

    wsSockets.get(code).send(JSON.stringify({
        address: account.address,
        keyType: account.keyType,
        publicKey: account.publicKey,
    }));

    res.status(200).write('connected');
    res.end();
})

const server = app.listen(port);
server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
        wsServer.emit('connection', socket, request);
    });
});
