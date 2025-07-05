// DOM Elements
const genTab = document.getElementById('gen-tab');
const analyzeTab = document.getElementById('analyze-tab');
const generator = document.getElementById('generator');
const analyzer = document.getElementById('analyzer');
const pwLength = document.getElementById('pw-length');
const pwLengthVal = document.getElementById('pw-length-value');
const generateBtn = document.getElementById('generate-btn');
const copyBtn = document.getElementById('copy-btn');
const genOutput = document.getElementById('gen-output');
const analyzeInput = document.getElementById('analyze-input');

// Analysis elements
const strengthFill = document.getElementById('strength-fill');
const strengthLabel = document.getElementById('strength-label');
const strengthScore = document.getElementById('strength-score');
const analysisResult = document.getElementById('analysis-result');
const recommendations = document.getElementById('recommendations');
// const recommendationsList = document.getElementById('recommendations-list');
// const timeToCrack = document.getElementById('time-to-crack');

// State management
let analyzeTimeout;
let isGenerating = false;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    generateInitialPassword();
}

function setupEventListeners() {
    // Tab navigation
    genTab.addEventListener('click', switchToGenerator);
    analyzeTab.addEventListener('click', switchToAnalyzer);
    
    // Password generator
    pwLength.addEventListener('input', updatePasswordLength);
    generateBtn.addEventListener('click', generatePassword);
    copyBtn.addEventListener('click', copyPasswordToClipboard);
    
    // Password analyzer
    analyzeInput.addEventListener('input', handleAnalyzeInput);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Tab Navigation Functions
function switchToGenerator() {
    genTab.classList.add('active');
    analyzeTab.classList.remove('active');
    generator.classList.remove('hidden');
    analyzer.classList.add('hidden');
}

function switchToAnalyzer() {
    analyzeTab.classList.add('active');
    genTab.classList.remove('active');
    analyzer.classList.remove('hidden');
    generator.classList.add('hidden');
}

// Password Length Slider
function updatePasswordLength() {
    pwLengthVal.textContent = pwLength.value;
}

// Password Generation
async function generatePassword() {
    if (isGenerating) return;
    
    isGenerating = true;
    updateGenerateButtonState(true);
    
    try {
        const preferences = getPasswordPreferences();
        const response = await fetch('/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(preferences)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.password) {
            genOutput.value = result.password;
            showSuccessMessage('Password generated successfully!');
        } else {
            throw new Error('No password received from server');
        }
        
    } catch (error) {
        console.error('Error generating password:', error);
        genOutput.value = 'Error generating password';
        showErrorMessage('Failed to generate password. Please try again.');
    } finally {
        isGenerating = false;
        updateGenerateButtonState(false);
    }
}

function getPasswordPreferences() {
    return {
        length: parseInt(pwLength.value),
        upper: document.getElementById('upper').checked,
        lower: document.getElementById('lower').checked,
        number: document.getElementById('number').checked,
        symbol: document.getElementById('symbol').checked
    };
}

function updateGenerateButtonState(loading) {
    if (loading) {
        generateBtn.textContent = 'Generating...';
        generateBtn.disabled = true;
        generateBtn.classList.add('loading');
    } else {
        generateBtn.textContent = 'Generate Password';
        generateBtn.disabled = false;
        generateBtn.classList.remove('loading');
    }
}

// Copy to Clipboard
async function copyPasswordToClipboard() {
    const password = genOutput.value;
    
    if (!password || password === 'Error generating password') {
        showErrorMessage('No password to copy');
        return;
    }
    
    try {
        // Try modern clipboard API first
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(password);
        } else {
            // Fallback for older browsers
            genOutput.select();
            document.execCommand('copy');
        }
        
        showCopySuccess();
        
    } catch (error) {
        console.error('Error copying password:', error);
        showErrorMessage('Failed to copy password');
    }
}

function showCopySuccess() {
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '✅';
    copyBtn.style.background = '#22c55e';
    
    setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.background = '';
    }, 1500);
}

// Password Analysis
function handleAnalyzeInput(event) {
    const password = event.target.value;
    
    // Clear previous timeout
    clearTimeout(analyzeTimeout);
    
    // Debounce input - wait 300ms after user stops typing
    analyzeTimeout = setTimeout(() => {
        analyzePassword(password);
    }, 300);
}

