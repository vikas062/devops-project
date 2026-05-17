import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, BorderStyle, WidthType,
  AlignmentType, ShadingType, PageBreak
} from "docx";
import { writeFileSync } from "fs";

const BLUE  = "1E3A5F";
const LBLUE = "2E86AB";
const GRAY  = "F2F2F2";
const GREEN = "27AE60";
const WHITE = "FFFFFF";

const h1 = (text) => new Paragraph({
  text, heading: HeadingLevel.HEADING_1,
  spacing: { before: 400, after: 200 },
  shading: { type: ShadingType.SOLID, color: BLUE, fill: BLUE },
  run: { color: WHITE, bold: true, size: 32 }
});

const h2 = (text) => new Paragraph({
  children: [new TextRun({ text, bold: true, size: 26, color: LBLUE })],
  spacing: { before: 300, after: 150 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: LBLUE } }
});

const h3 = (text) => new Paragraph({
  children: [new TextRun({ text, bold: true, size: 22, color: "333333" })],
  spacing: { before: 200, after: 100 }
});

const p = (text) => new Paragraph({
  children: [new TextRun({ text, size: 20 })],
  spacing: { before: 80, after: 80 }
});

const bullet = (text) => new Paragraph({
  children: [new TextRun({ text, size: 20 })],
  bullet: { level: 0 },
  spacing: { before: 60, after: 60 }
});

const code = (text) => new Paragraph({
  children: [new TextRun({ text, font: "Courier New", size: 18, color: "C0392B" })],
  shading: { type: ShadingType.SOLID, color: "F8F8F8", fill: "F8F8F8" },
  spacing: { before: 60, after: 60 },
  indent: { left: 400 }
});

const badge = (label, value, color = GREEN) => new Paragraph({
  children: [
    new TextRun({ text: `${label}: `, bold: true, size: 20 }),
    new TextRun({ text: value, size: 20, color: color, bold: true })
  ],
  spacing: { before: 60, after: 60 }
});

const tableRow = (cells, isHeader = false) => new TableRow({
  children: cells.map((text, i) => new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, bold: isHeader, size: 18, color: isHeader ? WHITE : "333333" })],
      alignment: AlignmentType.LEFT
    })],
    shading: isHeader ? { type: ShadingType.SOLID, color: BLUE, fill: BLUE }
                       : { type: ShadingType.SOLID, color: i % 2 === 0 ? WHITE : GRAY, fill: i % 2 === 0 ? WHITE : GRAY },
    margins: { top: 80, bottom: 80, left: 150, right: 150 }
  }))
});

const makeTable = (headers, rows) => new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [tableRow(headers, true), ...rows.map(r => tableRow(r))]
});

const divider = () => new Paragraph({
  border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" } },
  spacing: { before: 200, after: 200 }
});

