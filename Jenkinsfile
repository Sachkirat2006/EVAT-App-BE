pipeline {
    agent any

    environment {
        PATH = "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${env.PATH}"

        // Local Jenkins deployment/release locations
        STAGING_DIR = "${WORKSPACE}/staging"
        RELEASE_DIR = "${WORKSPACE}/releases"
    }

    stages {

        // ---------------------------------------------------------
        // SOURCE CONTROL
        // ---------------------------------------------------------
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

        // ---------------------------------------------------------
        // ENVIRONMENT VERIFICATION
        // ---------------------------------------------------------
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

        // ---------------------------------------------------------
        // DEPENDENCIES
        // ---------------------------------------------------------
        stage('Install Dependencies') {
            steps {
                echo 'Installing exact project dependencies...'

                sh '''
                    npm ci
                    echo "Dependency installation completed successfully."
                '''
            }
        }

        // ---------------------------------------------------------
        // 1. BUILD
        // ---------------------------------------------------------
        stage('Build') {
            steps {
                echo 'Building EVAT backend application...'

                sh '''
                    echo "Removing previous build output..."
                    rm -rf dist

                    echo "Compiling TypeScript..."
                    npm run build

                    echo "Verifying build artefact..."
                    test -d dist

                    echo "Build artefact:"
                    ls -la dist

                    echo "Build completed successfully."
                '''
            }
        }

        // ---------------------------------------------------------
        // 2. CODE QUALITY
        // ---------------------------------------------------------
        stage('Code Quality') {
            steps {
                echo 'Running ESLint static code analysis...'

                sh '''
                    npm run quality:ci
                    echo "Code quality gate passed."
                '''
            }
        }

        // ---------------------------------------------------------
        // 3. AUTOMATED TESTING
        // ---------------------------------------------------------
        stage('Automated Testing') {
            steps {
                echo 'Running automated Jest test suite...'

                sh '''
                    npm run test:ci
                    echo "Automated testing completed successfully."
                '''
            }
        }

        // ---------------------------------------------------------
        // 4. SECURITY
        // ---------------------------------------------------------
        stage('Security') {
            steps {
                echo 'Performing automated dependency security analysis...'

                sh '''
                    echo "Generating npm security audit report..."

                    # Generate evidence even when npm finds vulnerabilities.
                    npm audit --json > security-audit.json || true

                    echo "Security report generated:"
                    test -f security-audit.json
                    ls -lh security-audit.json

                    echo "Human-readable vulnerability summary:"
                    npm audit || true

                    echo "Security analysis completed."
                '''
            }
        }

        // ---------------------------------------------------------
        // 5. DEPLOY TO STAGING
        // ---------------------------------------------------------
        stage('Deploy') {
            steps {
                echo 'Deploying EVAT backend build to staging environment...'

                sh '''
                    echo "Preparing clean staging environment..."

                    rm -rf "$STAGING_DIR"
                    mkdir -p "$STAGING_DIR"

                    echo "Deploying compiled application..."
                    cp -R dist "$STAGING_DIR/dist"
                    cp package.json "$STAGING_DIR/package.json"
                    cp package-lock.json "$STAGING_DIR/package-lock.json"

                    echo "Recording deployment information..."
                    {
                        echo "Environment: STAGING"
                        echo "Build Number: $BUILD_NUMBER"
                        echo "Git Commit: $(git rev-parse HEAD)"
                        echo "Branch: $(git branch --show-current)"
                        echo "Deployment Time: $(date)"
                    } > "$STAGING_DIR/deployment-info.txt"

                    echo "Verifying staging deployment..."

                    test -d "$STAGING_DIR/dist"
                    test -f "$STAGING_DIR/package.json"
                    test -f "$STAGING_DIR/deployment-info.txt"

                    echo "Staging deployment contents:"
                    ls -la "$STAGING_DIR"

                    echo "Application deployed successfully to staging."
                '''
            }
        }

        // ---------------------------------------------------------
        // 6. RELEASE
        // ---------------------------------------------------------
        stage('Release') {
            steps {
                echo 'Creating versioned EVAT production release...'

                sh '''
                    VERSION="1.0.${BUILD_NUMBER}"
                    RELEASE_NAME="evat-backend-${VERSION}"

                    echo "Release version: ${VERSION}"

                    mkdir -p "$RELEASE_DIR"

                    rm -rf "${RELEASE_DIR}/${RELEASE_NAME}"
                    mkdir -p "${RELEASE_DIR}/${RELEASE_NAME}"

                    echo "Promoting tested staging build..."

                    cp -R "$STAGING_DIR/dist" \
                        "${RELEASE_DIR}/${RELEASE_NAME}/dist"

                    cp "$STAGING_DIR/package.json" \
                        "${RELEASE_DIR}/${RELEASE_NAME}/package.json"

                    cp "$STAGING_DIR/package-lock.json" \
                        "${RELEASE_DIR}/${RELEASE_NAME}/package-lock.json"

                    {
                        echo "EVAT Production Release"
                        echo "Version: ${VERSION}"
                        echo "Jenkins Build: $BUILD_NUMBER"
                        echo "Git Commit: $(git rev-parse HEAD)"
                        echo "Release Date: $(date)"
                        echo "Source Environment: STAGING"
                    } > "${RELEASE_DIR}/${RELEASE_NAME}/RELEASE_INFO.txt"

                    echo "Creating compressed release artefact..."

                    cd "$RELEASE_DIR"
                    tar -czf "${RELEASE_NAME}.tar.gz" "${RELEASE_NAME}"

                    echo "Verifying production release..."

                    test -f "${RELEASE_NAME}.tar.gz"

                    echo "Production release artefacts:"
                    ls -lh

                    echo "Release ${VERSION} created successfully."
                '''
            }
        }

        // ---------------------------------------------------------
        // 7. MONITORING AND ALERTING
        // ---------------------------------------------------------
        stage('Monitoring & Alerting') {
            steps {
                echo 'Running automated deployment monitoring checks...'

                sh '''
                    MONITOR_LOG="$WORKSPACE/monitoring.log"
                    ALERT_LOG="$WORKSPACE/alerts.log"

                    echo "====================================" > "$MONITOR_LOG"
                    echo "EVAT Deployment Monitoring Report" >> "$MONITOR_LOG"
                    echo "====================================" >> "$MONITOR_LOG"
                    echo "Jenkins Build: $BUILD_NUMBER" >> "$MONITOR_LOG"
                    echo "Timestamp: $(date)" >> "$MONITOR_LOG"

                    echo "Checking staging deployment..."

                    if [ -d "$STAGING_DIR/dist" ] && \
                       [ -f "$STAGING_DIR/package.json" ] && \
                       [ -f "$STAGING_DIR/deployment-info.txt" ]; then

                        echo "STATUS: HEALTHY" | tee -a "$MONITOR_LOG"
                        echo "Staging deployment artefacts are available." \
                            | tee -a "$MONITOR_LOG"

                    else
                        echo "STATUS: UNHEALTHY" | tee -a "$MONITOR_LOG"

                        echo "ALERT: EVAT staging deployment health check failed at $(date)" \
                            | tee -a "$ALERT_LOG"

                        exit 1
                    fi

                    echo "Checking production release..."

                    RELEASE_COUNT=$(find "$RELEASE_DIR" -name "*.tar.gz" | wc -l | tr -d ' ')

                    echo "Release artefacts detected: $RELEASE_COUNT" \
                        | tee -a "$MONITOR_LOG"

                    if [ "$RELEASE_COUNT" -lt 1 ]; then
                        echo "ALERT: No production release artefact detected." \
                            | tee -a "$ALERT_LOG"

                        exit 1
                    fi

                    echo "STATUS: PRODUCTION RELEASE AVAILABLE" \
                        | tee -a "$MONITOR_LOG"

                    echo "Monitoring and alerting checks passed."
                '''
            }
        }
    }

    // -------------------------------------------------------------
    // PIPELINE RESULTS / EVIDENCE
    // -------------------------------------------------------------
    post {

        always {
            echo 'SIT223 EVAT CI/CD pipeline execution finished.'

            archiveArtifacts artifacts: 'security-audit.json, monitoring.log, alerts.log, releases/*.tar.gz',
                             allowEmptyArchive: true,
                             fingerprint: true
        }

        success {
            echo 'All seven assessed DevOps stages completed successfully.'
            echo 'EVAT CI/CD pipeline completed successfully.'
        }

        failure {
            echo 'Pipeline failed. Review the Jenkins console output and monitoring evidence.'
        }
    }
}