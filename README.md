# 🚀 CodeCanon — Full-Stack DevOps Project

A production-grade full-stack web application with a complete **CI/CD pipeline**, **container orchestration**, and **monitoring stack** — deployed on AWS EC2 using industry-standard DevOps tooling.

---

## 📋 Table of Contents

- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Infrastructure](#-infrastructure)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Monitoring](#-monitoring)
- [Access URLs](#-access-urls)
- [Project Structure](#-project-structure)
- [Setup Guide](#-setup-guide)

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    AWS EC2 (m7i.large)                   │
│                                                         │
│  ┌──────────┐   ┌───────────────────────────────────┐   │
│  │ Jenkins  │   │        K3s Cluster                 │   │
│  │ (Docker) │   │  ┌──────────┐  ┌──────────────┐   │   │
│  │ :8080    │──▶│  │ Frontend │  │   Backend    │   │   │
│  └──────────┘   │  │  (Nginx) │  │  (Express)   │   │   │
│                  │  │  :30080  │  │   :30500     │   │   │
│  ┌──────────┐   │  └──────────┘  └──────────────┘   │   │
│  │Prometheus│   └───────────────────────────────────┘   │
│  │  :9090   │                                           │
│  ├──────────┤   ┌───────────────┐                       │
│  │ Grafana  │   │  Node         │                       │
│  │  :3001   │   │  Exporter     │                       │
│  └──────────┘   │  :9100        │                       │
│                  └───────────────┘                       │
└─────────────────────────────────────────────────────────┘
          │
          ▼
   ┌──────────────┐
   │   DockerHub   │
   │  (Registry)   │
   └──────────────┘
          │
          ▼
   ┌──────────────┐
   │   MongoDB     │
   │  (Atlas)      │
   └──────────────┘
```

---

## 🛠 Tech Stack

### Application
| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, TailwindCSS         |
| Backend   | Node.js, Express.js, Passport.js    |
| Database  | MongoDB Atlas                       |
| Auth      | Google OAuth 2.0, JWT               |

### DevOps & Infrastructure
| Tool            | Purpose                              |
|-----------------|--------------------------------------|
| **Terraform**   | Infrastructure as Code (AWS)         |
| **Docker**      | Containerization                     |
| **Kubernetes**  | Container Orchestration (K3s)        |
| **Jenkins**     | CI/CD Pipeline Automation            |
| **Nginx**       | Reverse Proxy & Static Serving       |
| **Prometheus**  | Metrics Collection & Alerting        |
| **Grafana**     | Monitoring Dashboard & Visualization |
| **Node Exporter** | System Metrics (CPU, RAM, Disk)   |
| **GitHub**      | Source Code Management               |
| **DockerHub**   | Container Image Registry             |

---

## ☁️ Infrastructure

### AWS Resources (Terraform-managed)
- **EC2 Instance**: `m7i.large` (2 vCPU, 8 GB RAM)
- **Elastic IP**: `13.204.29.48` (static)
- **Security Group**: `codecanon-sg`
  - SSH (22), HTTP (80), HTTPS (443)
  - Backend API (5000), Jenkins (8080)
  - Prometheus (9090), Grafana (3001)
  - K8s NodePorts (30000-32767)

### Kubernetes (K3s)
- **Frontend Deployment**: Nginx serving React build
- **Backend Deployment**: Node.js Express API
- **Services**: NodePort (30080 frontend, 30500 backend)
- **Secrets**: Environment variables managed via K8s Secrets

---

## 🔄 CI/CD Pipeline

### Jenkins Pipeline (`Jenkinsfile`)

```
┌───────────┐   ┌────────────┐   ┌─────────────┐   ┌───────────┐   ┌─────────────┐
│  Checkout  │──▶│   Build    │──▶│ Docker Push │──▶│  Deploy   │──▶│   Health    │
│   (Git)    │   │ (Frontend) │   │ (DockerHub) │   │  (K8s)    │   │   Check    │
└───────────┘   └────────────┘   └─────────────┘   └───────────┘   └─────────────┘
```

**Stages:**
1. **Checkout** — Clone from GitHub (`master` branch)
2. **Build Frontend** — `npm install` + `vite build`
3. **Docker Build & Push** — Build backend + frontend images → DockerHub
4. **Deploy to K8s** — SSH to EC2, `kubectl rollout restart`
5. **Health Check** — `curl` backend `/api/health`

### Credentials (Jenkins)
| ID              | Type        | Description           |
|-----------------|-------------|-----------------------|
| DOCKER_USERNAME | Secret Text | DockerHub username     |
| DOCKER_PASSWORD | Secret Text | DockerHub password     |
| EC2_HOST        | Secret Text | EC2 Elastic IP         |
| EC2_SSH_KEY     | SSH Key     | EC2 PEM private key    |

---

## 📊 Monitoring

### Prometheus
- Scrapes metrics every **15s**
- Targets: Backend API, Node Exporter, Jenkins, Self

### Grafana
- **Datasource**: Prometheus (auto-configured)
- **Dashboard**: Node Exporter Full (ID: 1860)
- Metrics: CPU, Memory, Disk I/O, Network, System Load

### Node Exporter
- Exposes OS-level metrics on port `9100`
- Feeds into Prometheus for Grafana visualization

---

## 🔗 Access URLs

| Service      | URL                                      | Credentials       |
|-------------|------------------------------------------|--------------------|
| Frontend    | `http://13.204.29.48:30080`              | —                  |
| Backend API | `http://13.204.29.48:30500/api/health`   | —                  |
| Jenkins     | `http://13.204.29.48:8080`               | admin / Vikas@21   |
| Prometheus  | `http://13.204.29.48:9090`               | —                  |
| Grafana     | `http://13.204.29.48:3001`               | admin / admin123   |

---

## 📁 Project Structure

```
codecanon/
├── src/                    # React frontend source
├── server/                 # Express.js backend
│   ├── src/
│   │   ├── config/         # Passport, DB config
│   │   ├── routes/         # API routes (auth, sync)
│   │   └── index.js        # Server entry point
│   ├── Dockerfile          # Backend container
│   └── .env                # Environment variables
├── extension/              # Chrome extension
├── k8s/                    # Kubernetes manifests
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   └── backend-secret.yaml
├── terraform/              # Infrastructure as Code
│   ├── main.tf             # EC2 + Security Group
│   ├── variables.tf        # Input variables
│   └── outputs.tf          # Output values
├── monitoring/
│   └── prometheus.yml      # Prometheus scrape config
├── Dockerfile              # Frontend container (multi-stage)
├── Jenkinsfile             # CI/CD pipeline definition
├── docker-compose.yml      # Local dev + monitoring stack
├── nginx.conf              # Nginx reverse proxy config
└── README.md               # This file
```

---

## 🚀 Setup Guide

### Prerequisites
- AWS Account with EC2 access
- Docker & Docker Compose
- Terraform CLI
- kubectl

### 1. Provision Infrastructure
```bash
cd terraform/
terraform init
terraform apply -auto-approve
```

### 2. Install K3s on EC2
```bash
ssh ubuntu@<EC2_IP>
curl -sfL https://get.k3s.io | sh -
```

### 3. Deploy Application
```bash
kubectl apply -f k8s/
```

### 4. Setup Jenkins
```bash
docker run -d --name jenkins \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts-jdk21
```

### 5. Setup Monitoring
```bash
# Prometheus
docker run -d --name prometheus --net host \
  -v ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus:latest

# Grafana
docker run -d --name grafana -p 3001:3000 \
  -e GF_SECURITY_ADMIN_PASSWORD=admin123 \
  grafana/grafana:latest
```

---

## 👨‍💻 Author

**Vikas Singh**  
Full-Stack Developer | DevOps Engineer

---

## 📄 License

This project is for educational and portfolio purposes.