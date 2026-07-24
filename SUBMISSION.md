# 🩺 Web Inspectra - Project Submission

## 🌟 Tagline
AI-powered website diagnostic engine

## 🔗 Project Links
**Website**: [https://web-inspectra-frontend-main.vercel.app/](https://web-inspectra-frontend-main.vercel.app/)

## 👥 Builders
- Smit Patil
- Aryan Nakade
- Aditya Chafale
- Ayush Ingole
- Vedant Khetre
- Atharva Trinagariwar

---

## 💡 The Problem It Solves

**Web Inspectra** is built for developers, founders, students, and anyone who owns a website. Traditional tools like Lighthouse and Chrome DevTools provide a lot of performance metrics, but understanding what those numbers actually mean—and deciding what to fix first—can be overwhelming.

Web Inspectra makes website analysis simple by treating every website like a patient receiving a health checkup.

With just a public URL, you can:

* Get a complete website health report in seconds.
* Analyze Core Web Vitals such as **LCP, FCP, CLS, and TTI**, along with security headers, accessibility (WCAG), DOM complexity, and network performance—all from a single dashboard.
* Receive AI-powered explanations from our **Chief Medical Officer** (powered by Gemini), which translates technical metrics into clear, easy-to-understand insights and prioritizes issues based on their real-world impact.
* Explore your website's structure using the **Interactive DOM Anatomy Explorer**, making it easy to identify unnecessary complexity and optimize your page.
* Enjoy fast scan times without requiring heavy browser automation. Web Inspectra uses a lightweight HTTP and HTML parsing engine built with **Axios** and **Cheerio**, allowing reports to be generated in just a few seconds.

Whether you're auditing a client's website, learning about web performance, or checking the health of your own landing page, Web Inspectra helps you understand what's working, what needs attention, and how to improve it—all through a clear, human-friendly report instead of a confusing list of technical metrics.

---

## 🧗 Challenges We Ran Into

1. **Accurate Core Web Vitals without a real browser** — since we deliberately avoided Playwright/Puppeteer, we had to derive LCP, FCP, and CLS approximations from HTML structure and resource sizes, which required careful heuristic calibration.
2. **DOM graph rendering at scale** — rendering large DOM trees as an interactive SVG (drag-to-pan, scroll-to-zoom) in React without crashing the browser tab was a significant challenge. We had to implement virtualization and limit rendered subtrees dynamically.
3. **AI prompt engineering** — getting Gemini to return consistent, structured prioritized recommendations (not just a wall of text) required many iterations of system prompt design and output parsing.
4. **Monorepo type safety** — keeping the shared TypeScript contract (`ScanReport`, `DOMNode` interfaces) in sync across frontend, backend, and shared-types in a pnpm workspace without breaking hot-reload took careful configuration of TypeScript project references.
5. **Security header detection** — accurately detecting missing/misconfigured HTTP security headers (CSP, HSTS, X-Frame-Options) across different server configurations required handling many edge cases and non-standard formats.

---

## 🛠️ Technologies Used
- Node.js
- Express.js
- TypeScript
- JavaScript
- React.js
- Vite
- Tailwind CSS
- CSS
- pnpm
- Google Gemini API
