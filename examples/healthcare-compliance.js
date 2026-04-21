/**
 * Healthcare Compliance MCP Examples
 *
 * Demonstrates FDA approvals, 510(k) clearances, MAUDE adverse events,
 * and ClinicalTrials.gov searches.
 */

import { ApifyClient } from 'apify';

const apify = new ApifyClient({
  token: process.env.APIFY_API_TOKEN
});

/**
 * Example 1: Search FDA approvals for a company
 */
async function fdaApprovalsExample() {
  console.log('=== FDA Approvals: Medtronic Cardiac Devices ===\n');

  const result = await apify.call('healthcare-compliance-mcp', {
    action: 'search_fda_approvals',
    searchTerm: 'Medtronic cardiac',
    deviceState: 'Approved',
    dateFrom: '2020-01-01'
  });

  console.log('FDA Approved Devices:');
  console.log(JSON.stringify(result, null, 2));

  return result;
}

/**
 * Example 2: Search 510(k) premarket notifications
 */
async function search510kExample() {
  console.log('\n=== 510(k) Clearances: Glucose Monitors ===\n');

  const result = await apify.call('healthcare-compliance-mcp', {
    action: 'search_510k',
    searchTerm: 'glucose monitor',
    productCode: 'DQJ',  // Blood glucose meter
    dateFrom: '2022-01-01'
  });

  console.log('510(k) Clearances:');
  console.log(JSON.stringify(result, null, 2));

  return result;
}

/**
 * Example 3: Search MAUDE adverse events
 */
async function maudeEventsExample() {
  console.log('\n=== MAUDE Adverse Events: Insulin Pumps ===\n');

  const result = await apify.call('healthcare-compliance-mcp', {
    action: 'search_maude_events',
    manufacturer: 'Medtronic',
    deviceName: 'insulin pump',
    dateFrom: '2021-01-01',
    dateTo: '2024-12-31'
  });

  console.log('Adverse Event Reports:');
  console.log(JSON.stringify(result, null, 2));

  return result;
}

/**
 * Example 4: Search Clinical Trials
 */
async function clinicalTrialsExample() {
  console.log('\n=== Clinical Trials: CAR-T Cell Therapy ===\n');

  const result = await apify.call('healthcare-compliance-mcp', {
    action: 'search_clinical_trials',
    condition: 'CAR-T cell lymphoma',
    intervention: 'CD19 directed CAR-T',
    phase: 'Phase 2',
    location: 'United States'
  });

  console.log('Clinical Trials:');
  console.log(JSON.stringify(result, null, 2));

  return result;
}

/**
 * Example 5: Full regulatory landscape for a company
 */
async function regulatoryLandscapeExample(companyName) {
  console.log(`\n=== Regulatory Landscape: ${companyName} ===\n`);

  const [approvals, clearances, adverseEvents] = await Promise.all([
    apify.call('healthcare-compliance-mcp', {
      action: 'search_fda_approvals',
      searchTerm: companyName,
      deviceState: 'Approved'
    }),
    apify.call('healthcare-compliance-mcp', {
      action: 'search_510k',
      searchTerm: companyName
    }),
    apify.call('healthcare-compliance-mcp', {
      action: 'search_maude_events',
      manufacturer: companyName,
      dateFrom: '2022-01-01'
    })
  ]);

  const summary = {
    company: companyName,
    fdaApprovedDevices: approvals.data?.total || 0,
   510kClearances: clearances.data?.total || 0,
    adverseEvents2022Present: adverseEvents.data?.total || 0
  };

  console.log('Regulatory Summary:');
  console.log(JSON.stringify(summary, null, 2));

  return { approvals, clearances, adverseEvents, summary };
}

// Run examples
async function main() {
  const token = process.env.APIFY_API_TOKEN;
  if (!token || token === 'your_apify_api_token_here') {
    console.log('Skipping examples - no API token set');
    console.log('Copy .env.example to .env and add your APIFY_API_TOKEN');
    return;
  }

  console.log('Healthcare Compliance MCP Examples\n');
  console.log('='.repeat(50));

  await fdaApprovalsExample();
  await search510kExample();
  await maudeEventsExample();
  await clinicalTrialsExample();
  await regulatoryLandscapeExample('Medtronic');
  await regulatoryLandscapeExample('Abbott');

  console.log('\n=== Examples Complete ===');
}

main().catch(console.error);
