# Database Schema: Juno-Email-Agent-Test

This document describes the collections in the MongoDB database and their purpose.

## Collections

### 1. clients
Stores information about each client, including company details, contact info, configuration, and rules.

### 2. ai-core-agent-plans-config
Configuration for AI agent plans. Likely stores plan details, limits, or features for AI agents.

### 3. ai-core-tools-config
Configuration for AI tools. Stores tool settings, enabled/disabled status, and tool-specific options.

### 4. communicationRecords
Stores records of communications (emails, messages, etc.) between clients, applicants, and the system.

### 5. customerDatapointsHistory
Tracks the history of data points collected from customers/applicants over time.

### 6. junoDatapoints
Stores the definitions and metadata for data points used in the system (e.g., fields required for applications).

### 7. leads
Stores information about leads generated or imported into the system.

### 8. questionStatus
Tracks the status of questions asked to applicants or clients (e.g., answered, pending, etc.).

---

## Example: `clients` Collection Document
```json
{
  "pocName": "James",
  "pocContact": "+44-23423432",
  "type": "BROKER",
  "website": "www.positivecommercial.com",
  "companyName": "Positive Commercial Finance",
  "companyNumber": 233432843,
  "address": "Street 4, Buckingham Palace, London, UK",
  "country": "United Kingdom",
  "isActive": true,
  ...
}
```

---

> **Note:**
> - Each collection may have additional fields and relationships not shown here.
> - For detailed schema of each collection, refer to the corresponding Mongoose model or database schema definition in the codebase. 