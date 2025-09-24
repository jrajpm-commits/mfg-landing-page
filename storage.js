// Centralized, robust localStorage helpers

function getAssessments() {
    const data = localStorage.getItem('mes-completed-assessments');
    console.log("getAssessments: Reading from localStorage. Raw data:", data);
    try {
        const parsed = data ? JSON.parse(data) : [];
        console.log("getAssessments: Parsed data successfully. Count:", parsed.length);
        return parsed;
    } catch (e) {
        console.error("Error parsing assessments from localStorage:", e);
        // Return an error object instead of an empty array to signal corruption
        return { error: true, key: 'mes-completed-assessments', rawData: data };
    }
}

function saveAssessments(assessments) {
    try {
        console.log("Saving assessments to localStorage:", assessments); // Debug log
        localStorage.setItem('mes-completed-assessments', JSON.stringify(assessments));
    } catch (e) {
        console.error("Error saving assessments to localStorage:", e);
        alert("A critical error occurred while trying to save data. Please check the console.");
    }
}

function getTemplates() {
    const data = localStorage.getItem('mes-templates');
    console.log("getTemplates: Reading from localStorage. Raw data:", data);
    try {
        const parsed = data ? JSON.parse(data) : [];
        console.log("getTemplates: Parsed data successfully. Count:", parsed.length);
        return parsed;
    } catch (e) {
        console.error("Error parsing templates from localStorage:", e);
        // Return an error object instead of an empty array to signal corruption
        return { error: true, key: 'mes-templates', rawData: data };
    }
}

function saveTemplates(templates) {
    try {
        console.log("Saving templates to localStorage:", templates); // Debug log
        localStorage.setItem('mes-templates', JSON.stringify(templates));
    } catch (e) {
        console.error("Error saving templates to localStorage:", e);
    }
}

function getContexts() {
    const data = localStorage.getItem('mes-llm-contexts');
    console.log("getContexts: Reading from localStorage. Raw data:", data);
    try {
        // Provide a default context if none exist
        const defaultContext = [{
            id: `ctx-${Date.now()}`,
            name: "Default JSON Generator",
            content: `You are an expert in creating structured assessment questionnaires. Your task is to convert unstructured text into a valid JSON object that follows a specific format. The JSON format MUST be: {"templateName":"String","templateId":"string-with-dashes","description":"String","dimensions":[{"id":Number,"name":"String","weight":Number,"description":"String","aspects":[{"name":"String","weight":Number,"rationale":"String","questions":[{"id":"String (e.g., 1.1.1)","text":"String","why":"String"}]}]}]}. The task is complete only after you conduct a comprehensive enterprise-grade review and have verified and validated the output. The final output MUST ONLY be the raw JSON object. Do not include any surrounding text, explanations, or markdown formatting.`
        }];
        const parsed = data ? JSON.parse(data) : defaultContext;
        return parsed;
    } catch (e) {
        console.error("Error parsing contexts from localStorage:", e);
        return { error: true, key: 'mes-llm-contexts', rawData: data };
    }
}

function saveContexts(contexts) {
    console.log("Saving contexts to localStorage:", contexts);
    localStorage.setItem('mes-llm-contexts', JSON.stringify(contexts));
}