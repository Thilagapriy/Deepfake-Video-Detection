# Deepfake Detection Platform: Master Deployment Guide

Deploying a complex Full-Stack Python & React application is completely free and manageable using the right services! 

We need to launch the **Backend (Python)** onto a virtual server that constantly runs `uvicorn`, and we need to launch the **Frontend (React)** onto a static web host that serves the compiled UI to visitors!

---

## Part 1: Storing the Code on GitHub Ensure 
You must push your project to a GitHub repository so these cloud systems can read it.
1. Create a Github account.
2. In your main `d:\projects\DPVD` folder, run:
   ```bash
   git init
   git add .
   git commit -m "Ready for production"
   git branch -M main
   # Follow Github's instructions to link and push to your new repo!
   ```

---

## Part 1.5: Hosting the Massive AI Model on Google Drive
Because GitHub blocks files over 100 MB, you should NOT upload your `SOTA_TITAN_FINAL_WEIGHTS.pth` file via Git.

1. Create a folder in your Google Drive and upload your `SOTA_TITAN_FINAL_WEIGHTS.pth` model there.
2. Right-click the file -> **Share** -> **Anyone with the link**.
3. Copy the link. It should look like this: `https://drive.google.com/file/d/1A2b.../view?usp=sharing`.
4. Copy exactly the massive string of random letters and numbers in the middle (e.g., `1A2b...`). This is your **File ID**.
5. When writing your final Python backend script (`main.py`), use the `gdown` library to securely download your model File ID on startup if the model file is missing natively. Add `gdown` to your `requirements.txt` file before pushing!

---

## Part 2: Deploying the Backend (Render.com)

**Render** is widely regarded as the easiest place to host a FastAPI python backend.

1. Go to [Render](https://render.com/) and register with your GitHub.
2. Click **New +** and select **Web Service**.
3. Connect the GitHub Repo you just created.
4. **Configuration Settings**:
   - **Name**: `deepfake-detection-backend`
   - **Root Directory**: `backend` *(SUPER IMPORTANT!)*
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. **Environment Variables**: Head down to "Advanced" -> "Environment Variables" and securely paste all your `.env` contents here:
   - `DATABASE_URL` = Your Supabase Full URL
   - `SMTP_EMAIL` = TrueVisionDeepfake@gmail.com
   - `SMTP_PASSWORD` = oorqhjavhvibxiec
   - `SECRET_KEY` = yoursupersecretkey
6. Hit **Deploy!** It will take a few minutes for Render to install PyTorch and OpenCV. Once done, Render gives you a live URL (like `https://deepfake-backend-123.onrender.com`). COPY THIS URL.

---

## Part 3: Deploying the Frontend (Vercel.com)

**Vercel** is the company behind Next.js/Vite and offers lightning-fast, global hosting for React apps.

1. Go to [Vercel](https://vercel.com/) and register with GitHub.
2. Click **Add New** -> **Project**.
3. Import your GitHub Repo.
4. **Configuration Settings**:
   - **Framework Preset**: Vercel should automatically detect `Vite`.
   - **Root Directory**: Click "Edit" and change this specifically to `frontend`.
5. **Environment Variables**: 
   - Name: `VITE_API_URL`
   - Value: Paste the absolute backend URL you just copied from Render! (e.g. `https://deepfake-backend-123.onrender.com`. Do NOT put a `/` slash at the very end!).
6. Click **Deploy!**

You are totally done! Vercel will output an incredibly fast, secure public website URL for you. When users visit your site, the React buttons will communicate across the internet to your Render python server, which will talk to Supabase and Gmail completely flawlessly!
