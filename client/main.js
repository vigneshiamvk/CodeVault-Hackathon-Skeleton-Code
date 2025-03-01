// UI helper functions
const ui = {
    elements: {
        repoUrl: document.getElementById('repoUrl'),
        analyzeBtn: document.getElementById('analyzeBtn'),
        error: document.getElementById('error'),
        errorText: document.getElementById('errorText'),
        loading: document.getElementById('loading'),
        repoInfo: document.getElementById('repoInfo'),
        issuesCard: document.getElementById('issuesCard'),
        issuesList: document.getElementById('issuesList'),
        savedIssuesList: document.getElementById('savedIssuesList'),
        noSavedIssues: document.getElementById('noSavedIssues'),
        savedCount: document.getElementById('savedCount'),
        clearSavedBtn: document.getElementById('clearSavedBtn')
    },

    showError(message) {
        this.elements.error.classList.remove('d-none');
        this.elements.errorText.textContent = message;
    },

    hideError() {
        this.elements.error.classList.add('d-none');
    },

    showLoading() {
        this.elements.loading.classList.remove('d-none');
        this.elements.repoInfo.classList.add('d-none');
        this.hideError();
    },

    hideLoading() {
        this.elements.loading.classList.add('d-none');
    },

    showRepoInfo() {
        this.elements.repoInfo.classList.remove('d-none');
    },

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    updateRepoInfo(data) {
        document.getElementById('ownerAvatar').src = data.owner.avatar_url;
        document.getElementById('repoName').textContent = data.name;
        document.getElementById('ownerName').textContent = `by ${data.owner.login}`;
        document.getElementById('repoDescription').textContent = data.description;
        document.getElementById('createdAt').textContent = `Created on ${this.formatDate(data.created_at)}`;
        document.getElementById('stars').textContent = `${data.stargazers_count.toLocaleString()} stars`;
        document.getElementById('forks').textContent = `${data.forks_count.toLocaleString()} forks`;
        document.getElementById('repoUrl').href = data.html_url;

        if (data.homepage) {
            document.getElementById('homepageContainer').classList.remove('d-none');
            const homepageLink = document.getElementById('homepage');
            homepageLink.href = data.homepage;
            homepageLink.textContent = data.homepage;
        }

        // Update languages
        const languagesContainer = document.getElementById('languages');
        languagesContainer.innerHTML = Object.keys(data.languages || {}).map(lang =>
            `<span class="badge-language">${lang}</span>`
        ).join('');

        // Update topics
        if (data.topics && data.topics.length > 0) {
            document.getElementById('topicsContainer').classList.remove('d-none');
            document.getElementById('topics').innerHTML = data.topics.map(topic =>
                `<span class="badge-topic">${topic}</span>`
            ).join('');
        }
    },

    updateIssues(issues, repoName) {
        if (issues.length === 0) return;

        this.elements.issuesCard.classList.remove('d-none');
        this.elements.issuesList.innerHTML = '';

        for (const issue of issues) {
            const issueElement = document.createElement('div');
            issueElement.className = 'issue-card';
            issueElement.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <div class="d-flex gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc3545" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M8 11h.01"/>
                            <path d="M12 11h.01"/>
                            <path d="M16 11h.01"/>
                            <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                            <path d="M12 17v.01"/>
                        </svg>
                        <div>
                            <a href="${issue.html_url}" target="_blank" class="text-decoration-none">
                                <h4 class="h6 mb-1">${issue.title}</h4>
                            </a>
                            <div class="d-flex gap-2">
                                ${issue.labels.map(label => `
                                    <span class="badge" style="background-color: #${label.color}20; color: #${label.color}">
                                        ${label.name}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    <small class="text-muted">${this.formatDate(issue.created_at)}</small>
                </div>
                <div class="issue-analysis">
                    <div class="d-flex gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0d6efd" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <path d="M10 12h4"/>
                            <path d="M9 16h6"/>
                        </svg>
                        <div>
                            <h5 class="h6 mb-2">AI Analysis & Debug Suggestion:</h5>
                            <div class="suggestion-content">
                                ${issue.ai_suggestion || "No AI analysis available"}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mt-3 text-end">
                    <button class="btn btn-sm btn-outline-success save-issue-btn" data-issue-id="${issue.number}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-1">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                            <polyline points="17 21 17 13 7 13 7 21"/>
                            <polyline points="7 3 7 8 15 8"/>
                        </svg>
                        Save Issue
                    </button>
                </div>
            `;
            this.elements.issuesList.appendChild(issueElement);

            // Add event listener to save button
            const saveBtn = issueElement.querySelector('.save-issue-btn');
            saveBtn.addEventListener('click', () => {
                saveIssue({
                    number: issue.number,
                    title: issue.title,
                    html_url: issue.html_url,
                    created_at: issue.created_at,
                    ai_suggestion: issue.ai_suggestion,
                    repo_name: repoName
                });
                saveBtn.disabled = true;
                saveBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-1">
                        <path d="M20 6 9 17l-5-5"/>
                    </svg>
                    Saved
                `;
            });
        }
    },

    updateSavedIssues(savedIssues) {
        this.elements.savedCount.textContent = savedIssues.length || 0;
        
        if (savedIssues.length === 0) {
            this.elements.noSavedIssues.classList.remove('d-none');
            this.elements.savedIssuesList.classList.add('d-none');
            return;
        }

        this.elements.noSavedIssues.classList.add('d-none');
        this.elements.savedIssuesList.classList.remove('d-none');
        this.elements.savedIssuesList.innerHTML = '';

        for (const issue of savedIssues) {
            const issueElement = document.createElement('div');
            issueElement.className = 'issue-card';
            issueElement.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <div class="d-flex gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc3545" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M8 11h.01"/>
                            <path d="M12 11h.01"/>
                            <path d="M16 11h.01"/>
                            <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                            <path d="M12 17v.01"/>
                        </svg>
                        <div>
                            <div class="d-flex align-items-center gap-2 mb-1">
                                <a href="${issue.html_url}" target="_blank" class="text-decoration-none">
                                    <h4 class="h6 mb-0">${issue.title}</h4>
                                </a>
                                <span class="badge bg-secondary">${issue.repo_name}</span>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex flex-column align-items-end">
                        <small class="text-muted mb-2">${this.formatDate(issue.created_at)}</small>
                        <button class="btn btn-sm btn-outline-danger remove-issue-btn" data-issue-number="${issue.number}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M3 6h18"/>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                                <line x1="10" y1="11" x2="10" y2="17"/>
                                <line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="issue-analysis">
                    <div class="d-flex gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0d6efd" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <path d="M10 12h4"/>
                            <path d="M9 16h6"/>
                        </svg>
                        <div>
                            <h5 class="h6 mb-2">AI Analysis & Debug Suggestion:</h5>
                            <div class="suggestion-content">
                                ${issue.ai_suggestion || "No AI analysis available"}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            this.elements.savedIssuesList.appendChild(issueElement);

            // Add event listener to remove button
            const removeBtn = issueElement.querySelector('.remove-issue-btn');
            removeBtn.addEventListener('click', () => {
                removeIssue(issue.id);
            });
        }
    }
};

// Saved issues functionality
async function fetchSavedIssues() {
    try {
        const response = await fetch('/server/ai_summary_function/getissues');
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching saved issues:', error);
        return [];
    }
}

async function saveIssue(issue) {
    try {
        // Create simplified issue object without labels
        const simplifiedIssue = {
            number: issue.number,
            title: issue.title,
            html_url: issue.html_url,
            created_at: issue.created_at,
            ai_suggestion: issue.ai_suggestion,
            repo_name: issue.repo_name,
            saved_at: new Date().toISOString()
        };
        
        const response = await fetch('/server/ai_summary_function/saveissue', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(simplifiedIssue)
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        // Refresh the saved issues list
        loadSavedIssues();
    } catch (error) {
        console.error('Error saving issue:', error);
        ui.showError('Failed to save issue. Please try again.');
    }
}

async function removeIssue(issueNumber) {
    try {
        const response = await fetch(`/server/ai_summary_function/removeissue/${issueNumber}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        // Refresh the saved issues list
        loadSavedIssues();
    } catch (error) {
        console.error('Error removing issue:', error);
        ui.showError('Failed to remove issue. Please try again.');
    }
}

async function clearAllSavedIssues() {
    try {
        const response = await fetch('/server/ai_summary_function/clearissues', {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        // Refresh the saved issues list
        loadSavedIssues();
    } catch (error) {
        console.error('Error clearing issues:', error);
        ui.showError('Failed to clear issues. Please try again.');
    }
}

async function loadSavedIssues() {
    try {
        const savedIssues = await fetchSavedIssues();
        ui.updateSavedIssues(savedIssues);
    } catch (error) {
        console.error('Error loading saved issues:', error);
        ui.showError('Failed to load saved issues. Please try again.');
    }
}

// Main functionality
async function analyzeRepo() {
    const url = ui.elements.repoUrl.value;
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);

    if (!match) {
        ui.showError('Invalid GitHub URL');
        return;
    }

    ui.showLoading();

    try {
        const response = await fetch('/server/ai_summary_function/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        ui.hideLoading();
        ui.showRepoInfo();
        ui.updateRepoInfo(data.repoData);
        ui.updateIssues(data.issues, data.name);
    } catch (error) {
        ui.hideLoading();
        if (error.message.includes('404')) {
            ui.showError('Repository not found. Please check the URL.');
        } else {
            ui.showError('Error analyzing repository. Please try again later.');
            console.error('Error details:', error);
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load saved issues from server
    loadSavedIssues();

    // Event listeners
    ui.elements.analyzeBtn.addEventListener('click', analyzeRepo);
    ui.elements.repoUrl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            ui.elements.analyzeBtn.click();
        }
    });

    ui.elements.clearSavedBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all saved issues?')) {
            clearAllSavedIssues();
        }
    });
});
