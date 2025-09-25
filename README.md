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

### Portfolio Rationalization Guidelines

The recommendation for each application (**Invest, Modernize, Retain, or Retire**) is determined by its scores in two key areas: **Business Impact** and **Technical Health**.

#### How Scores Are Calculated

1.  **Question Scoring**: Each question in the assessment form is answered by selecting an option with a point value (typically from 0 to 10).
2.  **Dimension Score**: The points for all questions within a dimension (e.g., "Business Criticality & Impact") are summed up.
3.  **Normalization**: This sum is normalized to a scale of 0 to 100 to get the final score for that dimension.

This process results in a 0-100 score for `Business Impact`, `Technical Health`, `TCO`, and `Modernization Potential`.

#### Recommendation Conditions

The final recommendation is based on the following matrix:

---

#### 1. **INVEST**
An application is marked as **INVEST** when it is highly valuable to the business and is technically sound. These are your star applications.

*   **Condition**:
    *   `Business Impact` score is **≥ 70** AND `Technical Health` score is **≥ 60**
*   **Meaning**: These applications are critical and healthy. The recommendation is to invest in new features and capabilities to further increase their value.

---

#### 2. **MODERNIZE**
An application is marked as **MODERNIZE** when it is critical to the business but is technically weak or outdated.

*   **Condition**:
    *   `Business Impact` score is **≥ 70** AND `Technical Health` score is **< 60**
*   **Meaning**: This application is essential, but its poor technical health poses a risk. The recommendation is to modernize it (e.g., re-platform, re-architect) to improve its technical foundation.

---

#### 3. **RETAIN**
An application is marked as **RETAIN** when it is not critical to the business but is technically healthy and stable.

*   **Condition**:
    *   `Business Impact` score is **< 70** AND `Technical Health` score is **≥ 60**
*   **Meaning**: This application works well but doesn't provide significant business value. The recommendation is to keep it running with minimal investment ("keep the lights on").

---

#### 4. **RETIRE**
An application is marked as **RETIRE** when it has low business value and is also in poor technical condition.

*   **Condition**:
    *   `Business Impact` score is **< 70** AND `Technical Health` score is **< 60**
*   **Meaning**: This application is a drain on resources. It is not valuable and is costly or risky to maintain. The recommendation is to plan for its decommissioning.

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