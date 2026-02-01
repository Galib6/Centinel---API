pipeline {
    agent any

    environment {
        // Define your environment variables here
        DOCKER_IMAGE_NAME = 'centinel-api'
        DOCKER_REGISTRY = 'your-registry-url' // e.g., 'docker.io/username'
        DOCKER_CREDENTIALS_ID = 'your-docker-credentials-id'
        // NODE_ENV = 'production' // variable set in Dockerfile/env files
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'yarn install --frozen-lockfile'
            }
        }

        stage('Lint') {
            steps {
                sh 'yarn lint'
            }
        }

        stage('Test') {
            steps {
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
                script {
                    dockerImage = docker.build("${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${env.BUILD_NUMBER}")
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    docker.withRegistry("https://${DOCKER_REGISTRY}", "${DOCKER_CREDENTIALS_ID}") {
                        dockerImage.push()
                        dockerImage.push("latest")
                    }
                }
            }
        }

        stage('Deploy') {
            // Adjust this stage based on your deployment strategy (e.g., SSH, Kubernetes, etc.)
            steps {
                echo 'Deploying...'
                // Example SSH deployment:
                // sshagent(['your-ssh-credentials-id']) {
                //     sh "ssh user@server 'docker pull ${DOCKER_REGISTRY}/${DOCKER_IMAGE_NAME}:${env.BUILD_NUMBER} && docker-compose up -d'"
                // }
            }
        }
    }

    post {
        always {
            // Clean up workspace or docker images if needed
            cleanWs()
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
