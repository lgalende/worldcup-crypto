# World Cup Crypto - Web 3.0 Blockchain Application

## Front-end
`cd client`

`npm run dev`

The application will run on `localhost:3000`.

## Blockchain (choose the network you want)
`cd smart_contract`

`npx hardhat run scripts/deploy.js --network mumbai`

And copy the contract address into `client/utils/constants.js`.

Also, copy the file generated in `artifacts/contracts/ContractName.sol/ContractName.json` to `client/utils`.
