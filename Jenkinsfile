pipeline {
    agent any

    // This tool directive tells Jenkins to install/use the configured Node.js environment
    // Ensure you have configured a NodeJS tool named 'node' in Jenkins Global Tool Configuration
    tools {
        nodejs 'node'
    }

    environment {
        // Define your environment variables here
        DOCKER_IMAGE_NAME = 'centinel-api'
        DOCKER_REGISTRY = 'your-registry-url' // e.g., 'docker.io'
        DOCKER_REPO = 'your-username/centinel-api' 
        DOCKER_CREDENTIALS_ID = 'your-docker-credentials-id'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                // Install yarn globally if not present in the node image
                sh 'npm install -g yarn'
                sh 'yarn install --frozen-lockfile'
            }
        }

        stage('Lint & Test') {
            steps {
                sh 'yarn lint'
                sh 'yarn test'
            }
        }

        stage('Build Application') {
            steps {
                sh 'yarn build'
            }
        }

        stage('Build Docker Image') {
            steps {
                // This step REQUIRES Docker to be installed on the Jenkins server
                // If this fails, your Jenkins agent cannot talk to the Docker daemon.
                sh "docker build -t ${DOCKER_REGISTRY}/${DOCKER_REPO}:${env.BUILD_NUMBER} ."
            }
        }

        stage('Push Docker Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDENTIALS_ID}", passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                    sh "echo \$DOCKER_PASSWORD | docker login ${DOCKER_REGISTRY} -u \$DOCKER_USERNAME --password-stdin"
                    
                    sh "docker push ${DOCKER_REGISTRY}/${DOCKER_REPO}:${env.BUILD_NUMBER}"
                    
                    // Tag and push latest
                    sh "docker tag ${DOCKER_REGISTRY}/${DOCKER_REPO}:${env.BUILD_NUMBER} ${DOCKER_REGISTRY}/${DOCKER_REPO}:latest"
                    sh "docker push ${DOCKER_REGISTRY}/${DOCKER_REPO}:latest"
                }
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying...'
                // Add deployment steps here
            }
        }
    }

    post {
        always {
            // Clean up images to save space (ignore errors if docker is missing)
            sh "docker rmi ${DOCKER_REGISTRY}/${DOCKER_REPO}:${env.BUILD_NUMBER} || true"
            sh "docker rmi ${DOCKER_REGISTRY}/${DOCKER_REPO}:latest || true"
            cleanWs()
        }
    }
}
