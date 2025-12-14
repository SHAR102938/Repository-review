const express = require('express');
const cors = require('cors');
const simpleGit = require('simple-git');
const axios = require('axios');
const { execFile } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const escomplex = require('escomplex');
const { exec } = require('child_process');
const { ESLint } = require('eslint');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const git = simpleGit();

const tmp = require('tmp');

app.post('/api/analyze', async (req, res) => {
    const { repoUrl } = req.body;
    if (!repoUrl) {
        return res.status(400).json({ error: 'Repository URL is required' });
    }

    const tmpDir = tmp.dirSync({ unsafeCleanup: true });
    const repoPath = tmpDir.name;

    try {
        await new Promise((resolve, reject) => {
            execFile('git', ['clone', repoUrl, repoPath], (error) => {
                if (error) {
                    return reject(error);
                }
                resolve();
            });
        });

        const analysis = await analyzeRepository(repoPath);

        res.json(analysis);
    } catch (error) {
        console.error('Error analyzing repository:', error);
        res.status(500).json({ error: 'Failed to analyze repository', details: error.message });
    } finally {
        tmpDir.removeCallback();
    }
});

async function analyzeRepository(repoPath) {
    const structure = await analyzeStructure(repoPath);
    const codeQuality = await analyzeCodeQuality(repoPath);
    const documentation = await analyzeDocumentation(repoPath);
    const versionControl = await analyzeVersionControl(repoPath);
    const testing = await analyzeTesting(repoPath);
    const techStack = await analyzeTechStack(repoPath);
    const realWorld = await analyzeRealWorldApplicability(repoPath);
    const security = await analyzeSecurity(repoPath);
    const complexity = await analyzeCodeComplexity(repoPath);

    const overallScore = calculateOverallScore({
        structure, codeQuality, documentation, versionControl, testing, techStack, realWorld, security, complexity
    });

    return {
        overallScore,
        skillLevel: getSkillLevel(overallScore),
        badge: getBadge(overallScore),
        summary: getSummary(structure, codeQuality, documentation, testing, versionControl, techStack, realWorld),
        roadmap: getRoadmap(structure, codeQuality, documentation, versionControl, testing, techStack, realWorld),
        scores: {
            'Code Quality': { score: codeQuality.score, maxScore: codeQuality.maxScore },
            'Project Structure': { score: structure.score, maxScore: structure.maxScore },
            'Documentation': { score: documentation.score, maxScore: documentation.maxScore },
            'Testing': { score: testing.score, maxScore: testing.maxScore },
            'Git Practices': { score: versionControl.score, maxScore: versionControl.maxScore },
            'Real-World Relevance': { score: realWorld.score, maxScore: realWorld.maxScore },
            'Security': { score: security.score, maxScore: security.maxScore },
            'Code Complexity': { score: complexity.score, maxScore: complexity.maxScore },
        }
    };
}

// Placeholder for analysis functions
async function analyzeStructure(repoPath) {
    const structure = {
        score: 0,
        maxScore: 40,
        issues: []
    };

    const rootFiles = await fs.readdir(repoPath);

    if (rootFiles.includes('src') || rootFiles.includes('source')) {
        structure.score += 20;
    } else {
        structure.issues.push('No src or source directory found.');
    }

    if (rootFiles.includes('package.json')) {
        structure.score += 10;
    } else {
        structure.issues.push('No package.json found in the root directory.');
    }

    if (rootFiles.includes('README.md')) {
        structure.score += 10;
    } else {
        structure.issues.push('No README.md found.');
    }

    return structure;
}
async function analyzeCodeQuality(repoPath) {
    const quality = {
        score: 0,
        maxScore: 40,
        issues: []
    };

    const files = await getJavaScriptFiles(repoPath);
    if (files.length === 0) {
        quality.issues.push('No JavaScript files found to analyze.');
        return quality;
    }

    const eslint = new ESLint({
        useEslintrc: false,
        overrideConfig: {
            env: {
                browser: true,
                commonjs: true,
                es2021: true,
                node: true
            },
            extends: "eslint:recommended",
            parserOptions: {
                ecmaVersion: 12
            },
            rules: {
            }
        }
    });
    const results = await eslint.lintFiles(files);

    const errorCount = results.reduce((count, result) => count + result.errorCount, 0);
    const warningCount = results.reduce((count, result) => count + result.warningCount, 0);

    let score = 40;
    score -= errorCount * 2; // Deduct 2 points for each error
    score -= warningCount * 1; // Deduct 1 point for each warning

    quality.score = Math.max(0, score);

    if (errorCount > 0) {
        quality.issues.push(`Found ${errorCount} ESLint errors.`);
    }
    if (warningCount > 0) {
        quality.issues.push(`Found ${warningCount} ESLint warnings.`);
    }

    return quality;
}