async function analyzePassword(password) {
    if (!password) {
        resetAnalysisDisplay();
        return;
    }
    
    try {
        const response = await fetch('/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password: password })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        updateAnalysisDisplay(result);
        
    } catch (error) {
        console.error('Error analyzing password:', error);
        showAnalysisError();
    }
}

function updateAnalysisDisplay(result) {
    const analysis = result.analysis;
    
    // Update analysis checklist
    analysisResult.innerHTML = `
        <ul>
            <li class="${analysis.length ? 'ok' : 'bad'}">Length: At least 12 characters</li>
            <li class="${analysis.uppercase ? 'ok' : 'bad'}">Contains uppercase letters</li>
            <li class="${analysis.lowercase ? 'ok' : 'bad'}">Contains lowercase letters</li>
            <li class="${analysis.number ? 'ok' : 'bad'}">Contains numbers</li>
            <li class="${analysis.symbol ? 'ok' : 'bad'}">Contains symbols</li>
            <li class="${analysis.not_common ? 'ok' : 'bad'}">Not a common password</li>
        </ul>

    `;
    
    // Show or hide sequential warning message
    const warningDiv = document.getElementById('sequential-message');
    const seqMsg = analysis.sequential_message;
    if (seqMsg) {
      warningDiv.textContent = seqMsg;
      warningDiv.style.display = "block";
    } else {
      warningDiv.textContent = "";
      warningDiv.style.display = "none";
    }
    
    // Show or hide pwned password warning message
    const pwnedDiv = document.getElementById('pwned-message');
    const pwnedMsg = analysis.pwned_message;
    if (pwnedMsg) {
      pwnedDiv.textContent = pwnedMsg;
      pwnedDiv.style.display = "block";
    } else {
      pwnedDiv.textContent = "";
      pwnedDiv.style.display = "none";
    }
    
    // Update strength indicator
    updateStrengthIndicator(result);
    
    // Update recommendations
    // updateRecommendations(result.recommendations);
    
    // Update time to crack estimate
    // updateTimeToCrack(result.time_to_crack);
}

function updateStrengthIndicator(result) {
    const { strength_label, strength_score } = result;
    
    // Color mapping for different strength levels
    const colors = {
        'Very Weak': '#ef4444',  // red-500
        'Weak': '#f97316',       // orange-500
        'Moderate': '#eab308',   // yellow-500
        'Strong': '#22c55e',     // green-500
        'Very Strong': '#16a34a' // green-600
    };
    
    // Update strength bar
    strengthFill.style.width = `${strength_score}%`;
    strengthFill.style.backgroundColor = colors[strength_label] || '#6b7280';
    
    // Update labels
    strengthLabel.textContent = strength_label;
    strengthScore.textContent = `${strength_score}/100`;
}

// function updateRecommendations(recommendationsList) {
//     if (recommendationsList && recommendationsList.length > 0) {
//         const listItems = recommendationsList
//             .map(rec => `<li>${rec}</li>`)
//             .join('');
        
//         document.getElementById('recommendations-list').innerHTML = listItems;
//         recommendations.style.display = 'block';
//     } else {
//         recommendations.style.display = 'none';
//     }
// }

// function updateTimeToCrack(timeEstimate) {
//     timeToCrack.textContent = `Estimated time to crack: ${timeEstimate}`;
// }

function resetAnalysisDisplay() {
    analysisResult.innerHTML = '';
    recommendations.style.display = 'none';
    strengthLabel.textContent = 'Enter password';
    strengthScore.textContent = '';
    strengthFill.style.width = '0%';
    strengthFill.style.backgroundColor = '#fafafa';
    // timeToCrack.textContent = '';
}

function showAnalysisError() {
    analysisResult.innerHTML = '<p style="color: #ef4444;">Error analyzing password. Please try again.</p>';
    recommendations.style.display = 'none';
    strengthLabel.textContent = 'Error';
    strengthScore.textContent = '';
    strengthFill.style.width = '0%';
    // timeToCrack.textContent = '';
}

// Utility Functions
function generateInitialPassword() {
    // Generate a password when the page loads for better UX
    setTimeout(() => {
        generatePassword();
    }, 100);
}

function showSuccessMessage(message) {
    // You can implement a toast notification system here
    console.log('Success:', message);
}

function showErrorMessage(message) {
    // You can implement a toast notification system here
    console.error('Error:', message);
}

// Keyboard Shortcuts
function handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + G: Generate password
    if ((event.ctrlKey || event.metaKey) && event.key === 'g') {
        event.preventDefault();
        if (!analyzer.classList.contains('hidden')) {
            switchToGenerator();
        }
        generatePassword();
    }
    
    // Ctrl/Cmd + A: Switch to analyzer (when not in input field)
    if ((event.ctrlKey || event.metaKey) && event.key === 'a' && 
        !event.target.matches('input, textarea')) {
        event.preventDefault();
        switchToAnalyzer();
        analyzeInput.focus();
    }
    
    // Ctrl/Cmd + C: Copy password (when on generator tab)
    if ((event.ctrlKey || event.metaKey) && event.key === 'c' && 
        !generator.classList.contains('hidden') && 
        !event.target.matches('input, textarea')) {
        event.preventDefault();
        copyPasswordToClipboard();
    }
    
    // Escape: Clear analyzer input
    if (event.key === 'Escape' && !analyzer.classList.contains('hidden')) {
        analyzeInput.value = '';
        resetAnalysisDisplay();
    }
}

// Prevent form submission on Enter key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && event.target.matches('input')) {
        event.preventDefault();
        
        if (event.target.id === 'analyze-input') {
            // Trigger analysis immediately
            clearTimeout(analyzeTimeout);
            analyzePassword(event.target.value);
        } else if (!generator.classList.contains('hidden')) {
            // Generate password if on generator tab
            generatePassword();
        }
    }
});

// Export functions for potential testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getPasswordPreferences,
        updatePasswordLength,
        switchToGenerator,
        switchToAnalyzer
    };
}