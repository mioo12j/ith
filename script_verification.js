/**
 * =========================================================================================
 * INSPIRE TALENT HUB 2026 - ENTERPRISE CERTIFICATE VERIFICATION ENGINE
 * =========================================================================================
 * Version: 4.0.0 (The "Cinematic Overhaul" Build)
 * Namespace: _verification_fest_2026
 * 
 * SYSTEM ARCHITECTURE & FEATURES:
 * 1.  Dynamic CSS-in-JS Injection (Zero external stylesheets required)
 * 2.  Smart Input Masking (Auto-detects Competition Codes and injects '-')
 * 3.  Inline Validation Engine (Haptic shakes, red borders, dynamic error text)
 * 4.  Cinematic Modal Overlay ("Screen Come Up" effect with backdrop blur)
 * 5.  Advanced Particle Physics Engine (Wind, gravity, 3D rotation confetti)
 * 6.  Procedural Typewriter Engine (Cursor blinking, variable speed typing)
 * 7.  3D Tilt Engine (Hovering over the certificate tilts it on an axis)
 * 8.  Strict Object-Oriented ES6 Class Architecture
 * =========================================================================================
 */

"use strict";

// =========================================================================================
// MODULE 1: THE PRODUCTION DATABASE
// =========================================================================================

// Title-case helper (names live in lowercase in the canonical database).
function _titleCaseName(str) {
    return String(str || "").replace(/\b[a-z]/g, c => c.toUpperCase());
}

// The verification database is DERIVED from the single source of truth
// (window.RESULTS_DB, provided by result_announcer_2026_script.js, which must load first).
// Only records that carry a certificate ID (award winners) are verifiable, so we surface
// those and map them into the shape this module already expects.
const database_verification_fest_2026 = (Array.isArray(window.RESULTS_DB) ? window.RESULTS_DB : [])
    .filter(record => record.certId)
    .map(record => ({
        certId: record.certId,
        fullName: _titleCaseName(record.name),
        issueDate: "May 2026",
        participationType: record.prize,
        category: record.competitionName,
        event: "Academic Kickoff Fest 2026"
    }));
// List of all valid competition prefixes for the smart auto-dash masker
const VALID_COMPETITION_CODES = ["EV3D", "ERB", "FLM", "PWC", "MDC", "EWC", "FTL", "SWC", "MGC", "AIL", "CDC", "CAQ", "MQ", "SQ"];

// =========================================================================================
// MODULE 2: CSS INJECTION ENGINE
// =========================================================================================
/**
 * Injects massive amounts of CSS dynamically so the HTML remains untouched.
 * Handles Modal Overlays, 3D Tilting, Error Shakes, and Shimmers.
 */
