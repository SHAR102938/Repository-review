import React, { useState } from 'react';
import './App.css';

function App() {
    const [repoUrl, setRepoUrl] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setAnalysis(null);

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ repoUrl }),
            });

            if (!response.ok) {
                throw new Error('Failed to analyze the repository');
            }

            const data = await response.json();
            setAnalysis(data);
        } catch (err) {
            console.error('Fetch Error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatScoreKey = (key) => {
        return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>RepoReview</h1>
                <p>Get an instant analysis of your GitHub repository</p>
            </header>
            <main>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        placeholder="Enter GitHub repository URL"
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Analyzing...' : 'Analyze'}
                    </button>
                </form>

                {error && <p className="error">{error}</p>}

                {analysis && (
                    <div className="analysis-results">
                        <h2>Analysis Results</h2>
                        <div className="score-container">
                            <div className="overall-score">
                                <p>Overall Score</p>
                                <span>{analysis.overallScore}/100</span>
                            </div>
                            <div className="skill-level">
                                <p>Skill Level</p>
                                <span>{analysis.skillLevel}</span>
                            </div>
                            <div className="badge">
                                <p>Badge</p>
                                <span>{analysis.badge}</span>
                            </div>
                        </div>

                        <div className="summary">
                            <h3>Summary</h3>
                            <p>{analysis.summary}</p>
                        </div>

                        <div className="scores-breakdown">
                            <h3>Scores Breakdown</h3>
                            <ul>
                                {Object.entries(analysis.scores).map(([key, value]) => (
                                    <li key={key}>
                                        <span>{formatScoreKey(key)}</span>
                                        <span>{value.score}/{value.maxScore}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="roadmap">
                            <h3>Improvement Roadmap</h3>
                            <ul>
                                {analysis.roadmap.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;