pipeline {
    agent any

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