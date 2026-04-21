# Add Academic Research to Your AI Agent in 5 Minutes

A practical guide for AI agent developers (LangChain, AutoGen, CrewAI) to add real-time academic research, FDA approvals, and university tech transfer data to their agents in minutes. No API keys required beyond your Apify token.

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

## The MCPs We're Using

| MCP | Purpose | Cost | Endpoint |
|-----|---------|------|----------|
| `academic-research-mcp` | Scholar search, citations, author profiles | $0.01-0.10/call | `red-cars--academic-research-mcp.apify.actor` |
| `university-research-mcp` | Institution reports, spinouts, faculty | $0.05-0.15/call | `red-cars--university-research-mcp.apify.actor` |
| `healthcare-compliance-mcp` | FDA approvals, MAUDE, 510(k), ClinicalTrials | $0.03-0.15/call | `red-cars--healthcare-compliance-mcp.apify.actor` |

## Step 1: Add the MCP Servers

### MCP Server Configuration

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

### Expected Output

```json
{
  "data": {
    "total": 47,
    "papers": [
      {
        "title": "Transformers for Time Series Forecasting",
        "authors": ["A. Vaswani", "S. Bengio"],
        "year": 2023,
        "citations": 234,
        "abstract": "We present a novel transformer architecture..."
      }
    ]
  }
}
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
3. Editas Medicine (Healthcare, FDA Approved)
```

## MCP Reference

### University Research MCP

**Endpoint:** `red-cars--university-research-mcp.apify.actor`

| Action | Description | Key Parameters |
|--------|-------------|----------------|
| `institution_report` | Comprehensive institution overview | `university`, `include` (faculty/spinouts/patents) |
| `search_faculty` | Find researchers by specialty | `university`, `department`, `researchArea` |
| `spinout_landscape` | List university spinouts by industry | `university`, `industry`, `yearFrom` |

### Healthcare Compliance MCP

**Endpoint:** `red-cars--healthcare-compliance-mcp.apify.actor`

| Action | Description | Key Parameters |
|--------|-------------|----------------|
| `search_fda_approvals` | FDA device approvals | `searchTerm`, `deviceState`, `dateFrom` |
| `search_510k` | 510(k) premarket clearances | `searchTerm`, `productCode`, `dateFrom` |
| `search_maude_events` | Adverse event reports | `manufacturer`, `deviceName`, `dateFrom` |
| `search_clinical_trials` | ClinicalTrials.gov | `condition`, `intervention`, `phase` |

### Academic Research MCP

**Endpoint:** `red-cars--academic-research-mcp.apify.actor`

| Action | Description | Key Parameters |
|--------|-------------|----------------|
| `search_scholars` | Academic paper search | `query`, `yearFrom`, `yearTo`, `limit` |
| `citation_network` | Build citation graphs | `paperId`, `depth` |
| `author_profile` | Author metrics and h-index | `authorName`, `institution` |

## Cost Summary

| MCP | Typical Query | Est. Cost |
|-----|---------------|-----------|
| academic-research-mcp | Paper search (10 results) | ~$0.01 |
| university-research-mcp | Institution report | ~$0.05 |
| healthcare-compliance-mcp | FDA approval search | ~$0.03 |

Full tech transfer assessment (4 MCP calls): ~$0.15 per report

## Next Steps

1. Clone the [research-agent-starter](https://github.com/red-cars-io/research-agent-starter) repo
2. Copy `.env.example` to `.env` and add your `APIFY_API_TOKEN`
3. Run `npm install`
4. Try the examples: `npm run example:tech-scouting`

## Related Repositories

- [Healthcare Compliance MCP](https://github.com/red-cars-io/healthcare-compliance-mcp) - FDA/MAUDE/510(k)/ClinicalTrials tools
- [University Research MCP](https://github.com/red-cars-io/university-research-mcp) - Institution/spinout/patent tools
- [Patent Search MCP](https://github.com/red-cars-io/patent-search-mcp) - Patent database tools
