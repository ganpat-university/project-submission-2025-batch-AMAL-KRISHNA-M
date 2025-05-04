# 📊 Sentiment Analysis Dashboard

An interactive Angular-based web application that visualizes sentiment analysis on product reviews. It integrates a FastAPI backend (deployed on Google Cloud Run) and automatically deploys the frontend to Firebase Hosting using GitHub Actions.

![CI/CD](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/actions/workflows/firebase-deploy.yml/badge.svg)

---

## 🔧 Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Make sure to configure:
   - Your **Firebase settings** in `angular.json` or Firebase CLI
   - Your **FastAPI backend URL** in `src/environments/environment.ts`

---

## 🚀 Live Deployment

- **Frontend**: Hosted on [Firebase Hosting](https://firebase.google.com/)
- **Backend**: FastAPI deployed on [Google Cloud Run](https://cloud.google.com/run)

---

## 🧪 DevOps & CI/CD Pipeline

This project is fully automated using **GitHub Actions**, covering:

- CI: On every push to `main` branch
  - Install dependencies
  - Build Angular app
- CD: Deploys the built Angular app to Firebase Hosting

GitHub Actions Workflow file:  
`.github/workflows/firebase-deploy.yml`

> CI tests are currently skipped due to known issues. Can be re-enabled when fixed.

---

## 🏗️ Development

### Start Local Dev Server

Start the application as shown below so that the firebase authentication API could work properly.

```bash
ng serve --host 127.0.0.1
```
Then open: [http://127.0.0.1:4200](http://127.0.0.1:4200)

The app will auto-reload on source file changes.

---

### Code Generation (Scaffolding)

Use Angular CLI to generate components, services, and more:

```bash
ng generate component my-new-component
```

---

## 🛠️ Build for Production

```bash
ng build --configuration=production
```

The build output will be in the `dist/` folder.

---

## ❌ Tests (Currently Disabled)

Although you can run:

```bash
ng test
```

> Unit tests are currently disabled in the GitHub Actions pipeline due to build issues. We recommend fixing test configurations if needed for production-level stability.

---

## 🔄 Backend API

The backend is built using **FastAPI**, hosted on **Google Cloud Run**, and provides:

- `/stats`: Sentiment distribution and average ratings
- `/reviews`: List of analyzed reviews

Make sure your `environment.ts` file includes the correct `API_BASE_URL`.

---

### ✅ Delivery Scope

- Fully functional Angular dashboard  
- Backend deployed and scalable  
- Word cloud, sentiment analysis, and charts implemented  
- Documentation and README provided  


---

## 📚 Resources

- [Angular CLI Documentation](https://angular.io/cli)
- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Google Cloud Run](https://cloud.google.com/run)

---

## 📞 Contact

> For any queries, issues, or collaboration ideas — reach out to the team or open an issue.
