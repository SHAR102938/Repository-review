Working link : https://repository-review-oitn.onrender.com
Since it is a unpaid server so due to inactivity on server for 15 min it automatically shutdown
so when entering a website waitfor 15-20 sec so that server start and after clicking on Analyze wait for 5-10 sec it will take to analyze
# Code Reviewer AI

Code Reviewer AI is a web application that provides an in-depth analysis of your GitHub repositories. It evaluates various aspects of your project, including code quality, project structure, documentation, testing practices, and more, to generate a comprehensive report with an overall score and a developer skill level assessment.

## Features

-   **Comprehensive Repository Analysis:** Get a detailed report on your project's health.
-   **Multiple Analysis Categories:**
    -   **Code Quality:** Uses ESLint to check for code errors and warnings.
    -   **Project Structure:** Analyzes the organization of your files and directories.
    -   **Documentation:** Evaluates the completeness of your `README.md` file.
    -   **Testing:** Checks for the presence and ratio of test files.
    -   **Git Practices:** Analyzes commit history for best practices.
    -   **Security:** Uses `npm audit` to find vulnerabilities in dependencies.
    -   **Code Complexity:** Measures cyclomatic complexity to assess code maintainability.
-   **Overall Score & Skill Level:** Receive an overall score for your repository and a corresponding skill level (Novice, Beginner, Intermediate, Advanced, Expert).
-   **Personalized Roadmap:** Get actionable suggestions to improve your project.
-   **Modern UI:** A clean and intuitive user interface built with React.

## Tech Stack

-   **Frontend:** React, CSS
-   **Backend:** Node.js, Express.js
-   **Code Analysis:**
    -   `simple-git`: For cloning repositories.
    -   `eslint`: For static code analysis.
    -   `escomplex`: For cyclomatic complexity analysis.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have Node.js and npm installed on your machine.
-   [Node.js](https://nodejs.org/) (which includes npm)
-   [Git](https://git-scm.com/)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/SHAR102938/Repository-review.git
    cd Repository-review
    ```

2.  **Install backend dependencies:**
    ```sh
    npm install
    ```

3.  **Install frontend dependencies:**
    ```sh
    cd client
    npm install
    cd ..
    ```

## Usage

To run the application, you need to start both the backend server and the frontend client.

1.  **Start the backend server:**
    From the root directory, run:
    ```sh
    npm start
    ```
    The server will start on `http://localhost:5000`.

2.  **Start the frontend client:**
    In a new terminal, navigate to the `client` directory and run:
    ```sh
    npm start
    ```
    The React development server will start, and the application will open in your default browser at `http://localhost:3000`.

3.  **Analyze a repository:**
    -   Open the application in your browser.
    -   Paste the URL of a public GitHub repository into the input field.
    -   Click the "Analyze" button to see the results.

## API Endpoints

The backend server exposes the following API endpoint:

-   `POST /api/analyze`
    -   Analyzes a GitHub repository.
    -   **Request Body:**
        ```json
        {
          "repoUrl": "https://github.com/user/repo-name"
        }
        ```
    -   **Response:** A JSON object containing the detailed analysis report.

## Project Structure

```
.
├── client/         # React frontend application
│   ├── public/
│   └── src/
├── server/         # Node.js backend server
│   ├── .eslintrc.js
│   └── server.js
├── .gitignore
├── package.json
└── README.md
```

## Contributing

Contributions are welcome! If you have suggestions for improvements, please feel free to open an issue or submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
