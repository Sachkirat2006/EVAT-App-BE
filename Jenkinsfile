pipeline {
    agent any

    // Jenkins may not inherit the same PATH as the macOS terminal.
    // This ensures Node.js, npm and Git can be found.
    environment {
        PATH = "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${env.PATH}"
    }

    stages {

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

        stage('Install Dependencies') {
            steps {
                echo 'Installing project dependencies using npm ci...'

                sh '''
                    npm ci
                    echo "Dependency installation completed successfully."
                '''
            }
        }

        stage('Automated Testing') {
            steps {
                echo 'Running stable automated test suite...'

                sh '''
                    npm run test:ci
                '''
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully.'
        }

        failure {
            echo 'Pipeline failed. Check the Jenkins console output.'
        }
    }
}