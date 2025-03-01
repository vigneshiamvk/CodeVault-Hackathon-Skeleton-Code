const express = require('express');
const axios = require('axios');
///// Insert catalyst sdk
const app = express();
app.use(express.json());

// Create an axios instance with GitHub authentication
const githubApi = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Authorization: `token your-github-key`,
    Accept: 'application/vnd.github.v3+json',
  },
});

const OPENROUTER_API_KEY = 'your-openrouter-key'; // Replace


// Helper: Extract owner and repo from GitHub URL
const extractRepoInfo = (url) => {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  return match ? { owner: match[1], repo: match[2] } : null;
};

// Helper: Generate AI debug suggestion for a given issue using OpenRouter's free models
const generateDebugSuggestion = async (issue, repoData, languages) => {
  // Determine the primary language by sorting language usage
  const primaryLanguage =
    Object.entries(languages).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    repoData.language;

  // Construct the prompt for the model
  const prompt = `As a senior developer, analyze this GitHub issue and provide specific debugging suggestions:

Issue Title: ${issue.title}
Issue Description: ${issue.body ? issue.body.slice(0, 500) : 'No description provided'}
Repository: ${repoData.name}
Primary Language: ${primaryLanguage}
Tech Stack: ${Object.keys(languages).join(', ')}
Labels: ${issue.labels.map((l) => l.name).join(', ')}

Please provide a detailed technical analysis including:
1. Root cause analysis
2. Specific files or components likely involved
3. Step-by-step debugging approach
4. Potential solutions
5. Testing recommendations

Keep the response concise (within 250 words) but technically detailed. This response will be rendered inside a HTML div, so please give your response as formatted html that can be rendered inside the said div`;

  // OpenRouter endpoint (adjust the URL and model if needed)
  const openrouterEndpoint = 'https://openrouter.ai/api/v1/chat/completions';

  // Build the payload in the same format as OpenAI's Chat API
  const data = {
    model: 'meta-llama/llama-3.3-70b-instruct:free', // Change to the appropriate free model offered by OpenRouter
    messages: [{ role: 'user', content: prompt }],
  };

  // Build headers; include the API key if required by OpenRouter
  const headers = {
    'Content-Type': 'application/json',
    Authorization: OPENROUTER_API_KEY ? `Bearer ${OPENROUTER_API_KEY}` : '',
  };

  try {
    const response = await axios.post(openrouterEndpoint, data, { headers });
    return response.data.choices[0]?.message?.content || 'Unable to generate suggestion';
  } catch (error) {
    console.error('Error calling OpenRouter:', error);
    return 'Error generating suggestion.';
  }
};

//Initialize Catalyst and return common resources
/////////////
////////////
////////////

// POST /analyze - Analyze GitHub issues and generate AI suggestions
app.post('/analyze', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required in the request body' });
  }

  const repoInfo = extractRepoInfo(url);
  if (!repoInfo) {
    return res.status(400).json({ error: 'Invalid GitHub URL' });
  }

  try {
    // Fetch repository data and issues concurrently
    const [repoResponse, issuesResponse] = await Promise.all([
      githubApi.get(`/repos/${repoInfo.owner}/${repoInfo.repo}`),
      githubApi.get(`/repos/${repoInfo.owner}/${repoInfo.repo}/issues?state=all&per_page=2`),
    ]);

    // Get language statistics
    const languagesResponse = await githubApi.get(repoResponse.data.languages_url);

    const repoData = repoResponse.data;
    const issues = issuesResponse.data;
    const languages = languagesResponse.data;

    // Generate AI debug suggestions for each issue
    for (const issue of issues) {
      try {
        issue.ai_suggestion = await generateDebugSuggestion(issue, repoData, languages);
      } catch (aiError) {
        console.error(`Error generating suggestion for issue #${issue.number}:`, aiError);
        issue.ai_suggestion = 'Error generating AI suggestion. Please try again later.';
      }
    }

    res.json({ repoData, languages, issues });
  } catch (err) {
    console.error('Error fetching repository data:', err);
    const status = err.response?.status;
    if (status === 403) {
      return res.status(403).json({ error: 'GitHub API rate limit exceeded. Please check your token.' });
    } else if (status === 404) {
      return res.status(404).json({ error: 'Repository not found. Please check the URL.' });
    }
    res.status(500).json({ error: 'Error fetching repository data' });
  }
});

// GET /getissues - Retrieve issues from the Catalyst Data Store
app.get('/getissues', async (req, res) => {
  try {
    // Initialize ZCQL, fetch data from Issue Table
    /////////////
    ////////////
    res.status(200).json(issues);
  } catch (error) {
    console.error('Error fetching issues from Catalyst:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /saveIssue - Save a new issue to the Catalyst Data Store
app.post('/saveIssue', async (req, res) => {
  try {
    // Initialize datastore, fetch data from Issue Table
    /////////
    /////////
    ////////
    res.status(201).json({ success: true, data: insertedRow });
  } catch (error) {
    console.error('Error saving issue to Catalyst:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /removeissue/:id - Remove a single issue by its ROWID
app.delete('/removeissue/:id', async (req, res) => {
  try {
    // Initialize datastore, remove data from Issue Table
    //////////
    /////////
    ////////
    res.status(200).json({ success: true, message: `Issue with ROWID ${rowId} removed successfully.` });
  } catch (error) {
    console.error('Error removing issue from Catalyst:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

});

// DELETE /clearissues - Clear all issues from the Catalyst Data Store
app.delete('/clearissues', async (req, res) => {
  try {
    // Initialize data store, remove all data from the table
    //////////////
    //////////////
    /////////////
    res.status(200).json({ success: true, message: 'All issues cleared successfully.' });
  } catch (error) {
    console.error('Error clearing issues from Catalyst:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

});

module.exports = app;
