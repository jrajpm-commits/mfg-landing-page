// Initialize the JS PDF library
const { jsPDF } = window.jspdf;

// Assessment Framework Definition (JSON)
const assessmentFramework = {
    dimensions: [
        {
            id: "businessImpact",
            name: "Business Criticality & Impact",
            weight: 0.30,
            aspects: [
                {
                    id: "revenueImpact",
                    question: "What is the direct revenue impact of this application?",
                    options: [
                        { text: "Directly generates revenue (e.g., e-commerce)", score: 10 },
                        { text: "Directly supports revenue generation", score: 8 },
                        { text: "Indirectly supports revenue", score: 5 },
                        { text: "No revenue impact", score: 0 }
                    ]
                },
                {
                    id: "downtimeCost",
                    question: "What is the estimated cost per hour of downtime?",
                    options: [
                        { text: ">$10,000 per hour", score: 10 },
                        { text: "$1,000 - $10,000 per hour", score: 7 },
                        { text: "$100 - $1,000 per hour", score: 4 },
                        { text: "<$100 per hour", score: 1 }
                    ]
                },
                {
                    id: "userDependency",
                    question: "How many users depend on this application?",
                    options: [
                        { text: ">1,000 users", score: 10 },
                        { text: "100-1,000 users", score: 7 },
                        { text: "10-100 users", score: 4 },
                        { text: "<10 users", score: 1 }
                    ]
                },
                {
                    id: "processCriticality",
                    question: "How many critical business processes depend on this application?",
                    options: [
                        { text: "5+ critical processes", score: 10 },
                        { text: "3-4 critical processes", score: 7 },
                        { text: "1-2 critical processes", score: 4 },
                        { text: "No critical processes", score: 0 }
                    ]
                }
            ]
        },
        {
            id: "technicalHealth",
            name: "Technical Health & Obsolescence",
            weight: 0.25,
            aspects: [
                {
                    id: "techStackCurrent",
                    question: "How current is the technology stack?",
                    options: [
                        { text: "Fully modern stack (e.g., cloud-native, containers)", score: 10 },
                        { text: "Mostly current with some legacy components", score: 7 },
                        { text: "Significantly outdated but supported", score: 4 },
                        { text: "Obsolete/unsupported technology", score: 0 }
                    ]
                },
                {
                    id: "eolRisk",
                    question: "What is the End-of-Life (EOL) risk for key components?",
                    options: [
                        { text: "No EOL components", score: 10 },
                        { text: "EOL in >3 years", score: 7 },
                        { text: "EOL in 1-3 years", score: 4 },
                        { text: "EOL reached or <1 year", score: 0 }
                    ]
                },
                {
                    id: "securityVulnerabilities",
                    question: "What is the security vulnerability status?",
                    options: [
                        { text: "No critical vulnerabilities", score: 10 },
                        { text: "1-2 critical vulnerabilities", score: 6 },
                        { text: "3-5 critical vulnerabilities", score: 3 },
                        { text: "5+ critical vulnerabilities", score: 0 }
                    ]
                },
                {
                    id: "deployability",
                    question: "How easily can changes be deployed?",
                    options: [
                        { text: "Fully automated CI/CD", score: 10 },
                        { text: "Mostly automated with some manual steps", score: 7 },
                        { text: "Mostly manual process", score: 3 },
                        { text: "Complex, risky deployments", score: 0 }
                    ]
                }
            ]
        },
        {
            id: "tco",
            name: "Total Cost of Ownership",
            weight: 0.25,
            aspects: [
                {
                    id: "annualCost",
                    question: "What is the approximate annual TCO?",
                    options: [
                        { text: "<$50k annually", score: 10 },
                        { text: "$50k-$200k annually", score: 7 },
                        { text: "$200k-$500k annually", score: 4 },
                        { text: ">$500k annually", score: 1 }
                    ]
                },
                {
                    id: "fteSupport",
                    question: "How many FTEs are required for support?",
                    options: [
                        { text: "<0.5 FTE", score: 10 },
                        { text: "0.5-1 FTE", score: 7 },
                        { text: "1-2 FTE", score: 4 },
                        { text: ">2 FTE", score: 1 }
                    ]
                },
                {
                    id: "downtimeFrequency",
                    question: "How frequently does unplanned downtime occur?",
                    options: [
                        { text: "Rarely or never", score: 10 },
                        { text: "Once per quarter", score: 7 },
                        { text: "Monthly", score: 4 },
                        { text: "Weekly or more frequently", score: 1 }
                    ]
                },
                {
                    id: "skillScarcity",
                    question: "How difficult is it to find skills for this technology?",
                    options: [
                        { text: "Skills readily available", score: 10 },
                        { text: "Skills available but expensive", score: 7 },
                        { text: "Skills difficult to find", score: 4 },
                        { text: "Skills very scarce or obsolete", score: 1 }
                    ]
                }
            ]
        },
        {
            id: "modernization",
            name: "Modernization Potential",
            weight: 0.20,
            aspects: [
                {
                    id: "cloudAffinity",
                    question: "How suitable is this application for cloud migration?",
                    options: [
                        { text: "Cloud-native ready", score: 10 },
                        { text: "Requires some refactoring", score: 7 },
                        { text: "Significant re-architecture needed", score: 4 },
                        { text: "Not suitable for cloud", score: 1 }
                    ]
                },
                {
                    id: "dataAccessibility",
                    question: "How accessible is the data for modernization?",
                    options: [
                        { text: "Well-structured APIs available", score: 10 },
                        { text: "Data accessible but needs transformation", score: 7 },
                        { text: "Data locked in proprietary format", score: 4 },
                        { text: "Data inaccessible or poorly structured", score: 1 }
                    ]
                },
                {
                    id: "businessCase",
                    question: "What is the strength of the business case for modernization?",
                    options: [
                        { text: "Strong ROI & strategic alignment", score: 10 },
                        { text: "Moderate ROI", score: 7 },
                        { text: "Weak ROI but other benefits", score: 4 },
                        { text: "No clear business case", score: 1 }
                    ]
                },
                {
                    id: "stakeholderSupport",
                    question: "How strong is stakeholder support for modernization?",
                    options: [
                        { text: "Strong executive sponsorship", score: 10 },
                        { text: "Moderate support", score: 7 },
                        { text: "Limited support", score: 4 },
                        { text: "Resistance to change", score: 1 }
                    ]
                }
            ]
        }
    ]
};