class StyleEngine {
    static inject() {
        if (document.getElementById('cinematic-v4-styles')) return;
        const style = document.createElement('style');
        style.id = 'cinematic-v4-styles';
        style.innerHTML = `
            /* Core Variables */
            :root {
                --gold-primary: #D4AF37;
                --gold-light: #FFDF00;
                --gold-dark: #B8860B;
                --error-red: #EF4444;
                --error-bg: #FEE2E2;
            }

            /* INLINE ERROR STYLING */
            .input-error-state {
                border-color: var(--error-red) !important;
                background-color: var(--error-bg) !important;
                color: #991B1B !important;
                animation: errorShake 0.4s cubic-bezier(.36,.07,.19,.97) both;
            }
            .inline-error-text {
                color: var(--error-red);
                font-size: 0.875rem;
                margin-top: 0.25rem;
                font-weight: 500;
                display: none; /* Hidden by default */
                animation: fadeIn 0.3s ease-in;
            }
            .inline-error-text.active {
                display: block;
            }

            /* SMART INPUT MASK PLACEHOLDER */
            .smart-input {
                text-transform: uppercase;
                letter-spacing: 1px;
                font-family: monospace;
                font-weight: bold;
                transition: all 0.3s ease;
            }
            .smart-input::placeholder {
                color: #9CA3AF;
                font-weight: normal;
                letter-spacing: normal;
            }

            /* FULL SCREEN MODAL OVERLAY (The "Screen Come Up") */
            .cinematic-overlay {
                position: fixed;
                top: 0; left: 0; width: 100vw; height: 100vh;
                background: rgba(0, 0, 0, 0.75);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                z-index: 9000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.5s ease-in-out;
            }
            .cinematic-overlay.active {
                opacity: 1;
                pointer-events: all;
            }

            /* MODAL CERTIFICATE CARD */
            .cinematic-card {
                background: #ffffff;
                width: 90%;
                max-width: 600px;
                border-radius: 16px;
                padding: 2rem;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 2px var(--gold-primary);
                transform: translateY(100px) scale(0.9);
                opacity: 0;
                transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                position: relative;
                overflow: hidden;
            }
            .cinematic-overlay.active .cinematic-card {
                transform: translateY(0) scale(1);
                opacity: 1;
            }
            
            /* WATERMARK BACKGROUND */
            .cinematic-card::before {
                content: "VERIFIED";
                position: absolute;
                top: 50%; left: 50%;
                transform: translate(-50%, -50%) rotate(-30deg);
                font-size: 8rem;
                font-weight: 900;
                color: rgba(212, 175, 55, 0.05); /* Extremely faint gold */
                pointer-events: none;
                z-index: 0;
            }

            /* CONTENT LAYOUT INSIDE MODAL */
            .card-content {
                position: relative;
                z-index: 1;
                text-align: center;
            }
            .cert-header {
                font-size: 0.875rem;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: #6B7280;
                margin-bottom: 0.5rem;
            }
            .cert-name {
                font-size: 2.5rem;
                font-weight: 800;
                margin-bottom: 1rem;
                background: linear-gradient(to right, #b8860b 20%, #ffd700 40%, #ffd700 60%, #b8860b 80%);
                background-size: 200% auto;
                color: #000;
                background-clip: text;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: goldShimmer 3s infinite linear;
            }
            .cert-meta-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
                background: #F9FAFB;
                padding: 1.5rem;
                border-radius: 8px;
                border: 1px solid #E5E7EB;
                margin-bottom: 1.5rem;
                text-align: left;
            }
            .meta-item label {
                display: block;
                font-size: 0.75rem;
                color: #6B7280;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .meta-item span {
                display: block;
                font-weight: 600;
                color: #111827;
                font-size: 1rem;
            }
            
            /* TYPEWRITER TEXT */
            .cert-ceremonial-text {
                font-family: 'Georgia', serif;
                font-size: 1.1rem;
                line-height: 1.7;
                color: #374151;
                border-left: 4px solid var(--gold-primary);
                padding-left: 1rem;
                margin-bottom: 2rem;
                text-align: left;
                min-height: 120px; /* Prevent layout shift while typing */
            }
            .cursor {
                display: inline-block;
                width: 2px;
                background-color: var(--gold-primary);
                animation: blink 1s infinite;
            }

            /* CLOSE BUTTON */
            .btn-close-modal {
                background: var(--gold-primary);
                color: white;
                border: none;
                padding: 0.75rem 2rem;
                border-radius: 9999px;
                font-weight: bold;
                letter-spacing: 1px;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 6px -1px rgba(212, 175, 55, 0.4);
            }
            .btn-close-modal:hover {
                background: var(--gold-dark);
                transform: translateY(-2px);
                box-shadow: 0 10px 15px -3px rgba(212, 175, 55, 0.5);
            }

            /* CONFETTI CANVAS */
            #confetti-canvas-v4 {
                position: fixed;
                top: 0; left: 0;
                width: 100vw; height: 100vh;
                pointer-events: none;
                z-index: 9999;
            }

            /* KEYFRAMES */
            @keyframes errorShake {
                10%, 90% { transform: translate3d(-1px, 0, 0); }
                20%, 80% { transform: translate3d(2px, 0, 0); }
                30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                40%, 60% { transform: translate3d(4px, 0, 0); }
            }
            @keyframes goldShimmer {
                0% { background-position: -1000px 0; }
                100% { background-position: 1000px 0; }
            }
            @keyframes blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0; }
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-5px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }
}

// =========================================================================================
// MODULE 3: SMART INPUT MASKING & INLINE VALIDATION
// =========================================================================================
/**
 * Automatically formats the user's input to perfectly match AKF2026-XXX-000
 * Injects dashes automatically as they type.
 */
class InputMaskController {
    constructor(inputElement) {
        if (!inputElement) return;
        this.input = inputElement;
        this.input.classList.add('smart-input');
        
        // Change placeholder to guide the user visually
        this.input.setAttribute('placeholder', 'AKF2026-XXX-000');
        
        // Listen to keystrokes
        this.input.addEventListener('input', this.handleInput.bind(this));
    }

    handleInput(e) {
        // 1. Get raw string, force uppercase, strip all special characters
        let raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        let formatted = '';

        if (raw.length > 0) {
            // 2. The Prefix is always AKF2026
            let prefix = raw.substring(0, 7);
            formatted += prefix;

            // 3. If they typed past the prefix, we add the first dash automatically
            if (raw.length > 7) {
                formatted += '-';
                let remainder = raw.substring(7); // Everything after AKF2026
                
                // 4. Try to identify the competition code (e.g., FLM, EV3D)
                let matchedCode = "";
                for (let code of VALID_COMPETITION_CODES) {
                    if (remainder.startsWith(code)) {
                        matchedCode = code;
                        break;
                    }
                }

                // 5. If we recognized the code, we auto-insert the second dash!
                if (matchedCode) {
                    formatted += matchedCode;
                    let numbers = remainder.substring(matchedCode.length);
                    if (numbers.length > 0) {
                        formatted += '-' + numbers.substring(0, 3); // Max 3 digit ID
                    }
                } else {
                    // Fallback: If they type an unknown code, separate letters and numbers
                    let alphaPart = remainder.match(/^[A-Z]+/);
                    if (alphaPart) {
                        formatted += alphaPart[0];
                        let numPart = remainder.substring(alphaPart[0].length);
                        if (numPart.length > 0) {
                            formatted += '-' + numPart.substring(0, 3);
                        }
                    } else {
                        formatted += remainder; // Failsafe
                    }
                }
            }
        }
        
        // 6. Update the input field with the perfectly masked string
        this.input.value = formatted;
        
        // Clear errors if they start typing again
        InlineErrorEngine.clear(this.input);
    }
}

/**
 * Handles the Red text, red borders, and shaking animation directly on the input.
 */
class InlineErrorEngine {
    static throw(inputElement, message) {
        if (!inputElement) return;
        
        // Add red shake class
        inputElement.classList.add('input-error-state');
        
        // Create or find error text node
        let errorText = inputElement.nextElementSibling;
        if (!errorText || !errorText.classList.contains('inline-error-text')) {
            errorText = document.createElement('div');
            errorText.classList.add('inline-error-text');
            inputElement.parentNode.insertBefore(errorText, inputElement.nextSibling);
        }
        
        errorText.textContent = message;
        errorText.classList.add('active');

        // Remove the shake animation after it finishes so it can be triggered again
        setTimeout(() => {
            inputElement.classList.remove('input-error-state');
            // Keep the red border, just remove the shake
            inputElement.style.borderColor = "var(--error-red)";
            inputElement.style.backgroundColor = "var(--error-bg)";
            inputElement.style.color = "#991B1B";
        }, 400);
    }

    static clear(inputElement) {
        if (!inputElement) return;
        inputElement.classList.remove('input-error-state');
        inputElement.style.borderColor = "";
        inputElement.style.backgroundColor = "";
        inputElement.style.color = "";
        
        let errorText = inputElement.nextElementSibling;
        if (errorText && errorText.classList.contains('inline-error-text')) {
            errorText.classList.remove('active');
        }
    }
}

// =========================================================================================
// MODULE 4: CINEMATIC MODAL ENGINE ("THE SCREEN COMING UP")
// =========================================================================================
/**
 * Dynamically builds and controls the fullscreen overlay that slides up.
 */
class CinematicModal {
    constructor() {
        this.buildDOM();
    }

    buildDOM() {
        // Create the Overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'cinematic-overlay';
        
        // Create the Card
        this.card = document.createElement('div');
        this.card.className = 'cinematic-card';
        
        // Setup internal HTML structure
        this.card.innerHTML = `
            <div class="card-content">
                <div class="cert-header">Official Certificate Record</div>
                <div class="cert-name" id="modal-name">Participant Name</div>
                
                <div class="cert-meta-grid">
                    <div class="meta-item">
                        <label>Certificate ID</label>
                        <span id="modal-id">AKF2026-XXX-000</span>
                    </div>
                    <div class="meta-item">
                        <label>Date of Issue</label>
                        <span id="modal-date">May 2026</span>
                    </div>
                    <div class="meta-item">
                        <label>Award / Position</label>
                        <span id="modal-type">Winner</span>
                    </div>
                    <div class="meta-item">
                        <label>Competition</label>
                        <span id="modal-category">Category</span>
                    </div>
                </div>

                <div class="cert-ceremonial-text" id="modal-desc"></div>
                
                <button class="btn-close-modal" id="modal-btn-close">Close Record</button>
            </div>
        `;
        
        this.overlay.appendChild(this.card);
        document.body.appendChild(this.overlay);

        // Bind Close Event
        document.getElementById('modal-btn-close').addEventListener('click', () => this.hide());
    }

    show(data) {
        // Populate Data
        document.getElementById('modal-name').textContent = data.fullName;
        document.getElementById('modal-id').textContent = data.certId;
        document.getElementById('modal-date').textContent = data.issueDate;
        document.getElementById('modal-type').textContent = data.participationType;
        document.getElementById('modal-category').textContent = data.category;
        
        // Generate the long text
        const textToType = `${data.participationType} in the ${data.category} at ${data.event}, a prestigious national-level academic competition, demonstrating exceptional talent, innovation, academic excellence, and outstanding performance among participants from over 500 schools across the nation. This achievement reflects remarkable dedication, perseverance, creativity, and a strong commitment to excellence. May this accomplishment inspire continued learning, growth, and even greater success in the future.`;
        
        // Reveal Modal
        this.overlay.classList.add('active');
        
        // Start Typewriter
        const descBox = document.getElementById('modal-desc');
        TypewriterEngine.type(descBox, textToType, 20);
    }

    hide() {
        this.overlay.classList.remove('active');
        // Clear typewriter
        document.getElementById('modal-desc').innerHTML = '';
        if (window.MainConfettiEngine) {
            window.MainConfettiEngine.stop();
        }
    }
}

/**
 * Handles the letter-by-letter typing animation with a blinking cursor.
 */
class TypewriterEngine {
    static type(element, text, speed = 25) {
        element.innerHTML = '<span class="cursor">|</span>'; // Start with cursor
        let i = 0;
        
        function typeNext() {
            if (i < text.length) {
                // Replace cursor, add letter, re-add cursor
                element.innerHTML = element.innerHTML.replace('<span class="cursor">|</span>', '');
                element.innerHTML += text.charAt(i) + '<span class="cursor">|</span>';
                i++;
                
                // Add slight randomness to typing speed for realism
                let randomSpeed = speed + (Math.random() * 20 - 10);
                setTimeout(typeNext, randomSpeed);
            } else {
                // Done typing, leave cursor blinking for 2 seconds then remove
                setTimeout(() => {
                    element.innerHTML = element.innerHTML.replace('<span class="cursor">|</span>', '');
                }, 2000);
            }
        }
        
        // Small delay before starting
        setTimeout(typeNext, 500);
    }
}

// =========================================================================================
// MODULE 5: ADVANCED 3D PARTICLE PHYSICS (CONFETTI)
// =========================================================================================
/**
 * A highly sophisticated, completely custom canvas particle engine.
 * Calculates gravity, drag, 3D rotation (tilt), and wind variables.
 */
class PhysicsConfetti {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'confetti-canvas-v4';
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.colors = ['#FFD700', '#DAA520', '#B8860B', '#FFF8DC', '#FFDF00', '#FFFFFF'];
        this.animationId = null;
        this.isActive = false;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    fire() {
        this.isActive = true;
        // Generate 200 high-quality particles
        for (let i = 0; i < 200; i++) {
            this.particles.push({
                x: this.canvas.width / 2, // Shoot from center
                y: this.canvas.height / 2 + 150,
                r: Math.random() * 6 + 3, // Size
                dx: Math.random() * 30 - 15, // X Velocity
                dy: Math.random() * -25 - 10, // Y Velocity (upward blast)
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                tilt: Math.floor(Math.random() * 10) - 10,
                tiltAngle: 0,
                tiltAngleInc: (Math.random() * 0.07) + 0.05,
                shape: Math.random() > 0.5 ? 'circle' : 'rect' // Mixed shapes
            });
        }
        if (!this.animationId) this.render();
    }

    render() {
        if (!this.isActive && this.particles.length === 0) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let activeCount = 0;

        for (let i = 0; i < this.particles.length; i++) {
            let p = this.particles[i];
            
            // Apply Physics Constants
            p.dy += 0.3; // Gravity pull
            p.dx *= 0.98; // Air resistance (drag)
            
            p.x += p.dx;
            p.y += p.dy;
            p.tiltAngle += p.tiltAngleInc;
            
            if (p.y < this.canvas.height) activeCount++;

            this.ctx.beginPath();
            this.ctx.lineWidth = p.r;
            this.ctx.strokeStyle = p.color;
            this.ctx.fillStyle = p.color;

            // 3D Ribbon Math Calculation
            let tiltOffset = p.r * Math.cos(p.tiltAngle);

            if (p.shape === 'circle') {
                this.ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI, false);
                this.ctx.fill();
            } else {
                this.ctx.moveTo(p.x + p.tilt + p.r, p.y);
                this.ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
                this.ctx.stroke();
            }
        }

        if (activeCount > 0 && this.isActive) {
            this.animationId = requestAnimationFrame(() => this.render());
        } else {
            this.stop();
        }
    }

    stop() {
        this.isActive = false;
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles = [];
    }
}

// =========================================================================================
// MODULE 6: CAPTCHA SECURITY CONTROLLER
// =========================================================================================
class SecurityCaptcha {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        this.answer = 0;
    }
    
    refresh() {
        if (!this.element) return;
        const n1 = Math.floor(Math.random() * 9) + 1;
        const n2 = Math.floor(Math.random() * 9) + 1;
        this.answer = n1 + n2;
        this.element.textContent = `${n1} + ${n2}`;
        
        // Find input and clear it
        const input = document.getElementById('input_captcha_verification_fest_2026');
        if(input) {
            input.value = "";
            InlineErrorEngine.clear(input);
        }
    }

    validate(userInput) {
        const parsed = parseInt(userInput, 10);
        return !isNaN(parsed) && parsed === this.answer;
    }
}

// =========================================================================================
// MODULE 7: THE CORE VERIFICATION APPLICATION
// =========================================================================================
class VerificationApp {
    constructor() {
        // Inject Styles First
        StyleEngine.inject();

        // Initialize Sub-Systems
        this.modal = new CinematicModal();
        window.MainConfettiEngine = new PhysicsConfetti();
        this.captcha = new SecurityCaptcha('captcha_math_verification_fest_2026');
        
        // DOM Elements
        this.inputId = document.getElementById('input_id_verification_fest_2026');
        this.inputCaptcha = document.getElementById('input_captcha_verification_fest_2026');
        this.btnVerify = document.getElementById('btn_verify_verification_fest_2026');

        // Apply Smart Masking
        new InputMaskController(this.inputId);

        // Bind Events
        this.bindEvents();
        
        // Initial Setup
        this.captcha.refresh();
    }

    bindEvents() {
        if (this.btnVerify) {
            this.btnVerify.addEventListener('click', () => this.execute());
        }

        const handleEnter = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.execute();
            }
        };

        if (this.inputId) this.inputId.addEventListener('keypress', handleEnter);
        if (this.inputCaptcha) this.inputCaptcha.addEventListener('keypress', handleEnter);
        
        // Clear errors on typing
        if (this.inputCaptcha) {
            this.inputCaptcha.addEventListener('input', () => InlineErrorEngine.clear(this.inputCaptcha));
        }
    }

    async execute() {
        // Clear old errors
        InlineErrorEngine.clear(this.inputId);
        InlineErrorEngine.clear(this.inputCaptcha);

        const rawId = this.inputId.value;
        const cleanId = rawId.trim().toUpperCase();
        const userCaptcha = this.inputCaptcha.value;

        // 1. Validation Checks
        let hasError = false;

        if (!cleanId) {
            InlineErrorEngine.throw(this.inputId, "Required: Please enter a valid Certificate ID.");
            hasError = true;
        }

        if (!this.captcha.validate(userCaptcha)) {
            InlineErrorEngine.throw(this.inputCaptcha, "Security Error: Math answer is incorrect.");
            hasError = true;
            this.captcha.refresh(); // Refresh on fail
        }

        if (hasError) return;

        // 2. Loading State (Button Spinner)
        const ogText = this.btnVerify.innerHTML;
        this.btnVerify.innerHTML = `<svg class="animate-spin h-5 w-5 mr-3 inline" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Decrypting...`;
        this.btnVerify.disabled = true;

        // 3. Simulate Server Latency
        await new Promise(r => setTimeout(r, 1200));

        // 4. Restore Button
        this.btnVerify.innerHTML = ogText;
        this.btnVerify.disabled = false;

        // 5. Query Database
        const matchedRecord = database_verification_fest_2026.find(r => r.certId === cleanId);

        if (matchedRecord) {
            // SUCCESS
            this.inputId.blur();
            this.inputCaptcha.blur();
            
            // Fire Modal & Confetti
            this.modal.show(matchedRecord);
            window.MainConfettiEngine.fire();
            setTimeout(() => window.MainConfettiEngine.fire(), 400); // Double Burst
            
            // Prep for next search
            this.captcha.refresh();
            this.inputId.value = "";
            this.inputCaptcha.value = "";
        } else {
            // FAIL - Inline Error
            InlineErrorEngine.throw(this.inputId, "Not Found: No official record matches this ID.");
            this.captcha.refresh();
        }
    }
}

// =========================================================================================
// MODULE 8: BOOTSTRAP INITIALIZATION
// =========================================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Create global instance to keep memory resident
    window.VerificationEngine = new VerificationApp();
});

// =========================================================================================
// MODULE 9: DATA-DRIVEN PAGE ENRICHMENT (read-only — does NOT modify the database)
// =========================================================================================
/**
 * Builds the "Recognised Competitions" panel directly from the production database above.
 * Purely additive: it reads the records to render helpful UI, it never edits them.
 */
(function enrichRecognisedCompetitions() {
    function build() {
        const listEl = document.getElementById('valid_comps_list_fest_2026');
        if (!listEl) return; // Quietly skip on pages without the panel.

        // Read the full fest line-up from the single source of truth so every competition
        // shows up (not only the ones that happen to have award winners).
        const records = Array.isArray(window.RESULTS_DB) ? window.RESULTS_DB : [];

        // Distinct competition names, alphabetically sorted.
        const categories = [...new Set(records.map(r => r.competitionName).filter(Boolean))].sort();

        const countEl = document.getElementById('valid_comps_count_fest_2026');

        if (countEl) {
            countEl.textContent = categories.length + (categories.length === 1 ? ' track' : ' tracks');
        }

        listEl.innerHTML = '';
        categories.forEach(category => {
            const chip = document.createElement('span');
            chip.className = 'verify_chip_fest_2026';
            chip.setAttribute('role', 'listitem');
            // Drop a trailing "Competition" word for cleaner chips; full name stays in the tooltip.
            chip.textContent = category.replace(/\s+competition\s*$/i, '').trim();
            chip.title = category;
            listEl.appendChild(chip);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', build);
    } else {
        build();
    }
})();