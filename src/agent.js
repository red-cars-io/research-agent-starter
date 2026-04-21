/**
 * Research Agent - Main implementation showing MCP chaining
 *
 * This example demonstrates how to chain multiple MCPs for
 * comprehensive research workflows.
 */

import { ApifyClient } from 'apify';

const apify = new ApifyClient({
  token: process.env.APIFY_API_TOKEN
});

/**
 * Main research agent class
 */
class ResearchAgent {
  constructor(apiToken) {
    this.apify = new ApifyClient({ token: apiToken });
  }

  /**
   * Research tech transfer potential at a university
   * Chains: university-research-mcp → healthcare-compliance-mcp
   */
  async researchTechTransfer(university) {
    console.log(`\n=== Tech Transfer Research: ${university} ===\n`);

    const results = {
      university,
      timestamp: new Date().toISOString(),
      data: {}
    };

    // Step 1: Get institution report
    console.log('Fetching institution report...');
    const institutionReport = await this.callMCP('university-research-mcp', {
      action: 'institution_report',
      university,
      include: ['spinouts', 'patents', 'researchFunding']
    });
    results.data.institution = institutionReport;

    // Step 2: Get spinout landscape
    console.log('Analyzing spinout landscape...');
    const spinouts = await this.callMCP('university-research-mcp', {
      action: 'spinout_landscape',
      university,
      industry: 'healthcare'
    });
    results.data.spinouts = spinouts;

    // Step 3: Check FDA approvals for medical device spinouts
    console.log('Checking FDA status of medical device companies...');
    const fdaApprovals = await this.callMCP('healthcare-compliance-mcp', {
      action: 'search_fda_approvals',
      searchTerm: university,
      deviceState: 'Approved'
    });
    results.data.fdaApprovals = fdaApprovals;

    // Step 4: Search for relevant clinical trials
    console.log('Finding related clinical trials...');
    const clinicalTrials = await this.callMCP('healthcare-compliance-mcp', {
      action: 'search_clinical_trials',
      condition: this.extractResearchFocus(university, institutionReport),
      phase: 'Phase 3'
    });
    results.data.clinicalTrials = clinicalTrials;

    // Generate summary
    results.summary = this.generateSummary(results.data);

    return results;
  }

  /**
   * Research competitive landscape for a medical device company
   */
  async researchMedicalDeviceCompany(companyName) {
    console.log(`\n=== Medical Device Research: ${companyName} ===\n`);

    const results = {
      company: companyName,
      timestamp: new Date().toISOString(),
      data: {}
    };

    // Parallel MCP calls for efficiency
    console.log('Fetching FDA approvals, 510k clearances, and adverse events...');
    const [fdaApprovals, clearances, adverseEvents] = await Promise.all([
      this.callMCP('healthcare-compliance-mcp', {
        action: 'search_fda_approvals',
        searchTerm: companyName,
        deviceState: 'Approved'
      }),
      this.callMCP('healthcare-compliance-mcp', {
        action: 'search_510k',
        searchTerm: companyName
      }),
      this.callMCP('healthcare-compliance-mcp', {
        action: 'search_maude_events',
        manufacturer: companyName,
        dateFrom: '2022-01-01'
      })
    ]);

    results.data.fdaApprovals = fdaApprovals;
    results.data.clearances = clearances;
    results.data.adverseEvents = adverseEvents;

    // Generate summary
    results.summary = {
      totalApprovedDevices: fdaApprovals?.data?.total || 0,
      total510kClearances: clearances?.data?.total || 0,
      totalAdverseEvents: adverseEvents?.data?.total || 0
    };

    return results;
  }

  /**
   * Call an MCP actor
   */
  async callMCP(actorName, input) {
    try {
      const run = await this.apify.actor(actorName).start(input);
      const dataset = await this.apify.dataset(run.defaultDatasetId).listItems();
      return dataset.items[0] || null;
    } catch (error) {
      console.error(`Error calling ${actorName}:`, error.message);
      return { error: error.message };
    }
  }

  /**
   * Extract research focus from institution report
   */
  extractResearchFocus(university, report) {
    if (report?.data?.researchAreas) {
      return report.data.researchAreas[0] || 'medical device';
    }
    return 'medical device';
  }

  /**
   * Generate human-readable summary
   */
  generateSummary(data) {
    return {
      institutionName: data.institution?.data?.name || 'Unknown',
      spinoutCount: data.spinouts?.data?.total || 0,
      fdaApprovalCount: data.fdaApprovals?.data?.total || 0,
      clinicalTrialCount: data.clinicalTrials?.data?.total || 0
    };
  }
}

// Main execution
async function main() {
  const apiToken = process.env.APIFY_API_TOKEN;

  if (!apiToken || apiToken === 'your_apify_api_token_here') {
    console.error('Please set your APIFY_API_TOKEN in .env');
    process.exit(1);
  }

  const agent = new ResearchAgent(apiToken);

  // Run MIT tech transfer research
  const mitResults = await agent.researchTechTransfer('MIT');

  console.log('\n=== FINAL RESULTS ===');
  console.log(JSON.stringify(mitResults.summary, null, 2));

  // Run medical device company research
  const deviceResults = await agent.researchMedicalDeviceCompany('Medtronic');

  console.log('\n=== DEVICE COMPANY RESULTS ===');
  console.log(JSON.stringify(deviceResults.summary, null, 2));
}

// Run if executed directly
main().catch(console.error);

export { ResearchAgent };
