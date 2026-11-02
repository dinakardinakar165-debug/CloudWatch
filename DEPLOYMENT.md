# CloudWatch Sentinel — Cloud & Production Deployment Guide

**Institution**: Kumaraguru College of Technology  
**Department**: Computer Science and Engineering  
**Course**: Cloud Application and Development  
**Student Team**: Dinakar S (24BCS405), Kabileshwara Y (24BCS411), Pranesh Sachin M (24BCS415), Santhosh TMA (24BCS247), Nikhil R (24BCS190)

---

## 1. Hosting Architecture

CloudWatch Sentinel is designed for seamless, multi-cloud or hybrid deployment:
1. **Frontend**: High-speed static web app built with React 19, TypeScript, and Vite. Deployed to any global CDN (Render Static Site, AWS S3 + CloudFront, Vercel, Netlify).
2. **Backend**: Lightweight, asynchronous FastAPI microservice. Deployed to Render Web Service, AWS App Runner, ECS Fargate, or Docker.
3. **Database**: Supabase Managed PostgreSQL 16 with Row Level Security and Realtime WebSockets.

---

## 2. Deploying to Render via Blueprint (`render.yaml`)

The repository includes a ready-to-deploy Infrastructure-as-Code Blueprint (`render.yaml`).

### Steps to Deploy:
1. Push your repository to GitHub or GitLab.
2. In the [Render Dashboard](https://dashboard.render.com), click **New** -> **Blueprint**.
3. Select the repository. Render automatically reads `render.yaml` and sets up both services:
   - `cloudwatch-sentinel-frontend` (Static Site)
   - `cloudwatch-sentinel-backend` (Python Web Service)
4. Set required secret environment variables on the backend service:
   - `SUPABASE_URL`: Your Supabase Project URL
   - `SUPABASE_ANON_KEY`: Your Supabase Anonymous Key
5. Click **Apply**. Render will automatically build the React bundle (`npm run build`) and launch the Uvicorn web service.

---

## 3. Local Development & Testing

```bash
# Frontend
npm install
npm run dev        # Starts Vite dev server on http://localhost:3000
npm run lint       # TypeScript validation (tsc --noEmit)
npm test           # Executes the 33-step Privacy & Security verification suite
npm run build      # Produces optimized production bundle in /dist

# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Local In-VPC Collector
cd collector
pip install boto3 requests
python sentinel_collector.py --dry-run
```

---

## 4. Health Checks & Monitoring

- **Backend Health Check**:
  ```http
  GET /health
  ```
  Response:
  ```json
  {
    "status": "healthy",
    "service": "CloudWatch Sentinel Ingestion API",
    "version": "2.4.0",
    "timestamp": "2026-11-02T16:00:00Z"
  }
  ```
