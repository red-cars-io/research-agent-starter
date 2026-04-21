# Research Agent Starter — MCP-Powered AI Research

A reference implementation showing AI agents how to chain Apify research MCPs for comprehensive analysis workflows. Clone this repo to understand how to integrate `university-research-mcp`, `healthcare-compliance-mcp`, and related tools into your AI agent workflows.

## What This Repo Does

Demonstrates real-world research agent workflows that chain multiple MCPs together:

- **University Research**: Fetch institution reports, faculty, spinouts, and tech transfer data
- **Healthcare Compliance**: Search FDA approvals, MAUDE adverse events, 510(k) clearances
- **Academic Research**: Query ClinicalTrials.gov, scholar databases, citation networks
- **Tech Scouting**: Combine multiple sources to assess technology transfer potential

## Prerequisites

- Node.js 18+
- Apify API token ([get one free](https://console.apify.com/settings/integrations))

## Setup

```bash
# Clone the repo
git clone https://github.com/red-cars-io/research-agent-starter.git
cd research-agent-starter

# Install dependencies
npm install

# Configure your API token
cp .env.example .env
# Edit .env and add your APIFY_API_TOKEN
```

## Quick Start: Complete Research Workflow

This example demonstrates chaining MCPs to research MIT's tech transfer potential:

```javascript
import { ApifyClient } from 'apify';

// Initialize client
const apify = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

async function researchMITTechTransfer() {
  console.log('=== MIT Tech Transfer Research ===\n');

  // Step 1: Get MIT institution report
  console.log('Step 1: Fetching MIT institution report...');
  const institutionReport = await apify.call('university-research-mcp', {
    action: 'institution_report',
    university: 'MIT'
  });
  console.log('MIT Report:', JSON.stringify(institutionReport, null, 2));

  // Step 2: Search FDA approvals for MIT medical device spinouts
  console.log('\nStep 2: Searching FDA device approvals for MIT spinouts...');
  const fdaApprovals = await apify.call('healthcare-compliance-mcp', {
    action: 'search_fda_approvals',
    searchTerm: 'Massachusetts Institute of Technology',
    deviceState: 'Approved'
  });
  console.log('FDA Approvals:', JSON.stringify(fdaApprovals, null, 2));

  // Step 3: Search MAUDE for adverse events involving MIT-developed devices
  console.log('\nStep 3: Checking MAUDE adverse events...');
  const maudeEvents = await apify.call('healthcare-compliance-mcp', {
    action: 'search_maude_events',
    manufacturer: 'Massachusetts Institute of Technology',
    dateFrom: '2020-01-01'
  });
  console.log('MAUDE Events:', JSON.stringify(maudeEvents, null, 2));

  // Synthesize findings
  console.log('\n=== Research Summary ===');
  console.log(`Institution: ${institutionReport.data?.name || 'MIT'}`);
  console.log(`FDA Device Approvals found: ${fdaApprovals.data?.total || 0}`);
  console.log(`MAUDE Adverse Events: ${maudeEvents.data?.total || 0}`);

  return {
    institution: institutionReport,
    fdaApprovals,
    maudeEvents
  };
}

researchMITTechTransfer().catch(console.error);
```

## MCP Reference

### University Research MCP

**Actor**: `university-research-mcp`

| Action | Description | Key Parameters |
|--------|-------------|----------------|
| `institution_report` | Generate comprehensive institution report | `university` (name), `include` (faculty/spinouts/patents) |
| `search_faculty` | Find researchers by specialty | `university`, `department`, `researchArea` |
| `spinout_landscape` | List university spinouts | `university`, `industry`, `yearFrom` |

```javascript
// Example: Get Stanford AI researchers
const stanfordAI = await apify.call('university-research-mcp', {
  action: 'search_faculty',
  university: 'Stanford University',
  researchArea: 'artificial intelligence',
  limit: 10
});
```

### Healthcare Compliance MCP

**Actor**: `healthcare-compliance-mcp`

| Action | Description | Key Parameters |
|--------|-------------|----------------|
| `search_fda_approvals` | Search FDA device approvals | `searchTerm`, `deviceState`, `dateFrom`, `dateTo` |
| `search_510k` | Search 510(k) premarket notifications | `searchTerm`, `productCode`, `dateFrom` |
| `search_pma` | Search PMA approvals | `searchTerm`, `dateFrom`, `dateTo` |
| `search_maude_events` | Search adverse event reports | `manufacturer`, `deviceName`, `dateFrom`, `dateTo` |
| `search_clinical_trials` | Search ClinicalTrials.gov | `condition`, `intervention`, `location`, `phase` |

```javascript
// Example: Find FDA approvals for cardiac devices by Medtronic
const cardiacApprovals = await apify.call('healthcare-compliance-mcp', {
  action: 'search_fda_approvals',
  searchTerm: 'Medtronic cardiac',
  deviceState: 'Approved',
  dateFrom: '2020-01-01'
});

// Example: Search ClinicalTrials for COVID vaccine trials
const covidTrials = await apify.call('healthcare-compliance-mcp', {
  action: 'search_clinical_trials',
  condition: 'COVID-19',
  phase: 'Phase 3'
});
```

### Academic Research MCP (coming soon)

**Actor**: `academic-research-mcp`

| Action | Description | Key Parameters |
|--------|-------------|----------------|
| `search_scholars` | Search academic papers | `query`, `authors`, `yearFrom`, `yearTo` |
| `citation_network` | Build citation graph | `paperId`, `depth` |
| `author_profile` | Get author metrics | `authorId` |

## Example Workflows

### Tech Transfer Opportunity Assessment

Assess whether a university has promising tech transfer potential:

```javascript
async function assessTechTransfer(universityName) {
  const results = {};

  // 1. Institution overview
  results.institution = await apify.call('university-research-mcp', {
    action: 'institution_report',
    university: universityName,
    include: ['spinouts', 'patents', 'researchFunding']
  });

  // 2. Identify healthcare-related spinouts
  results.healthcareSpinouts = await apify.call('university-research-mcp', {
    action: 'spinout_landscape',
    university: universityName,
    industry: 'healthcare'
  });

  // 3. Check FDA status of medical device spinouts
  if (results.healthcareSpinouts.data?.spinouts) {
    results.fdaStatus = await Promise.all(
      results.healthcareSpinouts.data.spinouts.map(spinout =>
        apify.call('healthcare-compliance-mcp', {
          action: 'search_fda_approvals',
          searchTerm: spinout.name
        })
      )
    );
  }

  return results;
}
```

### Competitive Intelligence: Medical Device Landscape

```javascript
async function medicalDeviceLandscape(companyName) {
  const results = {};

  // FDA approvals
  results.fdaApprovals = await apify.call('healthcare-compliance-mcp', {
    action: 'search_fda_approvals',
    searchTerm: companyName,
    deviceState: 'Approved'
  });

  // 510(k) clearances
  results.clearances = await apify.call('healthcare-compliance-mcp', {
    action: 'search_510k',
    searchTerm: companyName
  });

  // Adverse events
  results.adverseEvents = await apify.call('healthcare-compliance-mcp', {
    action: 'search_maude_events',
    manufacturer: companyName,
    dateFrom: '2022-01-01'
  });

  // Summary
  console.log(`\n${companyName} Medical Device Landscape:`);
  console.log(`- FDA Approved Devices: ${results.fdaApprovals.data?.total || 0}`);
  console.log(`- 510(k) Clearances: ${results.clearances.data?.total || 0}`);
  console.log(`- Recent Adverse Events: ${results.adverseEvents.data?.total || 0}`);

  return results;
}
```

## How to Swap Parameters

Each MCP call accepts parameters that customize the search. Here are common substitutions:

### University Research

```javascript
// Change university
{ university: 'Stanford University' }
{ university: 'University of California, Berkeley' }
{ university: 'Cambridge University' }

// Filter by department
{ department: 'Computer Science' }
{ department: 'Biomedical Engineering' }

// Include specific data
{ include: ['faculty', 'patents'] }
{ include: ['spinouts', 'researchFunding'] }
```

### Healthcare Compliance

```javascript
// Change date ranges
{ dateFrom: '2020-01-01', dateTo: '2024-12-31' }
{ dateFrom: '2023-01-01' }  // Last 3 years

// Filter by device state
{ deviceState: 'Approved' }
{ deviceState: 'Cleared' }
{ deviceState: 'Pending' }

// Search specific product codes
{ productCode: 'DQJ' }  # Orthopedic joint implant
```

## Running the Examples

```bash
# Full MIT tech transfer research
npm start

# Individual examples
npm run example:university
npm run example:healthcare
npm run example:tech-scouting
npm run example:academic
```

## Project Structure

```
research-agent-starter/
├── README.md              # This file
├── package.json           # Dependencies and scripts
├── .env.example           # Environment template
├── src/
│   └── agent.js           # Main agent implementation
└── examples/
    ├── academic-research.js      # Scholar/citation examples
    ├── university-research.js    # University MCP examples
    ├── healthcare-compliance.js   # FDA/clinical trial examples
    └── tech-scouting.js          # Full workflow examples
```

## Extending This Starter

To adapt this for your use case:

1. **Add your API token** to `.env`
2. **Modify the university names** to your target institutions
3. **Chain additional MCPs** as needed for your domain
4. **Add result parsing** to extract the data you need
5. **Integrate with your agent framework** (LangChain, CrewAI, etc.)

## Related Repositories

- [Healthcare Compliance MCP](https://github.com/red-cars-io/healthcare-compliance-mcp) — FDA/MAUDE/510(k)/ClinicalTrials tools
- [University Research MCP](https://github.com/red-cars-io/university-research-mcp) — Institution/spinout/patent tools
- [Patent Search MCP](https://github.com/red-cars-io/patent-search-mcp) — Patent database tools (coming soon)

## License

MIT