let currentAssessmentId = null;

// --- Business Unit Management ---
function getBusinessUnits() {
    const data = localStorage.getItem('portfolioBusinessUnits');
    const parsedData = data ? JSON.parse(data) : null;
    // Provide default BUs if none exist or if the stored list is empty
    if (parsedData && parsedData.length > 0) {
        return parsedData;
    }
    return [
        { id: 'sales', name: 'Sales' },
        { id: 'finance', name: 'Finance' },
        { id: 'ops', name: 'Operations' }
    ];
}

function saveBusinessUnits(businessUnits) {
    localStorage.setItem('portfolioBusinessUnits', JSON.stringify(businessUnits));
}

// Data management functions
function getApplications() {
    if (!currentAssessmentId) return [];
    const allAssessments = getAssessments(); // From storage.js
    const assessment = allAssessments.find(a => a.id === currentAssessmentId);
    return assessment?.portfolioApps || [];
}

function saveApplications(applications) {
    if (!currentAssessmentId) {
        console.error("No assessment selected. Cannot save applications.");
        return;
    }
    const allAssessments = getAssessments();
    const assessmentIndex = allAssessments.findIndex(a => a.id === currentAssessmentId);

    if (assessmentIndex > -1) {
        if (!allAssessments[assessmentIndex].portfolioApps) {
            allAssessments[assessmentIndex].portfolioApps = [];
        }
        allAssessments[assessmentIndex].portfolioApps = applications;
        allAssessments[assessmentIndex].lastUpdated = new Date().toISOString();
        saveAssessments(allAssessments); // From storage.js
    } else {
        console.error("Could not find the current assessment to save data.");
    }
}

