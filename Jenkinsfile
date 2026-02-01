pipeline {
    agent any

    environment {
        // Define your environment variables here
        DOCKER_IMAGE_NAME = 'centinel-api'
        DOCKER_REGISTRY = 'your-registry-url' // e.g., 'docker.io' or 'registry.example.com'
        DOCKER_REPO = 'your-username/centinel-api' // e.g., 'galib/centinel-api'
        DOCKER_CREDENTIALS_ID = 'your-docker-credentials-id'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Prepare & Test') {
            steps {
                // Run yarn inside a temporary node container mapped to the current workspace
                // This avoids needing yarn installed on the Jenkins host
                // We use sh -c to run multiple commands inside the container
                sh 'docker run --rm -v "${WORKSPACE}:/app" -w /app node:22.12.0-alpine sh -c "yarn install --frozen-lockfile && yarn lint && yarn test"'
            }
        }

        stage('Build Docker Image') {
            steps {
                // Build using standard docker command
                sh "docker build -t ${DOCKER_REGISTRY}/${DOCKER_REPO}:${env.BUILD_NUMBER} ."
            }
        }

        stage('Push Docker Image') {
            steps {
                // Use withCredentials to securely inject username/password
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
            // Clean up images to save space
            sh "docker rmi ${DOCKER_REGISTRY}/${DOCKER_REPO}:${env.BUILD_NUMBER} || true"
            sh "docker rmi ${DOCKER_REGISTRY}/${DOCKER_REPO}:latest || true"
            cleanWs()
        }
    }
}
