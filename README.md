🌍 AI-Driven Applicant Selection Tool
📌 Overview

This project was built for the Hackathon Challenge: AI-Driven Applicant Selection Tool.
It demonstrates how applicant data can be processed, ranked, and recommended for LSETF/PLP programs.

The prototype includes:

Landing Page (index.html) – Intro and navigation.

Applicant Dashboard (dashboard.html) – Run applicant analysis and unlock premium runs via Paystack/Flutterwave.

Integration Demo (iot.html) – Shows readiness for future connection with LSETF’s LMS upskilling platform.

🚀 Features

✅ Data Analysis – Simulated scoring of applicants.
✅ Candidate Ranking – Clear logic for ranking applicants.
✅ Recommendations – Produces free analysis (2 runs).
✅ Payments – Unlocks more runs using Paystack or Flutterwave APIs.
✅ Integration Readiness – Demonstrates future LMS data export.
✅ Multiple Pages – Clean separation (Landing, Dashboard, LMS demo).

📂 File Structure
/project-root
 ├── index.html        → Landing Page
 ├── dashboard.html    → Applicant Dashboard
 ├── iot.html          → LMS Integration Demo
 ├── style.css         → Shared styling
 └── app.js            → Shared JavaScript (ranking + payments)

⚙️ How It Works

Open index.html → Click Get Started.

On dashboard.html → Run applicant analysis.

First 2 runs are free.

After that, the user must pay to continue.

Payment options:

Paystack – Inline checkout.

Flutterwave – Inline checkout.

On iot.html → View demo of LMS integration readiness.

💳 Payment Integration

Replace the test keys in app.js with your real public keys:

key: 'pk_live_xxxxxxxxx'      // Paystack
public_key: 'FLWPUBK_LIVE-xx' // Flutterwave


Both APIs run in test mode by default. Switch to live mode when deploying.

📸 Demo Screens

Landing Page – Intro to the tool.

Dashboard – Run free analyses, unlock more with payment.

Integration Page – LMS readiness.

📑 Submission Requirements Covered

Functional Prototype – Multiple pages with applicant scoring + payments.

Pitch Deck – Provided separately (pitch_deck.md).

Technical Documentation – Provided separately (technical_doc.md).

Demo/Presentation – Tool can be opened in any browser.

🔮 Future Improvements

Resume/CV upload with AI-powered NLP scoring.

Real-time candidate ranking dashboard.

Secure backend API for payment verification.

Full LMS API integration.

👨‍💻 Built for the Hackathon Challenge by Happy Igho Umukoro