function calculateScores(assessment) {
    const scores = {};
    let totalScore = 0;

    assessmentFramework.dimensions.forEach(dimension => {
        let dimensionScore = 0;
        let maxDimensionScore = 0;
        
        dimension.aspects.forEach(aspect => {
            const selectedOption = assessment[aspect.id];
            if (selectedOption !== undefined) {
                const option = aspect.options.find(opt => opt.score === parseInt(selectedOption));
                if (option) {
                    dimensionScore += option.score;
                    maxDimensionScore += 10; // Max score per aspect is 10
                }
            }
        });
        
        // Normalize dimension score to 100 scale
        const normalizedScore = maxDimensionScore > 0 ? (dimensionScore / maxDimensionScore) * 100 : 0;
        scores[dimension.id] = Math.round(normalizedScore);
        totalScore += normalizedScore * dimension.weight;
    });

    scores.overall = Math.round(totalScore);
    
    // Determine recommendation
    if (scores.businessImpact >= 70) {
        scores.recommendation = scores.technicalHealth >= 60 ? 'invest' : 'modernize';
    } else {
        scores.recommendation = scores.technicalHealth >= 60 ? 'retain' : 'retire';
    }

    return scores;
}

// UI Rendering functions
function renderApplicationBubbles() {
    const matrix = document.getElementById('rationalization-matrix');
    // Clear existing bubbles
    document.querySelectorAll('.app-bubble').forEach(bubble => bubble.remove());
    
    const applications = getApplications();
    applications.forEach(app => {
        const bubble = document.createElement('div');
        bubble.className = `app-bubble ${app.scores.recommendation}`;
        bubble.textContent = app.name;
        
        // Size based on business impact
        const size = Math.max(40, Math.min(100, app.scores.businessImpact / 2));
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        
        // Position based on scores
        const xPos = 50 + (app.scores.businessImpact - 50) / 2; // Center at 50, scale position
        const yPos = 50 + (50 - app.scores.technicalHealth) / 2; // Invert for y-axis
        
        bubble.style.left = `${xPos}%`;
        bubble.style.top = `${yPos}%`;
        
        bubble.addEventListener('click', () => showAppDetails(app));
        matrix.appendChild(bubble);
    });
}

function renderApplicationList() {
    const tbody = document.querySelector('#app-list tbody');
    tbody.innerHTML = '';
    
    const applications = getApplications();
    applications.forEach(app => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${app.name}</td>
            <td>${app.businessUnit}</td>
            <td>${app.scores.businessImpact}</td>
            <td>${app.scores.technicalHealth}</td>
            <td>${app.scores.tco}</td>
            <td>${app.scores.modernization}</td>
            <td>${app.scores.overall}</td>
            <td><span class="recommendation-badge badge-${app.scores.recommendation}">${app.scores.recommendation.toUpperCase()}</span></td>
            <td>
                <button class="btn-edit" data-id="${app.id}">Edit</button>
                <button class="btn-delete" data-id="${app.id}">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Add event listeners to buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const appId = e.target.getAttribute('data-id');
            const app = applications.find(a => a.id == appId);
            if (app) showAppDetails(app);
        });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const appId = e.target.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this application?')) {
                const updatedApps = applications.filter(a => a.id != appId);
                saveApplications(updatedApps);
                renderDashboard();
            }
        });
    });
}

