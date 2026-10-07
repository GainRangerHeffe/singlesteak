# Single Steak

Single-sided staking pools for PulseChain. Any project or community can create a pool where holders stake one token and earn rewards, with no liquidity pair required.

## What is in this repo

A static front end. There is no build step.

| File | Purpose |
|---|---|
| `index.html` | The app: connect a wallet, browse pools, stake, unstake, claim, create a pool and manage your own pools |
| `poolca.html` | How to verify a pool contract on PulseScan, with the pool source code |
| `guide.html` | User guide |
| `whitepaper.html` | Protocol whitepaper (v1.0.0) |
| `app.js` | Wallet connection, contract calls and pool logic |
| `styles.css` | Shared design tokens and styles for all four pages |
| `nav.js` | Mobile menu for the three documentation pages |
| `robots.txt`, `sitemap.xml`, `llms.txt` | Crawler and AI-assistant discovery files |
| `images/`, `assets/` | Logos, wallet icons and illustrations |

The front end talks to a pool factory contract on PulseChain (chain ID 369, `0x171`). The factory address is set at the top of `app.js`.

## Run locally

Serve the folder with any static file server:

```bash
npx serve .
```

Then open the printed URL in a browser with a wallet extension (MetaMask, Rabby, OKX and Internet Money are supported) set to PulseChain.

## Configuration

The constants at the top of `app.js` need real values before the app is usable:

- `FACTORY_ADDRESS`, `STEAK_POOL_ADDRESS`, `TAX_RECIPIENT_ADDRESS`: deployed contract and wallet addresses
- `PINATA_API_KEY`, `PINATA_SECRET_KEY`, `PINATA_GATEWAY`: [Pinata](https://www.pinata.cloud/) credentials, used to pin pool logos to IPFS

Do not commit real Pinata keys. Anything in `app.js` is public to every visitor, so for production the upload should go through a small backend that holds the keys.

## Editing notes

`app.js` finds elements by ID and class name and builds pool cards from the `<template>` in `index.html`, so keep those hooks when changing markup. The FAQ on the home page and the `FAQPage` JSON-LD in its `<head>` must say the same thing.

## Status

Built in 2025. The project is no longer actively maintained and the original domain is not being renewed; this repo is the archive of the site.
