import { createAcqPathFetch, privateFileStore } from './acqpath.mjs';

// Inject an existing buyer-controlled viem EOA signer. No key is stored here.
export async function preflight({ signer, operationId, input, privateDirectory, allowPayment = false }) {
  const buy = createAcqPathFetch({
    signer, expected: {"origin":"https://api.getacqpath.com","network":"eip155:8453","asset":"0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913","payTo":"0xf69DBbd053fb0Fbc78ADfdB1BFe3b0D1F57300ec","amount":"20000"},
    publicJwk: {"key_ops":["verify"],"ext":true,"alg":"Ed25519","crv":"Ed25519","x":"PzeeZ8d8Np85ix9ialbrLZz9ebY_Og72dScn1IAft6M","kty":"OKP"},
    store: privateFileStore(privateDirectory), allowPayment,
  });
  return buy('https://api.getacqpath.com/v1/rights/preflight', {
    method: 'POST', operationId, body: JSON.stringify(input),
  });
}