function renderCharts() {
    const applications = getApplications();
    
    // Portfolio distribution chart
    const portfolioData = {
        invest: applications.filter(a => a.scores.recommendation === 'invest').length,
        modernize: applications.filter(a => a.scores.recommendation === 'modernize').length,
        retain: applications.filter(a => a.scores.recommendation === 'retain').length,
        retire: applications.filter(a => a.scores.recommendation === 'retire').length
    };

    if (window.portfolioChart) {
        window.portfolioChart.updateSeries([portfolioData.invest, portfolioData.modernize, portfolioData.retain, portfolioData.retire]);
    } else {
        window.portfolioChart = new ApexCharts(document.querySelector("#chart-portfolio-distribution"), {
            chart: { type: 'donut' },
            series: [portfolioData.invest, portfolioData.modernize, portfolioData.retain, portfolioData.retire],
            labels: ['Invest', 'Modernize', 'Retain', 'Retire'],
            colors: ['#2ecc71', '#f39c12', '#3498db', '#e74c3c']
        });
        window.portfolioChart.render();
    }

    // Investment analysis chart (placeholder)
    if (applications.length > 0) {
        const avgScores = {
            businessImpact: Math.round(applications.reduce((sum, app) => sum + app.scores.businessImpact, 0) / applications.length),
            technicalHealth: Math.round(applications.reduce((sum, app) => sum + app.scores.technicalHealth, 0) / applications.length),
            tco: Math.round(applications.reduce((sum, app) => sum + app.scores.tco, 0) / applications.length),
            modernization: Math.round(applications.reduce((sum, app) => sum + app.scores.modernization, 0) / applications.length)
        };

        if (window.investmentChart) {
            window.investmentChart.updateSeries([{
                data: [avgScores.businessImpact, avgScores.technicalHealth, avgScores.tco, avgScores.modernization]
            }]);
        } else {
            window.investmentChart = new ApexCharts(document.querySelector("#chart-investment-analysis"), {
                chart: { type: 'bar' },
                series: [{
                    name: 'Average Scores',
                    data: [avgScores.businessImpact, avgScores.technicalHealth, avgScores.tco, avgScores.modernization]
                }],
                xaxis: {
                    categories: ['Business Impact', 'Technical Health', 'TCO', 'Modernization']
                },
                yaxis: {
                    max: 100
                }
            });
            window.investmentChart.render();
        }
    }
}

function renderRoadmap() {
    const container = document.getElementById('roadmap-projects');
    container.innerHTML = '';
    
    const applications = getApplications();
    const modernizeApps = applications.filter(app => app.scores.recommendation === 'modernize');
    
    if (modernizeApps.length === 0) {
        container.innerHTML = '<p>No applications require modernization at this time.</p>';
        return;
    }

    // Group by business unit or create individual projects
    modernizeApps.forEach(app => {
        const project = document.createElement('div');
        project.className = 'roadmap-project';
        project.innerHTML = `
            <h3>${app.name} Modernization</h3>
            <p><strong>Business Unit:</strong> ${app.businessUnit}</p>
            <p><strong>Priority Score:</strong> ${app.scores.overall}</p>
            <p><strong>Current TCO:</strong> $${app.details?.annualCost || 'N/A'}</p>
            <p><strong>Estimated Timeline:</strong> 6-9 months</p>
            <div class="progress" style="height: 20px; background: #eee; border-radius: 10px; margin: 10px 0;">
                <div style="height: 100%; width: 0%; background: #f39c12; border-radius: 10px;"></div>
            </div>
            <button class="btn-start-project" data-id="${app.id}">Start Project</button>
        `;
        container.appendChild(project);
    });
}

