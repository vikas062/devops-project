# ═══════════════════════════════════════════════════════════════
# Jenkinsfile — CD Pipeline (Continuous Deployment)
#
# Triggered manually or after GitHub Actions CI completes.
# Pulls latest Docker images from DockerHub and redeploys
# on the AWS EC2 instance.
# ═══════════════════════════════════════════════════════════════

pipeline {
    agent any

    environment {
        DOCKER_USERNAME = credentials('docker-username')  // Jenkins secret
        COMPOSE_FILE   = 'docker-compose.yml'
    }

    stages {

        // ─────────────────────────────────────────
        // Stage 1: Pull latest Docker images
        // ─────────────────────────────────────────
        stage('Pull Latest Images') {
            steps {
                echo '📦 Pulling latest images from DockerHub...'
                sh "docker pull ${DOCKER_USERNAME}/codecanon-backend:latest"
                sh "docker pull ${DOCKER_USERNAME}/codecanon-frontend:latest"
            }
        }

        // ─────────────────────────────────────────
        // Stage 2: Stop running containers
        // ─────────────────────────────────────────
        stage('Stop Old Containers') {
            steps {
                echo '🛑 Stopping old containers...'
                sh 'docker-compose down --remove-orphans || true'
            }
        }

        // ─────────────────────────────────────────
        // Stage 3: Start updated containers
        // ─────────────────────────────────────────
        stage('Deploy') {
            steps {
                echo '🚀 Starting updated containers...'
                sh 'docker-compose up -d'
            }
        }

        // ─────────────────────────────────────────
        // Stage 4: Health Check
        // ─────────────────────────────────────────
        stage('Health Check') {
            steps {
                echo '❤️  Running health check...'
                sh 'sleep 15'
                sh 'curl -f http://localhost:5000/api/health || exit 1'
                echo '✅ Deployment successful!'
            }
        }
    }

    // ─────────────────────────────────────────
    // Post actions
    // ─────────────────────────────────────────
    post {
        success {
            echo '🎉 Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed. Rolling back...'
            sh 'docker-compose down || true'
        }
    }
}
