# Secure Electric Reports

Role:
You are a senior full-stack software architect and electrical compliance expert with deep knowledge of IEC standards, cybersecurity best practices, and enterprise-grade web applications.

📌 OBJECTIVE

Design and implement a web-based application for:

Raportare și generare buletine de verificare prize de pământ

Rapoarte de verificare instalații electrice noi și existente

Verificări sisteme fotovoltaice

Conform standardelor IEC aplicabile în România

The application must be secure, scalable, and compliant.

📚 STANDARDS & REGULATIONS

Ensure alignment with:

IEC 60364 (Low Voltage Electrical Installations)

IEC 61557 (Testing, measuring, monitoring devices)

IEC 62446 (PV system documentation & commissioning)

SR HD 60364 (Romanian adopted standards)

GDPR (EU data protection)

🧱 SYSTEM ARCHITECTURE
🔹 Backend

Technology: Node.js (NestJS) or Python (FastAPI)

Architecture: REST API (clean architecture)

Auth: JWT + role-based access (Admin / Engineer / Viewer)

Security:

Password hashing (bcrypt / argon2)

HTTPS enforcement

Input validation & sanitization

Rate limiting

Audit logs for reports

Features:

Project management (client, location, installation type)

Measurement data input (manual & future device integration)

Automatic compliance validation against IEC limits

PDF report generation with digital signature support

Versioning of reports

Report status (draft / validated / signed / archived)

🔹 Frontend

Technology: React + TypeScript (Next.js preferred)

UI Framework: Material UI or Ant Design

Features:

Secure login & role-based UI

Wizard-based inspection workflow

Dynamic forms based on installation type:

Prize de pământ

Instalații electrice LV

Sisteme fotovoltaice

Automatic pass/fail indicators (IEC thresholds)

Report preview (PDF)

Dashboard (projects, reports, compliance status)

🔹 Database

Type: PostgreSQL

Schema must include:

Users & roles

Companies & engineers (ANRE ready)

Clients & sites

Installation details

Measurements (time-stamped)

Reports (metadata + file references)

Audit logs

Requirements:

Encrypted sensitive fields

Proper indexing

Soft deletes

📄 REPORT TYPES (TEMPLATES)

Implement structured templates for:

1️⃣ Buletin verificare priză de pământ

Tip priză

Metodă de măsurare

Rezistență măsurată

Limită normativă

Verdict conform / neconform

2️⃣ Raport verificare instalație electrică

Continuitate PE

Rezistență izolație

Impedanță buclă

Protecții (RCD)

Observații & recomandări

3️⃣ Raport verificare sistem fotovoltaic

Configurație stringuri

Continuitate echipotențială

Polaritate

Izolație DC

Conform IEC 62446

🔐 SECURITY REQUIREMENTS (MINIMUM)

OWASP Top 10 protection

CSRF & XSS protection

Encrypted backups

Role-based data access

Activity logging

Secure file storage (PDFs)

📦 DELIVERABLES

Generate:

Full backend codebase

Frontend application

Database schema & migrations

Sample PDF reports

API documentation (OpenAPI)

README with deployment instructions (Docker ready)

🚀 OPTIONAL (FUTURE-READY)

Multi-language support (RO / EN)

Offline mode (PWA)

Integration with measurement devices (Metrel, Fluke, Sonel)

ANRE-ready export

Cloud storage (S3 compatible)

⚠️ IMPORTANT

Code must be:

Modular

Clean

Well-documented

Production-grade

END OF PROMPT

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://inspect-align-pro.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/07ec3c66-2fc1-4f3c-9420-ac857b53b525).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