async function analyzeDocumentation(repoPath) {
    const documentation = {
        score: 0,
        maxScore: 40,
        issues: []
    };

    const readmePath = path.join(repoPath, 'README.md');

    try {
        const readmeContent = await fs.readFile(readmePath, 'utf-8');
        const readmeLength = readmeContent.length;

        if (readmeLength > 1000) {
            documentation.score += 20;
        } else if (readmeLength > 300) {
            documentation.score += 10;
        }

        if (readmeContent.toLowerCase().includes('installation')) {
            documentation.score += 5;
        }

        if (readmeContent.toLowerCase().includes('usage')) {
            documentation.score += 5;
        }

        if (readmeContent.toLowerCase().includes('contributing')) {
            documentation.score += 10;
        }

    } catch (error) {
        documentation.issues.push('README.md not found or could not be read.');
    }

    return documentation;
}
async function analyzeVersionControl(repoPath) {
    const versionControl = {
        score: 0,
        maxScore: 40,
        issues: []
    };

    try {
        const log = await simpleGit(repoPath).log();
        const commitCount = log.total;

        if (commitCount > 50) {
            versionControl.score += 30;
        } else if (commitCount > 10) {
            versionControl.score += 15;
        }

        const averageMessageLength = log.all.reduce((acc, commit) => acc + commit.message.length, 0) / commitCount;

        if (averageMessageLength > 15) {
            versionControl.score += 10;
        }

    } catch (error) {
        versionControl.issues.push('Could not analyze Git history.');
    }

    return versionControl;
}
async function analyzeTesting(repoPath) {
    const testing = {
        score: 0,
        maxScore: 35,
        issues: []
    };

    const sourceFiles = await getJavaScriptFiles(repoPath);
    const testFiles = sourceFiles.filter(file => 
        file.includes('.test.js') || file.includes('.spec.js')
    );

    if (testFiles.length > 0) {
        const testRatio = testFiles.length / sourceFiles.length;
        if (testRatio > 0.5) {
            testing.score += 35;
        } else if (testRatio > 0.2) {
            testing.score += 20;
        } else {
            testing.score += 10;
        }
    } else {
        testing.issues.push('No test files found.');
    }

    return testing;
}

async function analyzeTechStack(repoPath) {
    const techStack = {
        score: 0,
        maxScore: 40,
        issues: []
    };

    const packageJsonPath = path.join(repoPath, 'package.json');

    try {
        const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
        const packageJson = JSON.parse(packageJsonContent);

        const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

        if (dependencies.react) {
            techStack.score += 20;
        }
        if (dependencies.express) {
            techStack.score += 10;
        }
        if (dependencies.webpack) {
            techStack.score += 10;
        }

    } catch (error) {
        techStack.issues.push('Could not analyze package.json.');
    }

    return techStack;
}
async function analyzeRealWorldApplicability(repoPath) {
    // This is a placeholder for a more complex analysis.
    // For now, we'll give a base score.
    return { score: 20, maxScore: 20, issues: [] };
}

async function getJavaScriptFiles(dir) {
    let files = [];
    const items = await fs.readdir(dir, { withFileTypes: true });

    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory() && item.name !== 'node_modules') {
            files = files.concat(await getJavaScriptFiles(fullPath));
        } else if (item.isFile() && path.extname(item.name) === '.js') {
            files.push(fullPath);
        }
    }

    return files;
}

async function analyzeSecurity(repoPath) {
    return new Promise((resolve) => {
        exec('npm audit --json', { cwd: repoPath }, (error, stdout, stderr) => {
            const security = {
                score: 40,
                maxScore: 40,
                issues: []
            };

            if (stdout) {
                try {
                    const audit = JSON.parse(stdout);
                    const vulnerabilities = audit.metadata.vulnerabilities;
                    const critical = vulnerabilities.critical || 0;
                    const high = vulnerabilities.high || 0;
                    const moderate = vulnerabilities.moderate || 0;

                    let scoreReduction = critical * 10 + high * 5 + moderate * 2;
                    security.score = Math.max(0, 40 - scoreReduction);

                    if (critical > 0) security.issues.push(`Found ${critical} critical vulnerabilities.`);
                    if (high > 0) security.issues.push(`Found ${high} high vulnerabilities.`);
                    if (moderate > 0) security.issues.push(`Found ${moderate} moderate vulnerabilities.`);
                } catch (e) {
                    security.issues.push('Failed to parse npm audit report.');
                }
            }
            resolve(security);
        });
    });
}

async function analyzeCodeComplexity(repoPath) {
    const complexity = {
        score: 0,
        maxScore: 40,
        issues: []
    };
    let totalComplexity = 0;
    let fileCount = 0;

    async function analyzeFile(filePath) {
        try {
            const code = await fs.readFile(filePath, 'utf-8');
            if (path.extname(filePath) === '.js') {
                const report = escomplex.analyse(code);
                totalComplexity += report.aggregate.cyclomatic;
                fileCount++;
            }
        } catch (error) {
            // Ignore files that can't be read
        }
    }

    async function traverse(dir) {
        const files = await fs.readdir(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = await fs.stat(filePath);
            if (stat.isDirectory() && file !== 'node_modules') {
                await traverse(filePath);
            } else if (stat.isFile()) {
                await analyzeFile(filePath);
            }
        }
    }

    await traverse(repoPath);

    if (fileCount > 0) {
        const avgComplexity = totalComplexity / fileCount;
        if (avgComplexity < 5) {
            complexity.score = 40;
        } else if (avgComplexity < 10) {
            complexity.score = 30;
        } else if (avgComplexity < 20) {
            complexity.score = 15;
        } else {
            complexity.score = 5;
        }
    }

    return complexity;
}


