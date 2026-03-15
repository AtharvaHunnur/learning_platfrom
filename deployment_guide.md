# Deployment Guide — LMSPro

To fix the "no connection" issue, you need to deploy the backend separately and link it to your frontend.

## Step 1: Deploy the Backend to Vercel

1. Go to your **Vercel Dashboard**.
2. Click **Add New** > **Project**.
3. Import your `learning_platfrom` repository.
4. In the **Configure Project** step:
   - **Project Name:** `lms-backend` (or anything you prefer).
   - **Root Directory:** Set this to `backend`.
   - **Framework Preset:** Select `Other` (it will use the `vercel.json` inside the directory).
5. Open **Environment Variables** and add the following from your `backend/.env`:
   - `DATABASE_URL`: (Copy the full string from your .env)
   - `JWT_SECRET`: (Your secret key)
   - `HF_TOKEN`: (Your Hugging Face token)
6. Click **Deploy**.

## Step 2: Configure the Frontend

Once the backend is deployed, you will get a URL (e.g., `https://lms-backend.vercel.app`).

1. Go to your **Frontend** project in the Vercel Dashboard.
2. Go to **Settings** > **Environment Variables**.
3. Add a new variable:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://your-backend-url.vercel.app/api` (Make sure to include `/api` at the end).
4. Go to the **Deployments** tab and **Redeploy** the latest version so it picks up the new variable.

## Step 3: Verify

1. Visit `https://your-backend-url.vercel.app/health`. You should see `{"status":"ok",...}`.
2. Visit your frontend URL and try to login or register.