function showAppDetails(app = null) {
    const modal = document.getElementById('app-details');
    const modalContent = document.getElementById('modal-content');
    const isEdit = app !== null;
    
    // Create or update form
    modalContent.innerHTML = '';
    
    // Basic information section
    let formHTML = `
        <div class="form-section" style="grid-column: 1 / -1;">
            <h3>Basic Information</h3>
            <div class="form-group">
                <label for="app-name">Application Name</label>
                <input type="text" id="app-name" value="${isEdit ? app.name : ''}" required>
            </div>
            <div class="form-group">
                <label for="app-businessUnit">Business Unit</label>
                <select id="app-businessUnit">${
                    getBusinessUnits().map(bu => 
                        `<option value="${bu.id}" ${isEdit && app.businessUnit === bu.id ? 'selected' : ''}>${bu.name}</option>`
                    ).join('')
                }
                </select> 
            </div>
            <div class="form-group">
                <label for="app-description">Description</label>
                <input type="text" id="app-description" value="${isEdit ? app.description || '' : ''}">
            </div>
        </div>
    `;
    
    // Assessment sections
    assessmentFramework.dimensions.forEach(dimension => {
        formHTML += `
            <div class="form-section">
                <h3>${dimension.name} (${dimension.weight * 100}%)</h3>
                ${dimension.aspects.map(aspect => {
                    const currentValue = isEdit && app.assessment ? app.assessment[aspect.id] : '';
                    return `
                        <div class="form-group">
                            <label for="${aspect.id}">${aspect.question}</label>
                            <select id="${aspect.id}" class="assessment-question">
                                <option value="">Select an option</option>
                                ${aspect.options.map(option => `
                                    <option value="${option.score}" ${currentValue == option.score ? 'selected' : ''}>
                                        ${option.text} (${option.score} points)
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    });
    
    modalContent.innerHTML = formHTML;
    
    // Add event listeners to recalculate scores on change
    document.querySelectorAll('.assessment-question').forEach(select => {
        select.addEventListener('change', updateCalculatedScores);
    });
    
    // Set modal title
    document.getElementById('modal-app-name').textContent = 
        isEdit ? `Edit ${app.name}` : 'Add New Application';
    
    // Show modal
    modal.style.display = 'block';
    document.getElementById('modal-overlay').style.display = 'block';
    
    // Calculate initial scores
    updateCalculatedScores();
    
    // Set up save button
    const saveButton = document.getElementById('btn-save-app');
    saveButton.onclick = () => saveApplication(app ? app.id : null);
}

function updateCalculatedScores() {
    const assessment = {};
    assessmentFramework.dimensions.forEach(dimension => {
        dimension.aspects.forEach(aspect => {
            const select = document.getElementById(aspect.id);
            if (select && select.value) {
                assessment[aspect.id] = select.value;
            }
        });
    });
    
    if (Object.keys(assessment).length > 0) {
        const scores = calculateScores(assessment);
        const scoreResults = document.getElementById('score-results');
        
        scoreResults.innerHTML = `
            <p><strong>Business Impact:</strong> ${scores.businessImpact}/100</p>
            <p><strong>Technical Health:</strong> ${scores.technicalHealth}/100</p>
            <p><strong>TCO Score:</strong> ${scores.tco}/100</p>
            <p><strong>Modernization Potential:</strong> ${scores.modernization}/100</p>
            <p><strong>Overall Score:</strong> ${scores.overall}/100</p>
            <p><strong>Recommendation:</strong> <span class="recommendation-badge badge-${scores.recommendation}">${scores.recommendation.toUpperCase()}</span></p>
        `;
    }
}

function saveApplication(appId) {
    const name = document.getElementById('app-name').value;
    const businessUnit = document.getElementById('app-businessUnit').value;
    const description = document.getElementById('app-description').value;
    
    if (!name) {
        alert('Application name is required');
        return;
    }
    
    // Collect assessment answers
    const assessment = {};
    assessmentFramework.dimensions.forEach(dimension => {
        dimension.aspects.forEach(aspect => {
            const select = document.getElementById(aspect.id);
            if (select && select.value) {
                assessment[aspect.id] = select.value;
            }
        });
    });
    
    if (Object.keys(assessment).length < assessmentFramework.dimensions.reduce((sum, dim) => sum + dim.aspects.length, 0)) {
        if (!confirm('Not all questions have been answered. Save anyway?')) {
            return;
        }
    }
    
    const scores = calculateScores(assessment);
    const applications = getApplications();
    
    if (appId) {
        // Update existing application
        const index = applications.findIndex(app => app.id == appId);
        if (index !== -1) {
            applications[index] = {
                ...applications[index],
                name,
                businessUnit,
                description,
                assessment,
                scores,
                lastUpdated: new Date().toISOString()
            };
        }
    } else {
        // Add new application
        const newApp = {
            id: Date.now(), // Simple ID generation
            name,
            businessUnit,
            description,
            assessment,
            scores,
            created: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
        applications.push(newApp);
   }
    
    saveApplications(applications);
    closeModal();
    renderDashboard();
}

function closeModal() {
    document.getElementById('app-details').style.display = 'none';
    document.getElementById('modal-overlay').style.display = 'none';
}

function exportToPDF() {
    const applications = getApplications();
    if (applications.length === 0) {
        alert('No applications to export');
        return;
    }
    
    const doc = new jsPDF();
    let yPosition = 20;
    
    // Title
    doc.setFontSize(20);
    doc.text('Application Portfolio Assessment Report', 105, yPosition, { align: 'center' });
    yPosition += 20;
    
    // Summary
    doc.setFontSize(12);
    const portfolioData = {
        invest: applications.filter(a => a.scores.recommendation === 'invest').length,
        modernize: applications.filter(a => a.scores.recommendation === 'modernize').length,
        retain: applications.filter(a => a.scores.recommendation === 'retain').length,
        retire: applications.filter(a => a.scores.recommendation === 'retire').length
    };
    
    doc.text(`Portfolio Summary: ${applications.length} Applications Assessed`, 20, yPosition);
    yPosition += 10;
    doc.text(`Invest: ${portfolioData.invest} applications`, 20, yPosition);
    yPosition += 7;
    doc.text(`Modernize: ${portfolioData.modernize} applications`, 20, yPosition);
    yPosition += 7;
    doc.text(`Retain: ${portfolioData.retain} applications`, 20, yPosition);
    yPosition += 7;
    doc.text(`Retire: ${portfolioData.retire} applications`, 20, yPosition);
    yPosition += 15;
    
    // Detailed list
    doc.setFontSize(14);
    doc.text('Application Details:', 20, yPosition);
    yPosition += 10;
    
    applications.forEach((app, index) => {
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
        }
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'bold');
        doc.text(`${index + 1}. ${app.name}`, 20, yPosition);
        yPosition += 7;
        
        doc.setFont(undefined, 'normal');
        doc.text(`Business Unit: ${app.businessUnit}`, 20, yPosition);
        yPosition += 7;
        
        doc.text(`Recommendation: ${app.scores.recommendation.toUpperCase()}`, 20, yPosition);
        yPosition += 7;
        
        doc.text(`Scores: Business Impact (${app.scores.businessImpact}), Technical Health (${app.scores.technicalHealth}), TCO (${app.scores.tco}), Modernization (${app.scores.modernization})`, 20, yPosition);
        yPosition += 7;
        
        doc.text(`Overall: ${app.scores.overall}/100`, 20, yPosition);
        yPosition += 10;
    });
    
    doc.save('Application-Portfolio-Report.pdf');
}

function renderDashboard() {
    renderApplicationBubbles();
    renderApplicationList();
    renderCharts();
}

function showRoadmap() {
    document.getElementById('roadmap-view').style.display = 'block';
    document.querySelectorAll('.chart-container:not(#roadmap-view)').forEach(el => {
        el.style.display = 'none';
    });
    renderRoadmap();
}

function showDashboard() {
    document.getElementById('roadmap-view').style.display = 'none';
    document.querySelectorAll('.chart-container').forEach(el => {
        el.style.display = 'block';
    });
}

// --- Import Functionality ---

function handleImportClick() {
    document.getElementById('import-file-input').click();
}

function importApplications(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedApps = JSON.parse(e.target.result);
            if (!Array.isArray(importedApps)) {
                throw new Error("Imported JSON is not an array.");
            }

            const existingApps = getApplications();
            const validBusinessUnits = getBusinessUnits().map(bu => bu.id);
            let successCount = 0;
            let errorCount = 0;
            const errors = [];

            importedApps.forEach((app, index) => {
                // --- Validation ---
                if (!app.name || !app.businessUnit) {
                    errors.push(`App #${index + 1} ('${app.name || 'No Name'}') is missing required fields: name or businessUnit.`);
                    errorCount++;
                    return;
                }
                if (!validBusinessUnits.includes(app.businessUnit)) {
                    errors.push(`App #${index + 1} ('${app.name}') has an invalid businessUnit: '${app.businessUnit}'.`);
                    errorCount++;
                    return;
                }
                if (existingApps.some(existing => existing.name.toLowerCase() === app.name.toLowerCase())) {
                    errors.push(`App #${index + 1} ('${app.name}') already exists and was skipped.`);
                    errorCount++;
                    return;
                }

                // --- Processing ---
                const scores = calculateScores(app.assessment || {});
                const newApp = {
                    id: Date.now() + index, // Simple unique ID
                    name: app.name,
                    businessUnit: app.businessUnit,
                    description: app.description || '',
                    assessment: app.assessment || {},
                    scores: scores,
                    created: new Date().toISOString(),
                    lastUpdated: new Date().toISOString()
                };
                existingApps.push(newApp);
                successCount++;
            });

            saveApplications(existingApps);
            renderDashboard();

            // --- Reporting ---
            let alertMessage = `${successCount} application(s) imported successfully.`;
            if (errorCount > 0) {
                alertMessage += `\n\n${errorCount} application(s) failed to import:\n- ${errors.join('\n- ')}`;
            }
            alert(alertMessage);

        } catch (error) {
            alert(`Failed to import file. Please ensure it is a valid JSON array of applications.\n\nError: ${error.message}`);
        } finally {
            // Reset file input to allow re-importing the same file
            event.target.value = '';
        }
    };
    reader.readAsText(file);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadAssessmentsAndRender();
    
    // Event listeners
    document.getElementById('assessment-selector').addEventListener('change', (e) => {
        currentAssessmentId = e.target.value;
        renderDashboard();
    });
    document.getElementById('btn-add-app').addEventListener('click', () => showAppDetails());
    document.getElementById('btn-import-apps').addEventListener('click', handleImportClick);
    document.getElementById('import-file-input').addEventListener('change', importApplications);
    document.getElementById('btn-close-modal').addEventListener('click', closeModal);
    document.getElementById('btn-import-bu').addEventListener('click', () => document.getElementById('bu-import-file-input').click());
    document.getElementById('bu-import-file-input').addEventListener('change', importBusinessUnits);
    document.getElementById('btn-manage-bu').addEventListener('click', showBuModal);
    document.getElementById('btn-close-bu-modal').addEventListener('click', closeBuModal);
    document.getElementById('bu-modal-overlay').addEventListener('click', closeBuModal);
    document.getElementById('btn-add-bu').addEventListener('click', addBusinessUnit);
    document.getElementById('btn-export').addEventListener('click', exportToPDF);
    document.getElementById('btn-view-roadmap').addEventListener('click', showRoadmap);
    document.getElementById('btn-back-to-dashboard').addEventListener('click', showDashboard);
    document.getElementById('btn-apply-filters').addEventListener('click', applyFilters);
    document.getElementById('btn-clear-filters').addEventListener('click', clearFilters);
    
    // Close modal when clicking outside
    document.getElementById('modal-overlay').addEventListener('click', closeModal);
});

