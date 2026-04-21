/**
 * Academic Research MCP Examples
 *
 * Demonstrates how to search academic papers, build citation networks,
 * and analyze author profiles using the academic-research-mcp.
 *
 * Note: This MCP is currently in development. Check the GitHub repo
 * for current availability.
 */

import { ApifyClient } from 'apify';

const apify = new ApifyClient({
  token: process.env.APIFY_API_TOKEN
});

/**
 * Example 1: Search for papers on a topic
 */
async function searchPapersExample() {
  console.log('=== Academic Search: Transformer Models in Genomics ===\n');

  const result = await apify.call('academic-research-mcp', {
    action: 'search_scholars',
    query: 'transformer models genomics',
    yearFrom: '2020',
    yearTo: '2024',
    limit: 20
  });

  console.log('Academic Papers:');
  console.log(JSON.stringify(result, null, 2));

  return result;
}

/**
 * Example 2: Get author profile and metrics
 */
async function authorProfileExample() {
  console.log('\n=== Author Profile: Demis Hassabis ===\n');

  const result = await apify.call('academic-research-mcp', {
    action: 'author_profile',
    authorName: 'Demis Hassabis',
    institution: 'DeepMind'
  });

  console.log('Author Profile:');
  console.log(JSON.stringify(result, null, 2));

  return result;
}

/**
 * Example 3: Build citation network for a paper
 */
async function citationNetworkExample() {
  console.log('\n=== Citation Network: AlphaFold Paper ===\n');

  const result = await apify.call('academic-research-mcp', {
    action: 'citation_network',
    paperId: 'arXiv:2108.12274',  // AlphaFold paper
    depth: 2
  });

  console.log('Citation Network:');
  console.log(JSON.stringify(result, null, 2));

  return result;
}

/**
 * Example 4: Research trend analysis
 */
async function researchTrendsExample() {
  console.log('\n=== Research Trends: CRISPR Delivery Systems ===\n');

  // Get papers from different time periods
  const [early, recent] = await Promise.all([
    apify.call('academic-research-mcp', {
      action: 'search_scholars',
      query: 'CRISPR gene editing delivery',
      yearFrom: '2015',
      yearTo: '2019',
      limit: 50
    }),
    apify.call('academic-research-mcp', {
      action: 'search_scholars',
      query: 'CRISPR gene editing delivery',
      yearFrom: '2020',
      yearTo: '2024',
      limit: 50
    })
  ]);

  console.log('Research Growth:');
  console.log(`  2015-2019: ${early.data?.total || 0} papers`);
  console.log(`  2020-2024: ${recent.data?.total || 0} papers`);

  // Identify emerging themes
  console.log('\nRecent Emerging Themes:');
  if (recent.data?.papers) {
    const themes = recent.data.papers
      .flatMap(p => p.keywords || [])
      .reduce((acc, kw) => {
        acc[kw] = (acc[kw] || 0) + 1;
        return acc;
      }, {});
    Object.entries(themes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([theme, count]) => {
        console.log(`  - ${theme}: ${count} papers`);
      });
  }

  return { early, recent };
}

/**
 * Example 5: Competitive landscape in a research area
 */
async function competitiveLandscapeExample() {
  console.log('\n=== Competitive Landscape: mRNA Vaccine Research ===\n');

  const institutions = [
    'Moderna',
    'BioNTech',
    'Pfizer',
    'University of Pennsylvania'
  ];

  const results = await Promise.all(
    institutions.map(async (institution) => {
      const papers = await apify.call('academic-research-mcp', {
        action: 'search_scholars',
        query: 'mRNA vaccine',
        institution,
        yearFrom: '2020',
        yearTo: '2024',
        limit: 100
      });
      return { institution, paperCount: papers.data?.total || 0 };
    })
  );

  console.log('Research Output (2020-2024):');
  results
    .sort((a, b) => b.paperCount - a.paperCount)
    .forEach(({ institution, paperCount }) => {
      console.log(`  ${institution}: ${paperCount} papers`);
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

  console.log('Academic Research MCP Examples\n');
  console.log('='.repeat(50));

  await searchPapersExample();
  await authorProfileExample();
  await citationNetworkExample();
  await researchTrendsExample();
  await competitiveLandscapeExample();

  console.log('\n=== Examples Complete ===');
}

main().catch(console.error);