function calculateOverallScore(scores) {
    const totalScore = Object.values(scores).reduce((acc, category) => acc + category.score, 0);
    const totalMaxScore = Object.values(scores).reduce((acc, category) => acc + category.maxScore, 0);
    return Math.min(100, Math.round((totalScore / totalMaxScore) * 100));
}
function getSkillLevel(score) {
    if (score > 90) return 'Expert';
    if (score > 75) return 'Advanced';
    if (score > 50) return 'Intermediate';
    if (score > 25) return 'Beginner';
    return 'Novice';
}
function getBadge(score) {
    if (score > 85) return '🥇 Gold';
    if (score > 60) return '🥈 Silver';
    return '🥉 Bronze';
}
function getSummary(structure, codeQuality, documentation, testing, versionControl, techStack, realWorld) {
    let summary = 'This project demonstrates a ';

    const overallQuality = (codeQuality.score / codeQuality.maxScore) * 100;
    if (overallQuality > 75) {
        summary += 'high level of code quality, with good practices in place. ';
    } else if (overallQuality > 50) {
        summary += 'decent level of code quality, but there is room for improvement. ';
    } else {
        summary += 'need for significant improvement in code quality and consistency. ';
    }

    const overallStructure = (structure.score / structure.maxScore) * 100;
    if (overallStructure > 75) {
        summary += 'It has a well-organized project structure, making it easy to navigate. ';
    } else {
        summary += 'The project structure could be improved for better clarity and organization. ';
    }

    const overallDocumentation = (documentation.score / documentation.maxScore) * 100;
    if (overallDocumentation > 60) {
        summary += 'The documentation is comprehensive and provides good context. ';
    } else {
        summary += 'The documentation is sparse and could be expanded to help new contributors. ';
    }

    const overallTesting = (testing.score / testing.maxScore) * 100;
    if (overallTesting > 50) {
        summary += 'The project includes a solid testing foundation. ';
    } else {
        summary += 'However, it lacks a robust testing strategy, which is crucial for stability. ';
    }

    const issues = [
        ...structure.issues,
        ...codeQuality.issues,
        ...documentation.issues,
        ...testing.issues,
        ...versionControl.issues,
        ...techStack.issues,
        ...realWorld.issues
    ].filter(issue => issue);

    if (issues.length > 0) {
        summary += ' Key areas that need attention are: ' + issues.join(' ');
    }

    return summary;
}
function getRoadmap(structure, codeQuality, documentation, versionControl, testing, techStack, realWorld) {
    const roadmap = [];

    if (documentation.issues.includes('README.md not found or could not be read.')) {
        roadmap.push('Create a README.md file to provide a project overview, setup instructions, and usage examples.');
    } else if ((documentation.score / documentation.maxScore) * 100 < 60) {
        roadmap.push('Enhance the README.md with more detailed sections on installation, configuration, and contribution guidelines.');
    }

    if (testing.issues.includes('No dedicated test directory found (e.g., test, tests, __tests__).')) {
        roadmap.push('Set up a testing framework (e.g., Jest, Mocha) and create a `tests` directory to start writing unit and integration tests.');
    } else if ((testing.score / testing.maxScore) * 100 < 50) {
        roadmap.push('Increase test coverage by adding more tests for existing functionality and implementing tests for new features.');
    }

    if ((versionControl.score / versionControl.maxScore) * 100 < 50) {
        roadmap.push('Improve Git practices by writing more descriptive commit messages and considering a branching strategy like GitFlow.');
    }

    if (structure.issues.includes('No src or source directory found.')) {
        roadmap.push('Organize source code by creating a `src` directory to separate it from configuration files.');
    } else if ((structure.score / structure.maxScore) * 100 < 75) {
        roadmap.push('Improve project structure by grouping related files into modules or components.');
    }
    
    if (structure.issues.includes('No package.json found in the root directory.')) {
        roadmap.push('Initialize a `package.json` file using `npm init` to manage dependencies and define project scripts.');
    }

    if (codeQuality.issues.includes('No linter or formatter configuration file found (e.g., .eslintrc, .prettierrc).')) {
        roadmap.push('Add a linter (e.g., ESLint) and a code formatter (e.g., Prettier) to enforce consistent coding style and catch potential errors.');
    } else if ((codeQuality.score / codeQuality.maxScore) * 100 < 75) {
        roadmap.push('Address the issues identified by the linter and consider adopting stricter rules for better code quality.');
    }

    if (roadmap.length === 0) {
        roadmap.push('Excellent work! Your project follows best practices. To further enhance it, consider setting up a CI/CD pipeline with GitHub Actions for automated builds, tests, and deployments.');
    } else {
        roadmap.push('Implement a CI/CD pipeline using GitHub Actions to automate the testing and deployment process, ensuring code quality and stability.');
    }

    return roadmap;
}

app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port: ${port}`);
});