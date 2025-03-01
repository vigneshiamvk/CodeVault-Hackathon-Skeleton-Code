const express = require('express');
const axios = require('axios');
const OpenAI = require('openai');
const catalyst = require('zcatalyst-sdk-node');

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

