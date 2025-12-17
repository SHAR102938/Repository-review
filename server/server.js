const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const GITHUB_API_BASE = 'https://api.github.com';

// Helper function to extract owner and repo from GitHub URL
function parseGitHubUrl(url) {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
        return {
            owner: match[1],
            repo: match[2].replace(/\.git$/, '')
        };
    }
    return null;
}

// Helper function to calculate repository score
function calculateRepoScore(repoData, languages, commits, issues, pullRequests) {
    let score = 0;
    let maxScore = 100;
    
    const scores = {
        documentation: { score: 0, maxScore: 20 },
        codeQuality: { score: 0, maxScore: 20 },
        community: { score: 0, maxScore: 20 },
        maintenance: { score: 0, maxScore: 20 },
        popularity: { score: 0, maxScore: 20 }
    };

    // Documentation Score
    if (repoData.description && repoData.description.length > 50) {
        scores.documentation.score += 10;
    }
    if (repoData.has_readme) {
        scores.documentation.score += 5;
    }
    if (repoData.has_wiki) {
        scores.documentation.score += 5;
    }

    // Code Quality Score
    const totalLanguages = Object.keys(languages).length;
    if (totalLanguages > 1) {
        scores.codeQuality.score += 5;
    }
    if (repoData.size < 10000) {
        scores.codeQuality.score += 5;
    }
    if (repoData.size > 1000) {
        scores.codeQuality.score += 5;
    }
    if (languages.JavaScript || languages.TypeScript) {
        scores.codeQuality.score += 5;
    }

    // Community Score
    if (repoData.has_issues) {
        scores.community.score += 5;
    }
    if (repoData.subscribers_count > 10) {
        scores.community.score += 5;
    }
    if (issues.length > 0) {
        scores.community.score += 5;
    }
    if (pullRequests.length > 0) {
        scores.community.score += 5;
    }

    // Maintenance Score
    const lastUpdated = new Date(repoData.updated_at);
    const daysSinceUpdate = (new Date() - lastUpdated) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 30) {
        scores.maintenance.score += 10;
    } else if (daysSinceUpdate < 90) {
        scores.maintenance.score += 5;
    }
    if (commits.length > 10) {
        scores.maintenance.score += 10;
    }

    // Popularity Score
    if (repoData.stargazers_count > 50) {
        scores.popularity.score += 10;
    }
    if (repoData.forks_count > 10) {
        scores.popularity.score += 5;
    }
    if (repoData.watchers_count > 20) {
        scores.popularity.score += 5;
    }

    // Calculate overall score
    Object.values(scores).forEach(category => {
        score += category.score;
    });

    return { score, scores, maxScore };
}

app.post('/api/analyze', async (req, res) => {
    const { repoUrl } = req.body;
    console.log(`Received request to analyze: ${repoUrl}`);
    if (!repoUrl) {
        return res.status(400).json({ error: 'Repository URL is required' });
    }

    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
        return res.status(400).json({ error: 'Invalid GitHub URL format' });
    }

    const { owner, repo } = parsed;

    try {
        // Fetch repository data
        const repoResponse = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}`);
        const repoData = repoResponse.data;

        // Fetch additional data
        const [languagesResponse, commitsResponse, issuesResponse, pullRequestsResponse] = await Promise.all([
            axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/languages`),
            axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?per_page=100`),
            axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/issues?state=open&per_page=100`),
            axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls?state=open&per_page=100`)
        ]);

        const languages = languagesResponse.data;
        const commits = commitsResponse.data;
        const issues = issuesResponse.data;
        const pullRequests = pullRequestsResponse.data;

        // Calculate scores
        const { score, scores } = calculateRepoScore(repoData, languages, commits, issues, pullRequests);

        // Determine skill level and badge
        let skillLevel = 'Beginner';
        let badge = '🌱';
        
        if (score >= 80) {
            skillLevel = 'Expert';
            badge = '🏆';
        } else if (score >= 60) {
            skillLevel = 'Advanced';
            badge = '🥈';
        } else if (score >= 40) {
            skillLevel = 'Intermediate';
            badge = '🥉';
        }

        // Generate summary
        const daysSinceUpdate = (new Date() - new Date(repoData.updated_at)) / (1000 * 60 * 60 * 24);
        const summary = `This repository has an overall score of ${score}/100. It demonstrates ${skillLevel.toLowerCase()} level development practices with ${repoData.stargazers_count} stars and ${repoData.forks_count} forks. The repository shows ${Object.keys(languages).length} different programming languages and ${commits.length} commits, indicating ${daysSinceUpdate < 30 ? 'active' : 'moderate'} maintenance.`;

        // Generate improvement roadmap
        const roadmap = [];
        
        if (scores.documentation.score < 15) {
            roadmap.push('Add comprehensive README with setup instructions and examples');
            roadmap.push('Enable GitHub Wiki for additional documentation');
        }
        
        if (scores.codeQuality.score < 15) {
            roadmap.push('Add code linting and formatting tools');
            roadmap.push('Implement automated testing');
        }
        
        if (scores.community.score < 15) {
            roadmap.push('Create issue templates for bug reports and feature requests');
            roadmap.push('Add contributing guidelines');
            roadmap.push('Set up code review process');
        }
        
        if (scores.maintenance.score < 15) {
            roadmap.push('Set up automated dependency updates');
            roadmap.push('Create release notes for new versions');
            roadmap.push('Implement CI/CD pipeline');
        }
        
        if (scores.popularity.score < 15) {
            roadmap.push('Promote repository on social media and developer forums');
            roadmap.push('Add repository to relevant awesome lists');
            roadmap.push('Create demo or live examples');
        }

        const response = {
            overallScore: score,
            skillLevel,
            badge,
            summary,
            scores: {
                'Code Quality': { score: scores.codeQuality.score, maxScore: scores.codeQuality.maxScore },
                'Project Structure': { score: scores.documentation.score, maxScore: scores.documentation.maxScore },
                'Documentation': { score: scores.documentation.score, maxScore: scores.documentation.maxScore },
                'Testing': { score: scores.maintenance.score, maxScore: scores.maintenance.maxScore },
                'Git Practices': { score: scores.maintenance.score, maxScore: scores.maintenance.maxScore },
                'Real-World Relevance': { score: scores.popularity.score, maxScore: scores.popularity.maxScore },
                'Security': { score: scores.codeQuality.score, maxScore: scores.codeQuality.maxScore },
                'Code Complexity': { score: scores.codeQuality.score, maxScore: scores.codeQuality.maxScore }
            },
            roadmap: roadmap.length > 0 ? roadmap : ['Repository is well-maintained! Keep up the good work!']
        };

        res.json(response);
    } catch (error) {
        console.error('Error analyzing repository:', error);
        
        if (error.response) {
            console.error('GitHub API response:', error.response.data);
            if (error.response.status === 404) {
                return res.status(404).json({ error: 'Repository not found or is private' });
            }
            if (error.response.status === 403) {
                return res.status(403).json({ error: 'GitHub API rate limit exceeded. Please try again later.' });
            }
        }
        
        res.status(500).json({ error: 'Failed to analyze the repository. Please check the URL and try again.' });
    }
});



app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port: ${port}`);
});