function loadAssessmentsAndRender() {
    const assessmentSelector = document.getElementById('assessment-selector');
    const errorContainer = document.getElementById('dashboard-error-container');
    const allAssessments = getAssessments(); // From storage.js

    if (allAssessments.error) {
        errorContainer.innerHTML = `<div class="card" style="border-left: 5px solid #e74c3c;"><h3 style="color: #c0392b;">Error</h3><p>Could not load assessment data. Please reset data in the Admin panel.</p></div>`;
        errorContainer.style.display = 'block';
        return;
    }

    assessmentSelector.innerHTML = '<option value="">-- Select an Assessment --</option>';
    if (allAssessments.length === 0) {
        assessmentSelector.innerHTML = '<option value="">No assessments found</option>';
        errorContainer.innerHTML = `<div class="card" style="border-left: 5px solid #f39c12;"><h3 style="color: #d35400;">No Assessments Found</h3><p>Please start a new assessment from the Admin Dashboard to use this feature.</p></div>`;
        errorContainer.style.display = 'block';
        return;
    }

    // Populate BU filter dropdown
    const buFilter = document.getElementById('filter-business-unit');
    buFilter.innerHTML = '<option value="all">All</option>'; // Keep the 'All' option
    getBusinessUnits().forEach(bu => {
        const option = document.createElement('option');
        option.value = bu.id;
        option.textContent = bu.name;
        buFilter.appendChild(option);
    });

    allAssessments.forEach(assessment => {
        const option = document.createElement('option');
        option.value = assessment.id;
        option.textContent = assessment.name;
        assessmentSelector.appendChild(option);
    });

    // Select the most recently updated assessment by default
    const mostRecentId = allAssessments.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))[0].id;
    assessmentSelector.value = mostRecentId;
    currentAssessmentId = mostRecentId;
    renderDashboard();
}

