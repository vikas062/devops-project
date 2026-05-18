// ═══════════════════════════════════════════════════════════════
// Jenkinsfile — CodeCanon Full CI/CD Pipeline
//
// Stages:
//   1. Checkout         → Clone repository
//   2. Build Frontend   → npm install + npm run build
//   3. Docker Push      → Build & push backend + frontend images
//   4. Deploy to K8s    → SSH to EC2, apply manifests, rollout
//   5. Health Check     → Verify app is live
// ═══════════════════════════════════════════════════════════════

pipeline {
    agent any

    // ─────────────────────────────────────────
    // Environment — Jenkins Credentials
    // ─────────────────────────────────────────
    environment {
        DOCKER_USERNAME = credentials('DOCKER_USERNAME')   // DockerHub username
        DOCKER_PASSWORD = credentials('DOCKER_PASSWORD')   // DockerHub password
        EC2_HOST        = credentials('EC2_HOST')          // EC2 IP: 13.232.177.179
        BACKEND_IMAGE   = "${DOCKER_USERNAME}/codecanon-backend:latest"
        FRONTEND_IMAGE  = "${DOCKER_USERNAME}/codecanon-frontend:latest"
    }

    stages {

        // ─────────────────────────────────────────
        // Stage 1: Checkout
        // ─────────────────────────────────────────
        stage('Checkout') {
            steps {
                echo '📥 Checking out repository...'
                checkout scm
                echo "✅ Branch: ${env.BRANCH_NAME ?: 'master'} | Commit: ${env.GIT_COMMIT?.take(7)}"
            }
        }

        // ─────────────────────────────────────────
        // Stage 2: Build Frontend
        // ─────────────────────────────────────────
        stage('Build Frontend') {
            steps {
                echo '⚙️  Installing dependencies and building frontend...'
                sh 'node --version && npm --version'
                sh 'npm ci --prefer-offline'
                sh 'npm run build'
                echo '✅ Frontend build successful!'
            }
        }

        // ─────────────────────────────────────────
        // Stage 3: Docker Build & Push
        // ─────────────────────────────────────────
        stage('Docker Build & Push') {
            steps {
                echo '🐳 Logging in to DockerHub...'
                sh 'echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin'

                echo '🔨 Building Backend image...'
                sh "docker build -t ${BACKEND_IMAGE} ./server"

                echo '🔨 Building Frontend image...'
                sh "docker build -t ${FRONTEND_IMAGE} ."

                echo '📤 Pushing images to DockerHub...'
                sh "docker push ${BACKEND_IMAGE}"
                sh "docker push ${FRONTEND_IMAGE}"

                echo '✅ Images pushed successfully!'
            }
            post {
                always {
                    sh 'docker logout || true'
                }
            }
        }

        // ─────────────────────────────────────────
        // Stage 4: Deploy to Kubernetes (EC2)
        // ─────────────────────────────────────────
        stage('Deploy to K8s') {
            steps {
                echo '🚀 Deploying to Kubernetes on EC2...'
                sshagent(credentials: ['EC2_SSH_KEY']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@${EC2_HOST} '
                            # Apply dockerhub pull secret (if exists)
                            kubectl apply -f ~/k8s/dockerhub-secret.yaml --validate=false 2>/dev/null || true

                            # Apply backend manifests
                            kubectl apply -f ~/k8s/backend-secret.yaml --validate=false 2>/dev/null || true
                            kubectl apply -f ~/k8s/backend-deployment.yaml --validate=false
                            kubectl apply -f ~/k8s/backend-service.yaml --validate=false

                            # Apply frontend manifests
                            kubectl apply -f ~/k8s/frontend-deployment.yaml --validate=false
                            kubectl apply -f ~/k8s/frontend-service.yaml --validate=false

                            # Force pull new images
                            kubectl rollout restart deployment/codecanon-backend || true
                            kubectl rollout restart deployment/codecanon-frontend || true

                            # Wait for rollout (timeout 90s — t3.micro is slow)
                            kubectl rollout status deployment/codecanon-backend --timeout=90s || true
                            kubectl rollout status deployment/codecanon-frontend --timeout=90s || true

                            echo "=== Pod Status ==="
                            kubectl get pods
                        '
                    """
                }
                echo '✅ Deployment complete!'
            }
        }

        // ─────────────────────────────────────────
        // Stage 5: Health Check
        // ─────────────────────────────────────────
        stage('Health Check') {
            steps {
                echo '❤️  Running health check...'
                sh 'sleep 20'
                sh "curl -f --retry 3 --retry-delay 5 http://${EC2_HOST}:30500/api/health || exit 1"
                sh "curl -f --retry 3 --retry-delay 5 http://${EC2_HOST}:30080 || exit 1"
                echo '✅ App is live and healthy!'
            }
        }
    }

    // ─────────────────────────────────────────
    // Post Actions
    // ─────────────────────────────────────────
    post {
        success {
            echo """
            ╔══════════════════════════════════╗
            ║  🎉 DEPLOYMENT SUCCESSFUL!        ║
            ║  Frontend: http://${EC2_HOST}:30080   ║
            ║  Backend:  http://${EC2_HOST}:30500   ║
            ╚══════════════════════════════════╝
            """
        }
        failure {
            echo '❌ Pipeline failed! Check logs above for details.'
        }
        always {
            echo '🧹 Cleaning up Docker images from Jenkins agent...'
            sh 'docker image prune -f || true'
        }
    }
}
