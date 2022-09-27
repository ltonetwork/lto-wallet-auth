![github-banner](https://user-images.githubusercontent.com/100821/108692834-6a115200-74fd-11eb-92df-ee07bf62b386.png)

# LTO Wallet Auth

This service allows a user to log into the LTO web wallet using the mobile wallet (aka LTO Universal wallet).

## Installation

    npm ci

## Usage

    npm run start

By default, the service will work for testnet. For mainnet set env var `LTO_NETWORK_ID=L`.

### Step 1 - Web wallet

From the web wallet, create a websocket connection to `https://wallet-auth.lto.network/connect`. Upon connection the
service will send a code (in plain text). Use the code to create the url and generate the following JSON

```json
{
  "@schema": "http://schema.lto.network/simple-auth-v1.json",
  "url": "https://wallet-auth.lto.network/GMU7TD1EHtrVDrBLFpF3oKXTMMehRADiz8tUuhbsfque"
}
```

Generate a QR code of this JSON and display it.

### Step 2 - Mobile wallet

From the mobile wallet, scan the QR code. Check the schema to find out it's a request to log into the web wallet. Take
the URL and sign it. Create the following JSON message and do a POST request to the given URL

```json
{
  "address": "3JxqH4iGhTQzRWCMkWf4HYFjRXWf5yXZPq4",
  "keyType": "ed25519",
  "publicKey": "EKaNpcGAwQCzTfuxXdNYxnJ96drihkysehfxcprm7mH6",
  "signature": "58khekD4X4uCq7A5VSK6nzhe4ZKLUQtGsNYneAyaHgZWk8C8UwT66AiuBRPRWoNyYC2bR2V2qNMcLAaQePRJUSdS"
}
```

The server will respond with a 200 status upon success and otherwise with a 400 or 404 status.

### Step 3 - Web wallet

Upon a successful POST request from the mobile wallet, the auth service will send a message to web wallet over the
web socket

```json
{
  "address": "3JxqH4iGhTQzRWCMkWf4HYFjRXWf5yXZPq4",
  "keyType": "ed25519",
  "publicKey": "EKaNpcGAwQCzTfuxXdNYxnJ96drihkysehfxcprm7mH6"
}
```

## Test scripts

Run `node test.js` to test a whole round trip.

Run `node test-qr.js` to emulate the web wallet. This script generates a QR code to test the mobile wallet.
