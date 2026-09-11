// Unpaid integration examples. No generic paid-client compatibility is implied.
type Purpose = 'ai-input' | 'ai-index' | 'ai-train' | 'search';
type Probe = (resource: string, purpose: Purpose) => Promise<unknown>;
export function workflows(probe: Probe) {
 return {
  ragIngestion: (url: string) => probe(url, 'ai-index'),
  researchOrSummarization: (url: string) => probe(url, 'ai-input'),
  trainingData: (url: string) => probe(url, 'ai-train'),
  searchIndex: (url: string) => probe(url, 'search'),
  crawlerDownstreamAI: async (url: string, robotsAndPolicyPermitFetch: boolean) => {
   if (!robotsAndPolicyPermitFetch) return {status: 'HOLD_CRAWL'};
   return probe(url, 'ai-input'); // Evidence for subsequent AI use, not crawl permission.
  }
 };
}
