pipeline {
    agent any

    environment {
        NODE_ENV = 'production'
        APP_NAME = 'centinel-prod'
        NGINX_CONFIG_PATH = '/etc/nginx/sites-enabled/c.r-tech.live'
        APP_DOMAIN = 'c.r-tech.live'
        HEALTH_CHECK_END_POINT = '/api/v1/health'
        DEPLOY_DIRECTORY = '~/deploy/centinel-prod'

        // Primary and secondary ports for zero-downtime deploys
        PRIMARY_PORT = '4601'
        SECONDARY_PORT = '4600'

        // Credentials - Ensure these IDs exist in your Jenkins Credentials
        DOCKER_CREDS = credentials('docker-hub-credentials') // Username/Password credential
        PROD_SSH_KEY = credentials('prod-ssh-key-bd') // SSH Private Key credential
        PROD_HOST = 'your-production-host-ip-here' // Or verify if this should be a secret
        PROD_USER = 'your-production-user-here'
        PRODUCTION_ENV_VARS = credentials('production-env-vars') // Secret text credential containing full .env content
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Process and Load Environment Variables') {
            steps {
                script {
                    // Create environments directory if it doesn't exist
                    sh 'mkdir -p ./environments'
                    
                    // Write secrets to production.env
                    // Using withCredentials to safely handle the secret text
                    withCredentials([string(credentialsId: 'production-env-vars', variable: 'ENV_VARS')]) {
                        sh '''
                            echo "$ENV_VARS" | tr -d '\r' | sed "s/^[[:space:]]*//;s/[[:space:]]*$//;s/ *= */=/" > ./environments/production.env
                            echo "✅ Created production.env"
                            # cat ./environments/production.env # Be careful printing secrets in logs
                        '''
                    }
                }
            }
        }

        stage('Build and Push Docker Image') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'docker-hub-credentials') {
                        def dockerImage = docker.build("${DOCKER_CREDS_USR}/${APP_NAME}:latest", "--file Dockerfile .")
                        dockerImage.push()
                    }
                }
            }
        }

        stage('Zero Downtime Deploy to DigitalOcean') {
            steps {
                sshagent(['prod-ssh-key-bd']) {
                    script {
                        def remoteCommand = """
                            set -e

                            echo "Logging into Docker"
                            mkdir -p /tmp/docker-config
                            echo '{}' > /tmp/docker-config/config.json
                            export DOCKER_CONFIG=/tmp/docker-config
                            echo "${DOCKER_CREDS_PSW}" | docker login -u "${DOCKER_CREDS_USR}" --password-stdin

                            echo "Pulling latest Docker image"
                            docker pull ${DOCKER_CREDS_USR}/${APP_NAME}:latest

                            PRIMARY_PORT=${PRIMARY_PORT}
                            SECONDARY_PORT=${SECONDARY_PORT}
                            NGINX_CONFIG_PATH=${NGINX_CONFIG_PATH}
                            APP_NAME=${APP_NAME}
                            HEALTH_CHECK_END_POINT=${HEALTH_CHECK_END_POINT}
                            DOCKER_USER=${DOCKER_CREDS_USR}
                            
                            # Find current port from Nginx config
                            # Note: We need to escape $ in grep for Jenkins string interpolation or use single quotes for command parts if possible
                            CURRENT_PORT=\$(grep -oP '(?<=proxy_pass http://127.0.0.1:)\\d+' "\$NGINX_CONFIG_PATH" || echo "")

                            if [ -z "\$CURRENT_PORT" ]; then
                              NEW_PORT=\$SECONDARY_PORT
                              NEW_CONTAINER=\${APP_NAME}-\$SECONDARY_PORT
                            elif [ "\$CURRENT_PORT" == "\$SECONDARY_PORT" ]; then
                              NEW_PORT=\$PRIMARY_PORT
                              OLD_CONTAINER=\${APP_NAME}-\$SECONDARY_PORT
                              NEW_CONTAINER=\${APP_NAME}-\$PRIMARY_PORT
                            else
                              NEW_PORT=\$SECONDARY_PORT
                              OLD_CONTAINER=\${APP_NAME}-\$PRIMARY_PORT
                              NEW_CONTAINER=\${APP_NAME}-\$SECONDARY_PORT
                            fi

                            echo "Starting new container on port \$NEW_PORT"
                            docker run -d --name \$NEW_CONTAINER \\
                              -e NODE_ENV=production \\
                              --restart always \\
                              -p \$NEW_PORT:\$SECONDARY_PORT \\
                              -v /var/www/uploads:/uploads \\
                              \${DOCKER_USER}/\${APP_NAME}:latest || {
                                echo "❌ Failed to start container. Cleaning up..."
                                docker rmi \${DOCKER_USER}/\${APP_NAME}:latest || true
                                exit 1
                              }

                            echo "Waiting for service health on port \$NEW_PORT..."
                            for i in {1..20}; do
                              sleep 5
                              if curl -sSf http://localhost:\$NEW_PORT\${HEALTH_CHECK_END_POINT} > /dev/null; then
                                echo "✅ Healthy!"
                                break
                              elif [ \$i -eq 20 ]; then
                                echo "❌ Health check failed. Removing container and image..."
                                docker logs \$NEW_CONTAINER || true
                                docker rm -f \$NEW_CONTAINER || true
                                docker rmi \${DOCKER_USER}/\${APP_NAME}:latest || true
                                exit 1
                              fi
                            done

                            echo "Updating Nginx to new port \$NEW_PORT"
                            # We need to use sudo usually for nginx config changes, keeping as is from GH Actions script
                            sed -i "s/proxy_pass http:\\/\\/127.0.0.1:\$CURRENT_PORT;/proxy_pass http:\\/\\/127.0.0.1:\$NEW_PORT;/" "\$NGINX_CONFIG_PATH"
                            nginx -s reload

                            if [ ! -z "\$OLD_CONTAINER" ]; then
                              echo "Removing old container: \$OLD_CONTAINER"
                              OLD_IMAGE=\$(docker inspect --format='{{.Image}}' \$OLD_CONTAINER)
                              docker rm -f \$OLD_CONTAINER || true
                              docker rmi \$OLD_IMAGE || true
                              docker image prune -f
                            fi

                            echo "✅ Deployment complete"
                        """

                        // Execute the script on the remote server
                        sh "ssh -o StrictHostKeyChecking=no ${PROD_USER}@${PROD_HOST} '${remoteCommand}'"
                    }
                }
            }
        }
    }
}
