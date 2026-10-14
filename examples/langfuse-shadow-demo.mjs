// Optional Langfuse Cloud/self-hosted SHADOW demo.
// Does not contact AcqPath, buy reports or modify the retrieval pipeline.
import {pathToFileURL} from 'node:url';
import {createLangfuseEvidenceAdapter} from './langfuse-evidence.mjs';

export async function runLangfuseShadowDemo({
  startActiveObservation,scoreClient,resource='https://medium.com/article',
  purpose='ai-index'
}={}){
  const adapter=createLangfuseEvidenceAdapter({
    startActiveObservation,scoreClient,paidBuyerApproved:false,maxEvents:25
  });
  return startActiveObservation('example-public-web-ingestion',async()=>{
    return adapter.record({resource,purpose});
  });
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  if(!process.env.LANGFUSE_PUBLIC_KEY||!process.env.LANGFUSE_SECRET_KEY){
    console.error('LANGFUSE_PUBLIC_KEY and LANGFUSE_SECRET_KEY required for telemetry demo.');
    process.exitCode=2;
  }else{
    // Vendor packages are installed in the consuming demo app, not at repo root.
    const [{NodeSDK},{LangfuseSpanProcessor},{LangfuseClient},{startActiveObservation}]=
      await Promise.all([
        import('@opentelemetry/sdk-node'),
        import('@langfuse/otel'),
        import('@langfuse/client'),
        import('@langfuse/tracing')
      ]);
    const otel=new NodeSDK({spanProcessors:[new LangfuseSpanProcessor()]});
    const client=new LangfuseClient();
    try{
      otel.start();
      const result=await runLangfuseShadowDemo({
        startActiveObservation,scoreClient:client
      });
      console.log(JSON.stringify({
        mode:'shadow_no_purchase',status:result.status,
        reason:result.error?.code||null
      }));
    }finally{
      await client.shutdown();
      await otel.shutdown();
    }
  }
}
