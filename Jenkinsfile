pipeline {
    agent any

    // Jenkins may not inherit the same PATH as the macOS terminal.
    // This ensures Node.js, npm and Git can be found.
    environment {
        PATH = "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${env.PATH}"
    }

    stages {

        // Stage 1: Check out the dedicated SIT223 pipeline branch.
        stage('Checkout') {
            steps {
                echo 'Checking out EVAT backend source code...'

                git branch: 'sit223-hd-pipeline',
                    url: 'https://github.com/Sachkirat2006/EVAT-App-BE.git'

                sh '''
                    echo "Current branch:"
                    git branch --show-current

                    echo "Latest commit:"
                    git log -1 --oneline
                '''
            }
        }

        // Stage 2: Verify that Jenkins has access to the required CI tools.
        stage('Environment Verification') {
            steps {
                echo 'Verifying CI environment and required development tools...'

                sh '''
                    echo "Node.js version:"
                    node --version

                    echo "NPM version:"
                    npm --version

                    echo "Git version:"
                    git --version
                '''
            }
        }

        // Stage 3: Install exact dependency versions from package-lock.json.
        stage('Install Dependencies') {
            steps {
                echo 'Installing project dependencies using npm ci...'

                sh '''
                    npm ci
                    echo "Dependency installation completed successfully."
                '''
            }
        }

        // Stage 4: Compile the TypeScript backend and verify build output.
        stage('Build') {
            steps {
                echo 'Building EVAT backend application...'

                sh '''
                    echo "Removing previous build output..."
                    rm -rf dist

                    echo "Compiling TypeScript source code..."
                    npm run build

                    echo "Verifying build output..."
                    test -d dist

                    echo "Build artifact contents:"
                    ls -la dist

                    echo "Production build completed successfully."
                '''
            }
        }

        // Stage 5: Run the stable automated CI test suite.
        stage('Automated Testing') {
            steps {
                echo 'Running stable automated test suite...'

                sh '''
                    npm run test:ci
                    echo "Automated testing completed successfully."
                '''
            }
        }
    }

    // Report the final status of the Jenkins pipeline.
    post {
        success {
            echo 'Pipeline completed successfully.'
        }

        failure {
            echo 'Pipeline failed. Check the Jenkins console output.'
        }
    }
}