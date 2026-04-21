/**
 * Tech Scouting Examples
 *
 * Full workflows demonstrating how to chain MCPs for comprehensive
 * technology transfer and competitive intelligence research.
 */

import { ApifyClient } from 'apify';

const apify = new ApifyClient({
  token: process.env.APIFY_API_TOKEN
});

/**
 * Workflow 1: MIT Tech Transfer Assessment
 *
 * Research question: What is the tech transfer potential at MIT?
 * What patents, spinouts, and FDA-approved devices exist?
 */
async function mitTechTransferAssessment() {
  console.log('='.repeat(60));
  console.log('WORKFLOW 1: MIT Tech Transfer Assessment');
  console.log('='.repeat(60));
  console.log();

  const results = {
    workflow: 'MIT Tech Transfer Assessment',
    timestamp: new Date().toISOString(),
    steps: {}
  };

  // Step 1: Institution overview
  console.log('[Step 1/4] Fetching MIT institution report...');
  const institution = await apify.call('university-research-mcp', {
    action: 'institution_report',
    university: 'MIT',
    include: ['spinouts', 'patents', 'researchFunding']
  });
  results.steps.institution = institution;
  console.log(`  -> Found ${institution.data?.spinouts?.length || 0} spinouts`);
  console.log(`  -> Found ${institution.data?.patents?.length || 0} patents`);

  // Step 2: Healthcare spinouts
  console.log('\n[Step 2/4] Analyzing healthcare spinouts...');
  const healthcareSpinouts = await apify.call('university-research-mcp', {
    action: 'spinout_landscape',
    university: 'MIT',
    industry: 'healthcare'
  });
  results.steps.healthcareSpinouts = healthcareSpinouts;
  const medTechSpinouts = healthcareSpinouts.data?.spinouts || [];
  console.log(`  -> Found ${medTechSpinouts.length} healthcare spinouts`);

  // Step 3: FDA approvals for MIT devices
  console.log('\n[Step 3/4] Checking FDA device approvals...');
  const fdaApprovals = await apify.call('healthcare-compliance-mcp', {
    action: 'search_fda_approvals',
    searchTerm: 'Massachusetts Institute of Technology',
    deviceState: 'Approved'
  });
  results.steps.fdaApprovals = fdaApprovals;
  console.log(`  -> Found ${fdaApprovals.data?.total || 0} FDA approved devices`);

  // Step 4: MAUDE adverse events
  console.log('\n[Step 4/4] Checking adverse event reports...');
  const adverseEvents = await apify.call('healthcare-compliance-mcp', {
    action: 'search_maude_events',
    manufacturer: 'Massachusetts Institute of Technology',
    dateFrom: '2020-01-01'
  });
  results.steps.adverseEvents = adverseEvents;
  console.log(`  -> Found ${adverseEvents.data?.total || 0} adverse events`);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Healthcare Spinouts: ${medTechSpinouts.length}`);
  console.log(`FDA Approved Devices: ${fdaApprovals.data?.total || 0}`);
  console.log(`Recent Adverse Events: ${adverseEvents.data?.total || 0}`);

  return results;
}

/**
 * Workflow 2: Medical Device Competitive Analysis
 *
 * Research question: How does Medtronic compare to Abbott in cardiac devices?
 */
async function cardiacDeviceCompetitiveAnalysis() {
  console.log('\n' + '='.repeat(60));
  console.log('WORKFLOW 2: Cardiac Device Competitive Analysis');
  console.log('='.repeat(60));
  console.log();

  const companies = ['Medtronic', 'Abbott', 'Boston Scientific'];
  const results = [];

  for (const company of companies) {
    console.log(`\nAnalyzing ${company}...`);

    const [approvals, clearances, adverseEvents] = await Promise.all([
      apify.call('healthcare-compliance-mcp', {
        action: 'search_fda_approvals',
        searchTerm: `${company} cardiac`,
        deviceState: 'Approved'
      }),
      apify.call('healthcare-compliance-mcp', {
        action: 'search_510k',
        searchTerm: `${company} cardiac`
      }),
      apify.call('healthcare-compliance-mcp', {
        action: 'search_maude_events',
        manufacturer: company,
        dateFrom: '2022-01-01'
      })
    ]);

    results.push({
      company,
      fdaApproved: approvals.data?.total || 0,
      clearances: clearances.data?.total || 0,
      adverseEvents: adverseEvents.data?.total || 0
    });
  }

  // Summary table
  console.log('\n' + '='.repeat(60));
  console.log('COMPETITIVE LANDSCAPE: CARDIAC DEVICES');
  console.log('='.repeat(60));
  console.log();
  console.log('Company'.padEnd(25) + 'FDA Approved'.padEnd(15) + '510(k)'.padEnd(12) + 'Adverse Events');
  console.log('-'.repeat(60));
  results.forEach(r => {
    console.log(
      r.company.padEnd(25) +
      String(r.fdaApproved).padEnd(15) +
      String(r.clearances).padEnd(12) +
      r.adverseEvents
    );
  });

  return results;
}

/**
 * Workflow 3: Emerging Technology Scout
 *
 * Research question: What universities are leading in AI+Healthcare research?
 * Who are the key spinouts and what is their regulatory status?
 */
async function emergingTechScout() {
  console.log('\n' + '='.repeat(60));
  console.log('WORKFLOW 3: Emerging AI+Healthcare Technology Scout');
  console.log('='.repeat(60));
  console.log();

  const universities = [
    'Stanford University',
    'MIT',
    'University of Pennsylvania',
    'University of California, San Francisco'
  ];

  const results = [];

  for (const uni of universities) {
    console.log(`\nScouting ${uni}...`);

    // Parallel fetch for speed
    const [institution, spinouts] = await Promise.all([
      apify.call('university-research-mcp', {
        action: 'institution_report',
        university: uni,
        include: ['researchAreas']
      }),
      apify.call('university-research-mcp', {
        action: 'spinout_landscape',
        university: uni,
        industry: 'healthcare'
      })
    ]);

    results.push({
      university: uni,
      researchAreas: institution.data?.researchAreas || [],
      healthcareSpinouts: spinouts.data?.spinouts?.length || 0,
      topSpinouts: spinouts.data?.spinouts?.slice(0, 3) || []
    });
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('AI+HEALTHCARE UNIVERSITY LEADERS');
  console.log('='.repeat(60));
  results
    .sort((a, b) => b.healthcareSpinouts - a.healthcareSpinouts)
    .forEach(r => {
      console.log(`\n${r.university} (${r.healthcareSpinouts} healthcare spinouts)`);
      console.log(`  Research focus: ${r.researchAreas.slice(0, 3).join(', ')}`);
    });

  return results;
}

// Run all workflows
async function main() {
  const token = process.env.APIFY_API_TOKEN;
  if (!token || token === 'your_apify_api_token_here') {
    console.log('Skipping workflows - no API token set');
    console.log('Copy .env.example to .env and add your APIFY_API_TOKEN');
    return;
  }

  await mitTechTransferAssessment();
  await cardiacDeviceCompetitiveAnalysis();
  await emergingTechScout();

  console.log('\n' + '='.repeat(60));
  console.log('ALL WORKFLOWS COMPLETE');
  console.log('='.repeat(60));
}

main().catch(console.error);
