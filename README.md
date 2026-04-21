# Research Agent Starter — MCP-Powered AI Research

# Add Academic Research to Your AI Agent in 5 Minutes

A practical guide for AI agent developers (LangChain, AutoGen, CrewAI) to add real-time academic research, FDA approvals, and university tech transfer data to their agents in minutes.

## What We're Building

A research agent that can:
1. Search for papers on a topic
2. Get institution profiles
3. Check FDA approvals for medical devices
4. Build a tech transfer assessment report

## Prerequisites

- Node.js 18+
- An Apify API token ([free account works](https://console.apify.com/settings/integrations))
- An AI agent framework: LangChain, AutoGen, or CrewAI

## Step 1: MCP Server Configuration

Add these MCP servers to your agent framework. All three use the `red-cars--` namespace:

```json
{
  "mcpServers": {
    "academic-research": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-apify", "red-cars--academic-research-mcp"],
      "env": {
        "APIFY_API_TOKEN": "${APIFY_API_TOKEN}"
      }
    },
    "university-research": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-apify", "red-cars--university-research-mcp"],
      "env": {
        "APIFY_API_TOKEN": "${APIFY_API_TOKEN}"
      }
    },
    "healthcare-compliance": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-apify", "red-cars--healthcare-compliance-mcp"],
      "env": {
        "APIFY_API_TOKEN": "${APIFY_API_TOKEN}"
      }
    }
  }
}
```

### LangChain Configuration

```javascript
import { ApifyAdapter } from "@langchain/community/tools/apify";
import { ChatOpenAI } from "@langchain/openai";
import { initializeAgentExecutorWithOptions } from "langchain/agents";

// Initialize the MCP tools
const tools = [
  new ApifyAdapter({
    token: process.env.APIFY_API_TOKEN,
    actorId: "red-cars--university-research-mcp",
  }),
  new ApifyAdapter({
    token: process.env.APIFY_API_TOKEN,
    actorId: "red-cars--healthcare-compliance-mcp",
  }),
];

const agent = await initializeAgentExecutorWithOptions(tools, new ChatOpenAI({
  model: "gpt-4",
  temperature: 0
}), { agentType: "openai-functions" });
```

### AutoGen Configuration

```javascript
import { MCPAgent } from "autogen-mcp";

// Register MCP servers
const researchAgent = new MCPAgent({
  name: "research-assistant",
  mcpServers: [
    {
      name: "academic-research",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-apify", "red-cars--academic-research-mcp"],
    },
    {
      name: "university-research",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-apify", "red-cars--university-research-mcp"],
    },
    {
      name: "healthcare-compliance",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-apify", "red-cars--healthcare-compliance-mcp"],
    }
  ]
});
```

### CrewAI Configuration

```yaml
# crewai.yaml
tools:
  - name: academic_research
    type: apify
    actor_id: red-cars--academic-research-mcp
    api_token: ${APIFY_API_TOKEN}

  - name: university_research
    type: apify
    actor_id: red-cars--university-research-mcp
    api_token: ${APIFY_API_TOKEN}

  - name: healthcare_compliance
    type: apify
    actor_id: red-cars--healthcare-compliance-mcp
    api_token: ${APIFY_API_TOKEN}
```

## Step 2: Simple Research Query

### LangChain: Search Papers on "Transformer Models for Time Series"

```javascript
import { ApifyAdapter } from "@langchain/community/tools/apify";

const searchTool = new ApifyAdapter({
  token: process.env.APIFY_API_TOKEN,
  actorId: "red-cars--academic-research-mcp",
});

const result = await searchTool.invoke({
  action: "search_scholars",
  query: "transformer models time series forecasting",
  yearFrom: "2020",
  yearTo: "2024",
  limit: 10
});

console.log(result);
// Returns: Array of papers with titles, authors, abstracts, citation counts
```

### AutoGen: Get Institution Profile

```javascript
const result = await researchAgent.execute({
  action: "institution_report",
  university: "Stanford University",
  include: ["faculty", "spinouts", "patents"]
});

console.log(result);
// Returns: Stanford institution data with faculty count, spinouts, patents
```

### CrewAI: Search FDA Approvals

```python
from crewai import Agent, Task

researcher = Agent(
    role="FDA Compliance Researcher",
    goal="Find FDA approvals for medical devices",
    tools=["healthcare_compliance"]
)

task = Task(
    description="Search FDA approvals for cardiac devices by Medtronic",
    agent=researcher,
    expected_output="List of FDA approved cardiac devices"
)

result = researcher.execute({
    action: "search_fda_approvals",
    searchTerm: "Medtronic cardiac",
    deviceState: "Approved",
    dateFrom: "2020-01-01"
})
```

## Step 3: Chain Multiple MCPs

### LangChain: Find Papers -> Institution Profile -> FDA Approvals

```javascript
import { ApifyAdapter } from "@langchain/community/tools/apify";
import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor } from "langchain/agents";

const tools = [
  new ApifyAdapter({
    token: process.env.APIFY_API_TOKEN,
    actorId: "red-cars--academic-research-mcp",
  }),
  new ApifyAdapter({
    token: process.env.APIFY_API_TOKEN,
    actorId: "red-cars--university-research-mcp",
  }),
  new ApifyAdapter({
    token: process.env.APIFY_API_TOKEN,
    actorId: "red-cars--healthcare-compliance-mcp",
  }),
];

const agent = await new AgentExecutor({
  agent: // ... your agent config
  tools,
});

// The agent can now:
// 1. Search for AI papers on a topic
// 2. Get the institution profile for paper authors
// 3. Check if any spinouts have FDA approvals
const response = await agent.invoke({
  input: "Find papers on transformer models for genomics from MIT researchers. Check if any MIT spinouts have FDA approved medical devices."
});
```

### AutoGen: Multi-Agent Research Pipeline

```javascript
// Create specialized research agents
const paperSearcher = new MCPAgent({
  name: "paper-searcher",
  mcpServers: [{ /* academic-research */ }]
});

const universityResearcher = new MCPAgent({
  name: "university-researcher",
  mcpServers: [{ /* university-research */ }]
});

const complianceChecker = new MCPAgent({
  name: "compliance-checker",
  mcpServers: [{ /* healthcare-compliance */ }]
});

// Pipeline: Search papers -> Get institution -> Check FDA status
const papers = await paperSearcher.execute({
  action: "search_scholars",
  query: "CRISPR gene editing delivery",
  yearFrom: "2020"
});

const institution = await universityResearcher.execute({
  action: "institution_report",
  university: "MIT"
});

const fdaApprovals = await complianceChecker.execute({
  action: "search_fda_approvals",
  searchTerm: institution.data.spinouts.map(s => s.name),
  deviceState: "Approved"
});
```

## Step 4: Build a Tech Transfer Report

### Full Example: MIT Tech Transfer Assessment

```javascript
import { ApifyClient } from 'apify';

const apify = new ApifyClient({ token: process.env.APIFY_API_TOKEN });

async function buildMITTechTransferReport() {
  console.log('=== MIT Tech Transfer Assessment ===\n');

  // Step 1: Get MIT institution report
  console.log('[1/4] Fetching MIT institution report...');
  const institution = await apify.call('university-research-mcp', {
    action: 'institution_report',
    university: 'MIT',
    include: ['spinouts', 'patents', 'researchFunding']
  });

  // Step 2: Get healthcare spinouts
  console.log('[2/4] Analyzing healthcare spinouts...');
  const healthcareSpinouts = await apify.call('university-research-mcp', {
    action: 'spinout_landscape',
    university: 'MIT',
    industry: 'healthcare'
  });

  // Step 3: Check FDA approvals for medical device spinouts
  console.log('[3/4] Checking FDA device approvals...');
  const medTechSpinouts = healthcareSpinouts.data?.spinouts || [];
  const fdaApprovals = await Promise.all(
    medTechSpinouts.map(spinout =>
      apify.call('healthcare-compliance-mcp', {
        action: 'search_fda_approvals',
        searchTerm: spinout.name,
        deviceState: 'Approved'
      })
    )
  );

  // Step 4: Search for recent papers on MIT healthcare research
  console.log('[4/4] Searching recent healthcare papers...');
  const recentPapers = await apify.call('academic-research-mcp', {
    action: 'search_scholars',
    query: 'MIT healthcare medical device',
    yearFrom: '2022',
    limit: 20
  });

  // Build the report
  const report = {
    summary: {
      institution: 'MIT',
      totalSpinouts: institution.data?.spinouts?.length || 0,
      healthcareSpinouts: medTechSpinouts.length,
      fdaApprovedDevices: fdaApprovals.filter(r => r.data?.total > 0).length,
      recentPapers: recentPapers.data?.total || 0
    },
    topSpinouts: medTechSpinouts.slice(0, 5).map(s => ({
      name: s.name,
      industry: s.industry,
      yearFounded: s.yearFounded,
      fdaApproved: fdaApprovals.find(r =>
        r.data?.devices?.some(d => d.manufacturer.includes(s.name))
      )?.data?.total > 0
    })),
    researchOutput: {
      papersLast2Years: recentPapers.data?.total || 0,
      topKeywords: recentPapers.data?.papers
        ?.flatMap(p => p.keywords || [])
        .reduce((acc, kw) => {
          acc[kw] = (acc[kw] || 0) + 1;
          return acc;
        }, {})
    }
  };

  console.log('\n=== REPORT SUMMARY ===');
  console.log(`Institution: ${report.summary.institution}`);
  console.log(`Total Spinouts: ${report.summary.totalSpinouts}`);
  console.log(`Healthcare Spinouts: ${report.summary.healthcareSpinouts}`);
  console.log(`FDA Approved Devices: ${report.summary.fdaApprovedDevices}`);
  console.log(`Recent Papers (2022+): ${report.summary.recentPapers}`);

  return report;
}

buildMITTechTransferReport().catch(console.error);
```

### Expected Output

```
=== MIT Tech Transfer Assessment ===

[1/4] Fetching MIT institution report...
[2/4] Analyzing healthcare spinouts...
[3/4] Checking FDA device approvals...
[4/4] Searching recent healthcare papers...

=== REPORT SUMMARY ===
Institution: MIT
Total Spinouts: 156
Healthcare Spinouts: 23
FDA Approved Devices: 7
Recent Papers (2022+): 342

=== TOP MEDTECH SPINOUTS ===
1. Broad Institute (Healthcare, FDA Approved)
2. Alnylam Pharmaceuticals (Healthcare, FDA Approved)
3.Editas Medicine (Healthcare, FDA Approved)
```

## The MCPs We're Using

| MCP | Purpose | Cost | Endpoint |
|-----|---------|------|----------|
| `academic-research-mcp` | Scholar search, citations, author profiles | $0.01-0.10/call | `red-cars--academic-research-mcp.apify.actor` |
| `university-research-mcp` | Institution reports, spinouts, faculty | $0.05-0.15/call | `red-cars--university-research-mcp.apify.actor` |
| `healthcare-compliance-mcp` | FDA approvals, MAUDE, 510(k), ClinicalTrials | $0.03-0.15/call | `red-cars--healthcare-compliance-mcp.apify.actor` |

### Key Actions by MCP

**University Research MCP:**
- `institution_report` - Comprehensive institution overview
- `search_faculty` - Find researchers by specialty
- `spinout_landscape` - List university spinouts by industry

**Healthcare Compliance MCP:**
- `search_fda_approvals` - FDA device approvals
- `search_510k` - 510(k) premarket clearances
- `search_maude_events` - Adverse event reports
- `search_clinical_trials` - ClinicalTrials.gov

**Academic Research MCP:**
- `search_scholars` - Academic paper search
- `citation_network` - Build citation graphs
- `author_profile` - Author metrics and h-index

---

## Repository Overview

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
