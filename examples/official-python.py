from acqpath_httpx import AcqPathClient, PrivateFileStore, normalize_operation

# Inject an existing buyer-controlled eth_account LocalAccount.
async def preflight(account, operation_id, input, private_directory, allow_payment=False):
    buyer = AcqPathClient(
        signer=account, expected={"origin":"https://api.getacqpath.com","network":"eip155:8453","asset":"0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913","payTo":"0xf69DBbd053fb0Fbc78ADfdB1BFe3b0D1F57300ec","amount":"20000"},
        public_jwk={"kty":"OKP","crv":"Ed25519","x":"PzeeZ8d8Np85ix9ialbrLZz9ebY_Og72dScn1IAft6M"},
        store=PrivateFileStore(private_directory), allow_payment=allow_payment,
    )
    try:
        return await buyer.post('https://api.getacqpath.com/v1/rights/preflight',
                                json=input, operation_id=operation_id)
    finally:
        await buyer.aclose()

async def gateway(account, operation_id, input, private_directory, path, allow_payment=False):
    body = normalize_operation(input, path)
    deep = body['tier'] == 'deep'
    amount = (60000 if deep else 30000) if path.endswith('/revalidate') else (60000 if deep else 40000) + len(body['resources']) * (40000 if deep else 20000)
    buyer = AcqPathClient(signer=account,
        expected=dict(origin='https://api.getacqpath.com',path=path,network='eip155:8453',asset='0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',payTo='0xf69DBbd053fb0Fbc78ADfdB1BFe3b0D1F57300ec',amount=str(amount)),
        public_jwk=dict(kty='OKP',crv='Ed25519',x='PzeeZ8d8Np85ix9ialbrLZz9ebY_Og72dScn1IAft6M'),
        store=PrivateFileStore(private_directory),allow_payment=allow_payment)
    try:
        return await buyer.post('https://api.getacqpath.com'+path,json=body,operation_id=operation_id)
    finally:
        await buyer.aclose()

async def ingestion_gate(account, operation_id, input, private_directory, allow_payment=False):
    return await gateway(account,operation_id,input,private_directory,'/v1/rights/ingestion-gate',allow_payment)

async def revalidate(account, operation_id, input, private_directory, allow_payment=False):
    return await gateway(account,operation_id,input,private_directory,'/v1/rights/revalidate',allow_payment)
