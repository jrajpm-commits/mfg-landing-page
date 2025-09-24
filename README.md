# Manufacturing Digital Transformation Landing Page

This project is a modern, single-page landing page for a manufacturing digital transformation service, built with a futuristic "cyberpunk" aesthetic. It also includes an interactive **Application Portfolio Intelligence Dashboard** to demonstrate portfolio rationalization capabilities.

## Features

### Landing Page (`index.html`)
- **Futuristic Design:** A consistent theme using a dark color palette, neon highlights, and modern typography.
- **Responsive Layout:** Adapts to various screen sizes from desktop to mobile.
- **Engaging Animations:** Subtle animations on cards and buttons to improve user experience.
- **Component Sections:** Includes sections for Hero, Technologies, Solutions, Automation, and Contact.

### Portfolio Rationalization Tool (`portfolio-rationalization.html`)
- **Interactive Dashboard:** A tool for assessing and visualizing an application portfolio.
- **Quadrant View:** Plots applications on a 2x2 matrix (Invest, Retain, Modernize, Retire) based on business value and technical health.
- **Dynamic Charts:** Includes donut and bar charts for portfolio distribution and analysis.
-**Data Persistence:** Uses the browser's local storage to save assessment data.
- **Theming:** Includes a "cyberpunk" theme to match the main landing page.

## Getting Started

This is a static website built with HTML, CSS, and vanilla JavaScript. No build process is required.

To run the project locally, simply open the `index.html` file in your web browser.

> **Note:** Some browser security policies may restrict JavaScript functionality (like fetching JSON files) when opening files directly from the local filesystem. For the best experience, it's recommended to use a simple local web server.

A popular and easy way to do this is with the Live Server extension for Visual Studio Code.

## Deployment

This repository is configured for continuous deployment to **GitHub Pages**.

Any push to the `main` branch will automatically trigger the GitHub Actions workflow defined in `.github/workflows/static.yml`. This workflow builds and deploys the site to the project's GitHub Pages URL.

---

*This project was developed to showcase modern web design and interactive dashboard capabilities.*