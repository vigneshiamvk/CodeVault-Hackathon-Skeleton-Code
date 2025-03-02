// 1. Access catalyst.zoho.com

// 2. Create project in the console

// 3. Setup project in your local machine through the CLI

// 4. Install express and axios

// 5. Copy paste the skeleton code

// 6. Create table in Catalyst Cloudscale through the skeleton code template

// 7. Fill down the missing code

// 8. Add Github and OpenRouter tokens

// Catalyst sdk import:

const catalyst = require('zcatalyst-sdk-node');

// Catalyst init helper:

// Helper: Initialize Catalyst and return common resources
const getCatalystResources = (req) => {
  const catalystApp = catalyst.initialize(req);
  return {
    table: catalystApp.datastore().table('Issue'),
    zcql: catalystApp.zcql(),
  };
};

// GetIssues Code:

const { zcql } = getCatalystResources(req);

    const query = `
      SELECT
        ROWID,
        title,
        html_url,
        created_at,
        ai_suggestion,
        saved_at
      FROM Issue
    `;
    const queryResponse = await zcql.executeZCQLQuery(query);

    const issues = queryResponse.map((row) => {
      const record = row.Issue;
      return {
        id: record.ROWID,
        title: record.title,
        html_url: record.html_url,
        created_at: record.created_at,
        ai_suggestion: record.ai_suggestion,
        saved_at: record.saved_at,
      };
    });

// /saveIssue

const { table } = getCatalystResources(req);
    const { title, html_url, created_at, ai_suggestion, saved_at } = req.body;

    const rowData = {
      title,
      html_url,
      created_at,
      ai_suggestion,
      saved_at
    };

    const insertedRow = await table.insertRow(rowData);

// DELETE /removeissue/:id

const { table } = getCatalystResources(req);
const rowId = req.params.id;
await table.deleteRow(rowId);

// DELETE /clearissues

const { table, zcql } = getCatalystResources(req);

// Retrieve all ROWIDs from the Issue table
const query = `SELECT ROWID FROM Issue`;
const queryResponse = await zcql.executeZCQLQuery(query);

// Delete each row using its ROWID
const deletePromises = queryResponse.map((row) => table.deleteRow(row.Issue.ROWID));
await Promise.all(deletePromises);





