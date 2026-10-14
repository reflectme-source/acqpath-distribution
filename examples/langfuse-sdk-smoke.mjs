// Optional SDK v6 integration smoke, entirely in memory: no Langfuse API call.
import assert from 'node:assert/strict';
import {context} from '@opentelemetry/api';
import {AsyncLocalStorageContextManager} from '@opentelemetry/context-async-hooks';
import {BasicTracerProvider,InMemorySpanExporter,SimpleSpanProcessor} from '@opentelemetry/sdk-trace-base';
import {startActiveObservation,setLangfuseTracerProvider} from '@langfuse/tracing';
import {runLangfuseShadowDemo} from './langfuse-shadow-demo.mjs';

const collector=new InMemorySpanExporter();
const provider=new BasicTracerProvider({spanProcessors:[new SimpleSpanProcessor(collector)]});
const manager=new AsyncLocalStorageContextManager().enable();
context.setGlobalContextManager(manager);
setLangfuseTracerProvider(provider);
try{
  const result=await runLangfuseShadowDemo({startActiveObservation});
  const spans=collector.getFinishedSpans();
  const child=spans.find(s=>s.name==='acqpath-rights-observation');
  const parent=spans.find(s=>s.name==='example-public-web-ingestion');
  assert.ok(parent&&child,'Langfuse parent and child required');
  assert.equal(child.spanContext().traceId,parent.spanContext().traceId);
  assert.equal(child.parentSpanContext?.spanId,parent.spanContext().spanId);
  assert.equal(result.status,'unavailable');
  assert.equal(result.error.code,'PAID_BUYER_DISABLED_SHADOW_ONLY');
  assert.equal(JSON.stringify(child.attributes).includes('https://medium.com/article'),false);
  assert.equal(JSON.parse(child.attributes['langfuse.observation.metadata.acqpathMode']),'shadow_no_purchase');
  console.log(JSON.stringify({
    status:'SDK_V6_IN_MEMORY_SMOKE_PASS',
    spans:spans.length,paidReports:0,externalLangfuseCalls:0
  }));
}finally{
  context.disable();
  await provider.shutdown();
}