function showBuModal() {
    renderBuList();
    document.getElementById('bu-modal').style.display = 'block';
    document.getElementById('bu-modal-overlay').style.display = 'block';
}

function closeBuModal() {
    document.getElementById('bu-modal').style.display = 'none';
    document.getElementById('bu-modal-overlay').style.display = 'none';
    // Refresh the main dashboard in case BUs were changed
    loadAssessmentsAndRender();
}

function renderBuList() {
    const container = document.getElementById('bu-list-container');
    const businessUnits = getBusinessUnits();
    if (businessUnits.length === 0) {
        container.innerHTML = '<p>No business units defined. Add one below.</p>';
        return;
    }
    container.innerHTML = businessUnits.map(bu => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #eee;">
            <span>${bu.name} (id: ${bu.id})</span>
            <button class="btn-delete" onclick="deleteBusinessUnit('${bu.id}')" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px;">Delete</button>
        </div>
    `).join('');
}

function addBusinessUnit() {
    const input = document.getElementById('new-bu-name');
    const name = input.value.trim();
    if (!name) {
        alert('Business unit name cannot be empty.');
        return;
    }

    const businessUnits = getBusinessUnits();
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10);

    if (businessUnits.some(bu => bu.id === id || bu.name.toLowerCase() === name.toLowerCase())) {
        alert('A business unit with this name or a similar ID already exists.');
        return;
    }

    businessUnits.push({ id, name });
    saveBusinessUnits(businessUnits);
    renderBuList();
    input.value = '';
}

function importBusinessUnits(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const newBus = JSON.parse(e.target.result);
            if (!Array.isArray(newBus)) {
                throw new Error("Imported JSON is not an array.");
            }

            const existingBus = getBusinessUnits();
            let addedCount = 0;

            newBus.forEach(bu => {
                if (bu.name) {
                    const name = bu.name.trim();
                    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10);
                    if (name && !existingBus.some(eb => eb.id === id || eb.name.toLowerCase() === name.toLowerCase())) {
                        existingBus.push({ id, name });
                        addedCount++;
                    }
                }
            });

            saveBusinessUnits(existingBus);
            renderBuList();
            alert(`${addedCount} new business unit(s) imported successfully!`);

        } catch (error) {
            alert(`Failed to import file. Please ensure it is a valid JSON array of objects with a "name" key.\n\nError: ${error.message}`);
        } finally {
            event.target.value = ''; // Reset file input
        }
    };
    reader.readAsText(file);
}

function deleteBusinessUnit(id) {
    if (!confirm('Are you sure you want to delete this business unit? This cannot be undone.')) return;
    const updatedBus = getBusinessUnits().filter(bu => bu.id !== id);
    saveBusinessUnits(updatedBus);
    renderBuList();
}

function applyFilters() {
    // Implementation for filtering would go here
    alert('Filter functionality would be implemented here');
}

function clearFilters() {
    // Implementation for clearing filters would go here
    alert('Clear filters functionality would be implemented here');
}