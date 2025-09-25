// Initialize the JS PDF library
const { jsPDF } = window.jspdf;
let assessmentFramework; // Will be loaded from JSON

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
            aspect.questions.forEach(question => {
                const selectedValue = assessment[question.id];
                // Assuming a simple 1-10 scale for now if no options are provided
                const score = selectedValue ? parseInt(selectedValue) : 0;
                dimensionScore += score;
                maxDimensionScore += 10; // Each question is on a 1-10 scale
            });
        });

        // Normalize dimension score to 100 scale
        const normalizedScore = maxDimensionScore > 0 ? (dimensionScore / maxDimensionScore) * 100 : 0;
        
        // Create a simple key from the dimension name (e.g., "businessImpact")
        const dimensionKey = dimension.name.split(' ')[1].toLowerCase().replace(/[^a-z]/g, '');
        scores[dimensionKey] = Math.round(normalizedScore);
        totalScore += normalizedScore * (dimension.weight / 100);
    });

    scores.overall = Math.round(totalScore);
    scores.businessImpact = scores.business; // Alias for consistency
    scores.technicalHealth = scores.technical; // Alias
    scores.tco = scores.total; // Alias
    
    // Determine recommendation
    if (scores.business >= 70) {
        scores.recommendation = scores.technical >= 60 ? 'invest' : 'modernize';
    } else {
        scores.recommendation = scores.technical >= 60 ? 'retain' : 'retire';
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
        const size = Math.max(40, Math.min(100, (app.scores.business || 0) / 2));
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        
        // Position based on scores
        const xPos = 50 + ((app.scores.business || 0) - 70) / 1.5; // Center at 70 to match recommendation logic
        const yPos = 50 + (60 - (app.scores.technical || 0)) / 2; // Center at 60 to match recommendation logic
        
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
            <div class="form-section" style="grid-column: 1 / -1;">
                <h3>${dimension.name} (${dimension.weight}%)</h3>
                ${dimension.aspects.map(aspect => {
                    return `
                        <h4 style="margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">${aspect.name}</h4>
                        ${aspect.questions.map(question => {
                            const currentValue = isEdit && app.assessment ? app.assessment[question.id] : '';
                            return `
                                <div class="form-group">
                                    <label for="${question.id}" title="${question.why}">${question.text}</label>
                                    <select id="${question.id}" class="assessment-question">
                                        <option value="">Select a score (1-10)</option>
                                        ${[...Array(10).keys()].map(i => i + 1).map(score => `
                                            <option value="${score}" ${currentValue == score ? 'selected' : ''}>
                                                ${score}
                                            </option>
                                        `).join('')}
                                    </select>
                                </div>
                            `;
                        }).join('')}
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
    const modalTitle = document.getElementById('modal-app-name');
    modalTitle.innerHTML = `
        ${isEdit ? `Edit ${app.name}` : 'Add New Application'}
        <a href="README.md#portfolio-rationalization-guidelines" target="_blank" style="font-size: 0.8rem; font-weight: normal; margin-left: 15px;">View Scoring Guidelines</a>`;
    
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
            aspect.questions.forEach(question => {
                const select = document.getElementById(question.id);
                if (select && select.value) {
                    assessment[question.id] = select.value;
                }
            });
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
            aspect.questions.forEach(question => {
                const select = document.getElementById(question.id);
                if (select && select.value) {
                    assessment[question.id] = select.value;
                }
            });
        });    
    });
    
    if (Object.keys(assessment).length < assessmentFramework.dimensions.reduce((sum, dim) => sum + dim.aspects.reduce((s, a) => s + a.questions.length, 0), 0)) {
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

function exportToExcel() {
    const applications = getApplications();
    if (applications.length === 0) {
        alert('No applications to export');
        return;
    }

    // 1. Prepare the data for the worksheet
    const dataForSheet = applications.map(app => {
        return {
            'ID': app.id,
            'Application Name': app.name,
            'Business Unit': app.businessUnit,
            'Description': app.description,
            'Recommendation': app.scores.recommendation,
            'Overall Score': app.scores.overall,
            'Business Impact': app.scores.businessImpact,
            'Technical Health': app.scores.technicalHealth,
            'TCO Score': app.scores.tco,
            'Modernization Potential': app.scores.modernization,
            'Created Date': new Date(app.created).toLocaleDateString(),
            'Last Updated': new Date(app.lastUpdated).toLocaleDateString()
        };
    });

    // 2. Create a new workbook and a worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataForSheet);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Portfolio');

    // 3. Auto-size columns for better readability
    const objectMaxLength = [];
    dataForSheet.forEach(app => {
        Object.keys(app).forEach((key, i) => {
            let len = (app[key] || "").toString().length;
            objectMaxLength[i] = Math.max(objectMaxLength[i] || 0, len);
        });
    });
    worksheet["!cols"] = objectMaxLength.map(w => ({ wch: w + 2 })); // Add a little padding

    // 4. Trigger the download
    XLSX.writeFile(workbook, 'Application_Portfolio.xlsx');
}

function exportFrameworkToExcel() {
    if (!assessmentFramework) {
        alert("Assessment framework is not loaded yet.");
        return;
    }

    const dataForSheet = [];

    assessmentFramework.dimensions.forEach(dimension => {
        dimension.aspects.forEach(aspect => {
            aspect.questions.forEach(question => {
                dataForSheet.push({
                    'Dimension Name': dimension.name,
                    'Dimension Weight (%)': dimension.weight,
                    'Aspect Name': aspect.name,
                    'Aspect Weight (%)': aspect.weight,
                    'Aspect Rationale': aspect.rationale,
                    'Question ID': question.id,
                    'Question Text': question.text,
                    'Question Rationale (Why)': question.why,
                    'Scoring': 'User provides a score from 1 (Low) to 10 (High)'
                });
            });
        });
    });

    const worksheet = XLSX.utils.json_to_sheet(dataForSheet);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Assessment Framework');

    // Auto-size columns for better readability
    const objectMaxLength = [];
    dataForSheet.forEach(row => {
        Object.values(row).forEach((value, i) => {
            const len = (value || "").toString().length;
            objectMaxLength[i] = Math.max(objectMaxLength[i] || 0, len);
        });
    });
    worksheet["!cols"] = objectMaxLength.map(w => ({ wch: Math.min(w + 2, 80) })); // Add padding, max width 80

    // Trigger the download
    XLSX.writeFile(workbook, 'Assessment_Framework_Details.xlsx');
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
function attachEventListeners() {
    document.getElementById('assessment-selector').addEventListener('change', (e) => {
        currentAssessmentId = e.target.value;
        renderDashboard();
    });
    // document.getElementById('theme-toggle').addEventListener('click', () => {
    //     document.body.classList.toggle('cyberpunk-theme');
    //     localStorage.setItem('dashboardTheme', document.body.classList.contains('cyberpunk-theme') ? 'cyberpunk' : 'light');
    // });
    document.getElementById('btn-add-app').addEventListener('click', () => showAppDetails());
    document.getElementById('import-file-input').addEventListener('change', importApplications);
    document.getElementById('btn-export-framework').addEventListener('click', exportFrameworkToExcel);
    document.getElementById('btn-export-excel').addEventListener('click', exportToExcel);
    document.getElementById('btn-export').addEventListener('click', exportToPDF);
    // document.getElementById('btn-view-roadmap').addEventListener('click', showRoadmap);
    document.getElementById('btn-back-to-dashboard').addEventListener('click', showDashboard);
    document.getElementById('btn-apply-filters').addEventListener('click', applyFilters);
    document.getElementById('btn-clear-filters').addEventListener('click', clearFilters);
    
    // Close modal when clicking outside
    document.getElementById('btn-close-modal').addEventListener('click', closeModal);
    document.getElementById('modal-overlay').addEventListener('click', closeModal);
}

function loadAssessmentsAndRender() {
    const assessmentSelector = document.getElementById('assessment-selector');
    const errorContainer = document.getElementById('dashboard-error-container');
    const allAssessments = getAssessments(); // From storage.js

    if (allAssessments.error) {
        errorContainer.innerHTML = `<div class="card" style="border-left: 5px solid #e74c3c;"><h3 style="color: #c0392b;">Error</h3><p>Could not load assessment data. Please reset data in the Admin panel.</p></div>`;
        errorContainer.style.display = 'block';
        return;
    }

    if (allAssessments.length === 0) {
        console.log("No assessments found. Creating a default demo assessment.");
        const defaultAssessment = {
            id: `asmt-${Date.now()}`,
            name: "Default Demo Assessment",
            description: "A sample assessment with pre-populated applications.",
            created: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            portfolioApps: [] // Start with an empty array
        };

        // Define valid default apps with correct assessment keys
        const defaultAppsData = [
            {
                id: Date.now() + 1, name: "Legacy ERP", businessUnit: "finance",
                assessment: { "1.1.1": "2", "1.1.2": "8", "1.1.3": "9", "1.1.4": "8", "1.1.5": "1", "1.2.1": "3", "1.2.2": "2", "1.2.3": "9", "1.2.4": "2", "1.2.5": "8", "2.1.1": "2", "2.1.2": "1", "2.1.3": "1", "2.1.4": "2", "2.1.5": "3", "2.2.1": "4", "2.2.2": "4", "2.2.3": "3", "2.2.4": "5", "2.2.5": "4", "2.3.1": "2", "2.3.2": "4", "2.3.3": "3", "2.3.4": "1", "2.3.5": "2", "3.1.1": "1", "3.1.2": "2", "3.1.3": "2", "3.1.4": "1", "3.1.5": "3", "3.2.1": "2", "3.2.2": "1", "3.2.3": "3", "3.2.4": "2", "3.2.5": "3", "4.1.1": "2", "4.1.2": "2", "4.1.3": "1", "4.1.4": "2", "4.1.5": "3", "4.2.1": "2", "4.2.2": "1", "4.2.3": "2", "4.2.4": "8", "4.2.5": "2" }
            },
            {
                id: Date.now() + 2, name: "CRM System", businessUnit: "sales",
                assessment: { "1.1.1": "9", "1.1.2": "8", "1.1.3": "8", "1.1.4": "9", "1.1.5": "10", "1.2.1": "9", "1.2.2": "8", "1.2.3": "7", "1.2.4": "9", "1.2.5": "8", "2.1.1": "8", "2.1.2": "9", "2.1.3": "7", "2.1.4": "7", "2.1.5": "8", "2.2.1": "9", "2.2.2": "8", "2.2.3": "9", "2.2.4": "9", "2.2.5": "8", "2.3.1": "9", "2.3.2": "9", "2.3.3": "8", "2.3.4": "7", "2.3.5": "8", "3.1.1": "6", "3.1.2": "7", "3.1.3": "8", "3.1.4": "8", "3.1.5": "7", "3.2.1": "7", "3.2.2": "8", "3.2.3": "8", "3.2.4": "7", "3.2.5": "8", "4.1.1": "8", "4.1.2": "8", "4.1.3": "7", "4.1.4": "8", "4.1.5": "9", "4.2.1": "9", "4.2.2": "8", "4.2.3": "9", "4.2.4": "7", "4.2.5": "9" }
            },
            {
                id: Date.now() + 3, name: "Warehouse Mgmt", businessUnit: "ops",
                assessment: { "1.1.1": "1", "1.1.2": "9", "1.1.3": "10", "1.1.4": "7", "1.1.5": "1", "1.2.1": "8", "1.2.2": "6", "1.2.3": "9", "1.2.4": "7", "1.2.5": "8", "2.1.1": "4", "2.1.2": "3", "2.1.3": "2", "2.1.4": "4", "2.1.5": "3", "2.2.1": "5", "2.2.2": "5", "2.2.3": "4", "2.2.4": "6", "2.2.5": "5", "2.3.1": "4", "2.3.2": "5", "2.3.3": "4", "2.3.4": "3", "2.3.5": "4", "3.1.1": "3", "3.1.2": "3", "3.1.3": "5", "3.1.4": "4", "3.1.5": "4", "3.2.1": "5", "3.2.2": "4", "3.2.3": "6", "3.2.4": "5", "3.2.5": "6", "4.1.1": "3", "4.1.2": "4", "4.1.3": "2", "4.1.4": "3", "4.1.5": "4", "4.2.1": "7", "4.2.2": "6", "4.2.3": "7", "4.2.4": "8", "4.2.5": "7" }
            },
            {
                id: Date.now() + 4, name: "Internal Wiki", businessUnit: "ops",
                assessment: { "1.1.1": "1", "1.1.2": "1", "1.1.3": "2", "1.1.4": "5", "1.1.5": "1", "1.2.1": "3", "1.2.2": "2", "1.2.3": "2", "1.2.4": "4", "1.2.5": "3", "2.1.1": "9", "2.1.2": "9", "2.1.3": "8", "2.1.4": "8", "2.1.5": "7", "2.2.1": "10", "2.2.2": "9", "2.2.3": "10", "2.2.4": "10", "2.2.5": "8", "2.3.1": "9", "2.3.2": "9", "2.3.3": "10", "2.3.4": "8", "2.3.5": "9", "3.1.1": "10", "3.1.2": "10", "3.1.3": "10", "3.1.4": "9", "3.1.5": "9", "3.2.1": "8", "3.2.2": "7", "3.2.3": "9", "3.2.4": "8", "3.2.5": "7", "4.1.1": "7", "4.1.2": "8", "4.1.3": "8", "4.1.4": "9", "4.1.5": "8", "4.2.1": "3", "4.2.2": "2", "4.2.3": "3", "4.2.4": "4", "4.2.5": "5" }
            }
        ];

        // For each default app, calculate its scores and add it to the assessment
        defaultAppsData.forEach(appData => {
            const scores = calculateScores(appData.assessment);
            defaultAssessment.portfolioApps.push({ ...appData, scores });
        });

        allAssessments.push(defaultAssessment);
        saveAssessments(allAssessments); // Save the new default assessment
        
        // Hide the selector since there's only one default
        assessmentSelector.style.display = 'none';
        // Crucially, set the currentAssessmentId to the newly created one
        currentAssessmentId = defaultAssessment.id;

    } else {
        assessmentSelector.style.display = 'block';
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

    assessmentSelector.innerHTML = '<option value="">-- Select an Assessment --</option>';
    allAssessments.forEach(assessment => {
        const option = document.createElement('option');
        option.value = assessment.id;
        option.textContent = assessment.name;
        assessmentSelector.appendChild(option);
    });

    // If currentAssessmentId is not set (e.g., on initial load with existing assessments),
    // default to the first one in the list.
    if (!currentAssessmentId && allAssessments.length > 0) {
        currentAssessmentId = allAssessments[0].id;
    }

    // Set the dropdown to the current ID and render the dashboard
    assessmentSelector.value = currentAssessmentId;
    renderDashboard(); // This call was missing in the original logic path
}

async function init() {
    try {
        const response = await fetch('portfolio-assessment-rationalization.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        assessmentFramework = await response.json();
        
        // Now that the framework is loaded, initialize the rest of the app
        loadAssessmentsAndRender();
        attachEventListeners();

        // Apply saved theme
        const savedTheme = localStorage.getItem('dashboardTheme');
        if (savedTheme === 'cyberpunk') {
            document.body.classList.add('cyberpunk-theme');
        }

    } catch (error) {
        console.error("Fatal Error: Could not load assessment framework.", error);
        document.getElementById('dashboard-error-container').innerHTML = `<div class="card" style="border-left: 5px solid #e74c3c;"><h3 style="color: #c0392b;">Fatal Error</h3><p>Could not load the assessment framework from the server. The dashboard cannot operate.</p></div>`;
    } finally {
        // Hide the loading overlay regardless of success or failure
        document.getElementById('loading-overlay').style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', init);

function applyFilters() {
    // Implementation for filtering would go here
    alert('Filter functionality would be implemented here');
}

function clearFilters() {
    // Implementation for clearing filters would go here
    alert('Clear filters functionality would be implemented here');
}