const doc = new Document({
  sections: [{
    properties: {},
    children: [

      // ═══════════════════════════════════
      // COVER PAGE
      // ═══════════════════════════════════
      new Paragraph({
        children: [new TextRun({ text: "CodeCanon", bold: true, size: 72, color: BLUE })],
        alignment: AlignmentType.CENTER, spacing: { before: 1000, after: 200 }
      }),
      new Paragraph({
        children: [new TextRun({ text: "DevOps Implementation Documentation", size: 40, color: LBLUE })],
        alignment: AlignmentType.CENTER, spacing: { before: 200, after: 400 }
      }),
      new Paragraph({
        children: [new TextRun({ text: "Tools: Git • GitHub • GitHub Actions • Docker • AWS • Terraform • Jenkins • Prometheus • Grafana", size: 22, color: "666666" })],
        alignment: AlignmentType.CENTER, spacing: { before: 200, after: 600 }
      }),
      makeTable(
        ["Project", "Author", "Date", "Version"],
        [["CodeCanon — CP Tracker", "Vikas Singh", "May 2026", "v1.0"]]
      ),
      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════
      // TABLE OF CONTENTS
      // ═══════════════════════════════════
      h1("📋 Table of Contents"),
      makeTable(
        ["#", "Tool", "Purpose", "Status"],
        [
          ["1", "Git & GitHub",      "Version Control & Remote Repository", "✅ Done"],
          ["2", "Docker",            "Containerization of App",              "✅ Done"],
          ["3", "GitHub Actions",    "CI Pipeline (Auto Build & Push)",      "✅ Done"],
          ["4", "Terraform",         "Infrastructure as Code (AWS EC2)",     "⏳ Next"],
          ["5", "AWS EC2",           "Cloud Server Deployment",              "⏳ Next"],
          ["6", "Jenkins",           "CD Pipeline (Auto Deploy)",            "⏳ Next"],
          ["7", "Prometheus",        "Metrics Collection",                   "✅ Done"],
          ["8", "Grafana",           "Monitoring Dashboard",                 "✅ Done"],
        ]
      ),
      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════
      // SECTION 1 — PROJECT OVERVIEW
      // ═══════════════════════════════════
      h1("1. Project Overview"),
      h2("1.1 About CodeCanon"),
      p("CodeCanon is a full-stack competitive programming tracker that automatically syncs solved problems from platforms like LeetCode, GeeksForGeeks, Codeforces, CodeChef, HackerRank, AtCoder, and SPOJ to a unified dashboard."),
      h2("1.2 Tech Stack"),
      makeTable(
        ["Layer", "Technology", "Purpose"],
        [
          ["Frontend",   "React + Vite + TailwindCSS", "User dashboard & UI"],
          ["Backend",    "Node.js + Express + MongoDB", "REST API & data storage"],
          ["Extension",  "Chrome Extension (Vanilla JS)", "Platform submission detection"],
          ["Database",   "MongoDB Atlas",               "Cloud database"],
          ["Deployment", "Vercel (frontend) + Render (backend)", "Production hosting"],
        ]
      ),
      h2("1.3 Project Structure"),
      code("extension-main/"),
      code("  ├── src/           ← React Frontend"),
      code("  ├── server/        ← Express Backend"),
      code("  ├── extension/     ← Chrome Extension"),
      code("  ├── terraform/     ← AWS Infrastructure"),
      code("  ├── monitoring/    ← Prometheus Config"),
      code("  ├── .github/       ← GitHub Actions CI"),
      code("  ├── Dockerfile     ← Frontend Docker image"),
      code("  ├── docker-compose.yml"),
      code("  └── Jenkinsfile    ← Jenkins CD Pipeline"),
      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════
      // SECTION 2 — GIT & GITHUB
      // ═══════════════════════════════════
      h1("2. Git & GitHub — Version Control"),
      h2("2.1 Purpose"),
      p("Git tracks every change to the codebase. GitHub hosts the remote repository and enables collaboration, pull requests, and CI/CD triggers."),
      h2("2.2 What Was Done"),
      bullet("Initialized Git repository with proper .gitignore"),
      bullet("Set up remote repository on GitHub"),
      bullet("Added DevOps files: Dockerfile, docker-compose.yml, Jenkinsfile, terraform/"),
      bullet("Committed all changes with descriptive messages"),
      h2("2.3 Key Files Added to Repository"),
      makeTable(
        ["File", "Purpose"],
        [
          ["Dockerfile",          "Frontend Docker build instructions"],
          ["server/Dockerfile",   "Backend Docker build instructions"],
          ["docker-compose.yml",  "Runs all 4 services together"],
          [".github/workflows/ci.yml", "GitHub Actions CI pipeline"],
          ["Jenkinsfile",         "Jenkins CD pipeline"],
          ["terraform/main.tf",   "AWS EC2 infrastructure code"],
          ["monitoring/prometheus.yml", "Prometheus scrape config"],
        ]
      ),
      h2("2.4 Commands Used"),
      code("git init"),
      code("git add ."),
      code('git commit -m "feat: add complete DevOps infrastructure"'),
      code("git remote add origin https://github.com/<username>/codecanon.git"),
      code("git push -u origin main"),
      divider(),
      new Paragraph({
        children: [new TextRun({ text: "📸 [Screenshot: GitHub repository showing all DevOps files]", italics: true, color: "888888", size: 18 })],
        spacing: { before: 100, after: 100 }
      }),
      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════
      // SECTION 3 — DOCKER
      // ═══════════════════════════════════
      h1("3. Docker — Containerization"),
      h2("3.1 Purpose"),
      p("Docker packages the application into containers — ensuring it runs identically on any machine (local, EC2, cloud). We created 2 custom Docker images and use 2 official images."),
      h2("3.2 Images Created"),
      makeTable(
        ["Image Name", "Base Image", "Port", "Size", "Type"],
        [
          ["extension-main-backend",  "node:20-alpine",  "5000", "610 MB", "Custom built"],
          ["extension-main-frontend", "nginx:alpine",    "80",   "95.5 MB","Custom built (multi-stage)"],
          ["prom/prometheus",         "Official",        "9090", "578 MB", "Pulled from DockerHub"],
          ["grafana/grafana",         "Official",        "3001", "1.46 GB","Pulled from DockerHub"],
        ]
      ),
      h2("3.3 Dockerfile — Backend (server/Dockerfile)"),
      p("Uses Node.js 20 Alpine for minimal size. Skips Puppeteer Chromium download to speed up build."),
      code("FROM node:20-alpine"),
      code("WORKDIR /app"),
      code("ENV PUPPETEER_SKIP_DOWNLOAD=true"),
      code("COPY package.json ./"),
      code("RUN npm install --omit=dev"),
      code("COPY . ."),
      code("EXPOSE 5000"),
      code('CMD ["node", "src/index.js"]'),
      h2("3.4 Dockerfile — Frontend (Multi-Stage Build)"),
      p("Stage 1: Node.js builds React app. Stage 2: Nginx serves the built files. Result: tiny 95.5 MB image."),
      code("FROM node:18-alpine AS build"),
      code("WORKDIR /app"),
      code("COPY package.json package-lock.json ./"),
      code("RUN npm ci && npm run build"),
      code("FROM nginx:alpine"),
      code("COPY --from=build /app/dist /usr/share/nginx/html"),
      code("COPY nginx.conf /etc/nginx/conf.d/default.conf"),
      code("EXPOSE 80"),
      h2("3.5 Docker Compose — All 4 Services"),
      code("docker-compose up --build -d"),
      h2("3.6 Running Containers — Verified"),
      makeTable(
        ["Container Name", "Image", "Port", "Health Status"],
        [
          ["codecanon-backend",    "extension-main-backend",  "5000", "✅ Up (healthy)"],
          ["codecanon-frontend",   "extension-main-frontend", "80",   "✅ Up"],
          ["codecanon-prometheus", "prom/prometheus",          "9090", "✅ Up"],
          ["codecanon-grafana",    "grafana/grafana",          "3001", "✅ Up"],
        ]
      ),
      h2("3.7 Health Check Results"),
      badge("Backend API",  "http://localhost:5000/api/health → {status: ok}", GREEN),
      badge("Frontend",     "http://localhost:80 → 200 OK", GREEN),
      badge("Prometheus",   "http://localhost:9090 → 200 OK", GREEN),
      badge("Grafana",      "http://localhost:3001 → 200 OK", GREEN),
      divider(),
      new Paragraph({
        children: [new TextRun({ text: "📸 [Screenshot: docker ps showing 4 running containers]", italics: true, color: "888888", size: 18 })],
      }),
      new Paragraph({
        children: [new TextRun({ text: "📸 [Screenshot: Docker Desktop showing all containers running]", italics: true, color: "888888", size: 18 })],
      }),
      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════
      // SECTION 4 — PROMETHEUS
      // ═══════════════════════════════════
      h1("4. Prometheus — Metrics Collection"),
      h2("4.1 Purpose"),
      p("Prometheus scrapes metrics from the CodeCanon backend every 15 seconds and stores time-series data for monitoring."),
      h2("4.2 What Was Implemented"),
      bullet("Added prom-client package to backend"),
      bullet("Created /api/metrics endpoint in server/src/index.js"),
      bullet("Custom counter: codecanon_http_requests_total (tracks per route, method, status)"),
      bullet("Default Node.js metrics: memory, CPU, event loop lag"),
      h2("4.3 Backend Metrics Endpoint Added"),
      code("import client from 'prom-client';"),
      code("const register = new client.Registry();"),
      code("client.collectDefaultMetrics({ register });"),
      code("app.get('/api/metrics', async (_req, res) => {"),
      code("  res.setHeader('Content-Type', register.contentType);"),
      code("  res.send(await register.metrics());"),
      code("});"),
      h2("4.4 Prometheus Config (monitoring/prometheus.yml)"),
      code("scrape_interval: 15s"),
      code("job_name: 'codecanon-backend'"),
      code("targets: ['backend:5000']"),
      code("metrics_path: '/api/metrics'"),
      h2("4.5 Verified"),
      badge("Metrics Endpoint", "http://localhost:5000/api/metrics → 8662 bytes of metrics data", GREEN),
      badge("Prometheus UI", "http://localhost:9090 → Targets: codecanon-backend UP", GREEN),
      divider(),
      new Paragraph({
        children: [new TextRun({ text: "📸 [Screenshot: Prometheus UI at :9090 showing targets as UP]", italics: true, color: "888888", size: 18 })],
      }),
      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════
      // SECTION 5 — GRAFANA
      // ═══════════════════════════════════
      h1("5. Grafana — Monitoring Dashboard"),
      h2("5.1 Purpose"),
      p("Grafana provides beautiful visual dashboards connected to Prometheus, showing real-time graphs of API requests, memory usage, and more."),
      h2("5.2 Access Details"),
      makeTable(
        ["Property", "Value"],
        [
          ["URL",      "http://localhost:3001"],
          ["Username", "admin"],
          ["Password", "admin123"],
          ["Data Source", "Prometheus at http://prometheus:9090"],
        ]
      ),
      h2("5.3 Setup Steps"),
      bullet("1. Open http://localhost:3001 → Login with admin/admin123"),
      bullet("2. Go to Configuration → Data Sources → Add Prometheus"),
      bullet("3. URL: http://prometheus:9090 → Save & Test"),
      bullet("4. Create Dashboard → Add Panel"),
      bullet('5. Query: codecanon_http_requests_total → Visualization: Time series'),
      divider(),
      new Paragraph({
        children: [new TextRun({ text: "📸 [Screenshot: Grafana dashboard with Prometheus data source connected]", italics: true, color: "888888", size: 18 })],
      }),
      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════
      // SECTION 6 — GITHUB ACTIONS
      // ═══════════════════════════════════
      h1("6. GitHub Actions — CI Pipeline"),
      h2("6.1 Purpose"),
      p("GitHub Actions automatically runs on every push to main branch. It builds the frontend and pushes Docker images to DockerHub."),
      h2("6.2 Pipeline File"),
      badge("Location", ".github/workflows/ci.yml"),
      h2("6.3 Pipeline Jobs"),
      makeTable(
        ["Job", "Trigger", "Steps"],
        [
          ["lint-and-build", "Every push/PR to main", "npm ci → npm run build"],
          ["docker-build-push", "Only on main branch push (after job 1)", "Login DockerHub → Build backend image → Build frontend image → Push both"],
        ]
      ),
      h2("6.4 Required GitHub Secrets"),
      makeTable(
        ["Secret Name", "Value"],
        [
          ["DOCKER_USERNAME", "Your DockerHub username"],
          ["DOCKER_PASSWORD", "Your DockerHub password or access token"],
          ["VITE_API_URL",    "Your backend API URL"],
        ]
      ),
      divider(),
      new Paragraph({
        children: [new TextRun({ text: "📸 [Screenshot: GitHub Actions tab showing green CI pipeline]", italics: true, color: "888888", size: 18 })],
      }),
      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════
      // SECTION 7 — TERRAFORM
      // ═══════════════════════════════════
      h1("7. Terraform — Infrastructure as Code"),
      h2("7.1 Purpose"),
      p("Terraform provisions AWS infrastructure automatically using code. One command creates EC2 instance, security groups, and all networking."),
      h2("7.2 Files Created"),
      makeTable(
        ["File", "Purpose"],
        [
          ["terraform/main.tf",      "EC2 instance + Security Group definition"],
          ["terraform/variables.tf", "Input variables (region, AMI, key pair)"],
          ["terraform/outputs.tf",   "Output values (IP, URLs, SSH command)"],
        ]
      ),
      h2("7.3 AWS Resources Provisioned"),
      makeTable(
        ["Resource", "Details"],
        [
          ["EC2 Instance",    "t2.micro, Ubuntu 22.04, Mumbai (ap-south-1)"],
          ["Security Group",  "Ports: 22 (SSH), 80 (HTTP), 5000 (API), 9090 (Prometheus), 3001 (Grafana)"],
          ["User Data Script","Auto-installs Docker + Docker Compose on first boot"],
        ]
      ),
      h2("7.4 Commands"),
      code("cd terraform"),
      code("terraform init"),
      code("terraform plan -var='key_pair_name=your-key'"),
      code("terraform apply -var='key_pair_name=your-key'"),
      code("# Output: ec2_public_ip, app_url, grafana_url, ssh_command"),
      divider(),
      new Paragraph({
        children: [new TextRun({ text: "📸 [Screenshot: terraform apply output showing created resources]", italics: true, color: "888888", size: 18 })],
      }),
      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════
      // SECTION 8 — JENKINS
      // ═══════════════════════════════════
      h1("8. Jenkins — CD Pipeline"),
      h2("8.1 Purpose"),
      p("Jenkins handles Continuous Deployment — it pulls the latest Docker images built by GitHub Actions and deploys them on AWS EC2 using docker-compose."),
      h2("8.2 Pipeline Stages"),
      makeTable(
        ["Stage", "Action"],
        [
          ["1. Pull Latest Images", "docker pull codecanon-backend:latest + frontend:latest"],
          ["2. Stop Old Containers", "docker-compose down --remove-orphans"],
          ["3. Deploy",             "docker-compose up -d"],
          ["4. Health Check",       "curl http://localhost:5000/api/health → must return 200"],
          ["Post Failure",          "Auto rollback: docker-compose down"],
        ]
      ),
      h2("8.3 Jenkinsfile Location"),
      badge("File", "Jenkinsfile (at project root)"),
      divider(),
      new Paragraph({
        children: [new TextRun({ text: "📸 [Screenshot: Jenkins pipeline stages view]", italics: true, color: "888888", size: 18 })],
      }),
      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════
      // SECTION 9 — CREDENTIALS SUMMARY
      // ═══════════════════════════════════
      h1("9. Credentials & Access Summary"),
      makeTable(
        ["Tool", "Credential Needed", "Where to Get"],
        [
          ["GitHub",    "Account login",                    "github.com"],
          ["DockerHub", "Username + Password/Access Token", "hub.docker.com → Account Settings → Security"],
          ["AWS",       "Access Key ID + Secret Access Key","AWS Console → IAM → Users → Security credentials"],
          ["AWS",       "EC2 Key Pair (.pem file)",         "AWS Console → EC2 → Key Pairs → Create"],
          ["Grafana",   "admin / admin123",                 "Pre-configured in docker-compose.yml"],
          ["Jenkins",   "Initial admin password",           "sudo cat /var/lib/jenkins/secrets/initialAdminPassword"],
        ]
      ),
      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════
      // SECTION 10 — ARCHITECTURE
      // ═══════════════════════════════════
      h1("10. Full Architecture Diagram"),
      code("Developer (Local Machine)"),
      code("    │  git push"),
      code("    ▼"),
      code("GitHub Repo (github.com/user/codecanon)"),
      code("    │  Triggers automatically"),
      code("    ▼"),
      code("GitHub Actions CI"),
      code("  • Build frontend (npm run build)"),
      code("  • Build Docker images"),
      code("  • Push to DockerHub"),
      code("    │  Manually trigger"),
      code("    ▼"),
      code("Jenkins CD"),
      code("  • Pull latest Docker images"),
      code("  • Deploy via docker-compose"),
      code("    │  SSH + docker-compose up"),
      code("    ▼"),
      code("AWS EC2 (provisioned by Terraform)"),
      code("  ┌─────────────┐  ┌──────────────┐"),
      code("  │  Frontend   │  │   Backend    │"),
      code("  │  Nginx:80   │  │  Node:5000   │"),
      code("  └─────────────┘  └──────┬───────┘"),
      code("                          │ /api/metrics"),
      code("                    ┌─────▼───────┐"),
      code("                    │ Prometheus  │"),
      code("                    │   :9090     │"),
      code("                    └─────┬───────┘"),
      code("                    ┌─────▼───────┐"),
      code("                    │  Grafana    │"),
      code("                    │   :3001     │"),
      code("                    └─────────────┘"),

      divider(),
      new Paragraph({
        children: [new TextRun({ text: "Document End — CodeCanon DevOps Implementation | May 2026", italics: true, color: "888888", size: 18 })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 }
      }),
    ]
  }]
});

const buffer = await Packer.toBuffer(doc);
writeFileSync("CodeCanon_DevOps_Documentation.docx", buffer);
console.log("✅ Word document created: CodeCanon_DevOps_Documentation.docx");
