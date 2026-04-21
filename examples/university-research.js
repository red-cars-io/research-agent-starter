/**
 * University Research MCP Examples
 *
 * Demonstrates how to use the university-research-mcp for
 * institution reports, faculty searches, and spinout analysis.
 */

import { ApifyClient } from 'apify';

const apify = new ApifyClient({
  token: process.env.APIFY_API_TOKEN
});

/**
 * Example 1: Get comprehensive institution report
 */
async function institutionReportExample() {
  console.log('=== Institution Report: MIT ===\n');

  const result = await apify.call('university-research-mcp', {
    action: 'institution_report',
    university: 'MIT',
    include: ['faculty', 'spinouts', 'patents', 'researchFunding']
  });

  console.log('Institution Data:');
  console.log(JSON.stringify(result, null, 2));

  return result;
}

/**
 * Example 2: Search for AI researchers at Stanford
 */
async function facultySearchExample() {
  console.log('\n=== Faculty Search: Stanford AI Researchers ===\n');

  const result = await apify.call('university-research-mcp', {
    action: 'search_faculty',
    university: 'Stanford University',
    researchArea: 'artificial intelligence',
    department: 'Computer Science',
    limit: 10
  });

  console.log('AI Faculty at Stanford:');
  console.log(JSON.stringify(result, null, 2));

  return result;
}

/**
 * Example 3: Get healthcare spinouts from Johns Hopkins
 */
async function spinoutLandscapeExample() {
  console.log('\n=== Spinout Landscape: Johns Hopkins Healthcare ===\n');

  const result = await apify.call('university-research-mcp', {
    action: 'spinout_landscape',
    university: 'Johns Hopkins University',
    industry: 'healthcare',
    yearFrom: '2018'
  });

  console.log('Healthcare Spinouts:');
  console.log(JSON.stringify(result, null, 2));

  return result;
}

/**
 * Example 4: Compare multiple universities
 */
async function universityComparisonExample() {
  console.log('\n=== University Comparison: Tech Transfer ===\n');

  const universities = [
    'MIT',
    'Stanford University',
    'University of California, Berkeley',
    'Carnegie Mellon University'
  ];

  const results = await Promise.all(
    universities.map(async (uni) => {
      const report = await apify.call('university-research-mcp', {
        action: 'institution_report',
        university: uni,
        include: ['spinouts', 'patents']
      });
      return { university: uni, data: report };
    })
  );

  console.log('Comparison Results:');
  results.forEach(({ university, data }) => {
    console.log(`\n${university}:`);
    console.log(`  - Spinouts: ${data.data?.spinouts?.length || 0}`);
    console.log(`  - Patents: ${data.data?.patents?.length || 0}`);
  });

  return results;
}

// Run examples
async function main() {
  const token = process.env.APIFY_API_TOKEN;
  if (!token || token === 'your_apify_api_token_here') {
    console.log('Skipping examples - no API token set');
    console.log('Copy .env.example to .env and add your APIFY_API_TOKEN');
    return;
  }

  console.log('University Research MCP Examples\n');
  console.log('='.repeat(50));

  await institutionReportExample();
  await facultySearchExample();
  await spinoutLandscapeExample();
  await universityComparisonExample();

  console.log('\n=== Examples Complete ===');
}

main().catch(console.error);
