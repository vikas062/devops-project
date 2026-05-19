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

    environment {
        DOCKER_USERNAME = credentials('DOCKER_USERNAME')
        DOCKER_PASSWORD = credentials('DOCKER_PASSWORD')
        EC2_HOST        = credentials('EC2_HOST')
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
                echo "✅ Commit: ${env.GIT_COMMIT?.take(7) ?: 'latest'}"
            }
        }

        // ─────────────────────────────────────────
        // Stage 2: Build Frontend
        // ─────────────────────────────────────────
        stage('Build Frontend') {
            steps {
                echo '⚙️  Installing dependencies and building frontend...'
                sh 'node --version && npm --version'
                sh 'npm install'
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

                echo '✅ Images pushed!'
            }
            post {
                always {
                    sh 'docker logout || true'
                }
            }
        }

        // ─────────────────────────────────────────
        // Stage 4: Deploy to K8s
        // ─────────────────────────────────────────
        stage('Deploy to K8s') {
            steps {
                echo '🚀 Deploying to Kubernetes on EC2...'
                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: 'EC2_SSH_KEY',
                        keyFileVariable: 'SSH_KEY_FILE',
                        usernameVariable: 'SSH_USER'
                    )
                ]) {
                    sh """
                        chmod 600 \$SSH_KEY_FILE
                        ssh -o StrictHostKeyChecking=no -i \$SSH_KEY_FILE ubuntu@${EC2_HOST} '
                            kubectl rollout restart deployment/codecanon-backend || true
                            kubectl rollout restart deployment/codecanon-frontend || true
                            kubectl rollout status deployment/codecanon-backend --timeout=90s || true
                            kubectl rollout status deployment/codecanon-frontend --timeout=90s || true
                            echo "=== Pod Status ===" && kubectl get pods
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
                sh 'sleep 15'
                sh "curl -fsk --retry 3 --retry-delay 5 https://13.204.29.48.nip.io/api/health"
                echo '✅ App is live!'
            }
        }
    }

    post {
        success {
            echo '🎉 DEPLOYMENT SUCCESSFUL! App live at https://13.204.29.48.nip.io'
        }
        failure {
            echo '❌ Pipeline failed! Check logs above.'
        }
        always {
            sh 'docker image prune -f || true'
        }
    }
}
