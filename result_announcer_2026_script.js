/**
 * Inspire Talent Hub 2026 - Official Result Announcer Logic
 * Namespace: result_announcer_2026_
 * 
 * This file handles all client-side interactions, form validation,
 * security captchas, and database querying for the result portal.
 */

// ==========================================
// 1. MOCK DATABASE (Simulating your backend)
// ==========================================
// When you go live, this array could be replaced by a fetch() call to a real server or JSON file.
const result_announcer_2026_database = [
    {
        name: "nishka gupta",
        category: "quiz",
        competitionName: "Current Affairs Quiz",
        school: "delhi_public_school_bangalore_east",
        status: "Participant",
        prize: "Certificate of Participation",
        displaySchool: "Delhi Public School Bangalore East",
        certId: null
    },
    {
        name: "sandeep mishra",
        category: "quiz",
        competitionName: "Current Affairs Quiz",
        school: "the_foundation_school_bangalore",
        status: "Participant",
        prize: "Certificate of Participation",
        displaySchool: "The Foundation School, Bangalore",
        certId: null
    },
    {
        name: "samarth dhiraj agrawal",
        category: "stem",
        competitionName: "ATL Innovators Lab",
        school: "delhi_public_school_raipur",
        status: "Participant",
        prize: "Certificate of Participation",
        displaySchool: "Delhi Public School Raipur",
        certId: null
    },
    {
        name: "aadeep maheshwari",
        category: "stem",
        competitionName: "ATL Innovators Lab",
        school: "delhi_public_school_raipur",
        status: "Participant",
        prize: "Certificate of Participation",
        displaySchool: "Delhi Public School Raipur",
        certId: null
    },
    {
        name: "siddhant tiwari",
        category: "stem",
        competitionName: "ATL Innovators Lab",
        school: "army_public_school_jodhpur",
        status: "Winner",
        prize: "3rd Place - Bronze Medalist",
        displaySchool: "Army Public School Jodhpur",
        certId: "AKF2026-AIL-031"
    },
    {
        name: "dilkhush",
        category: "stem",
        competitionName: "ATL Innovators Lab",
        school: "army_public_school_jodhpur",
        status: "Winner",
        prize: "3rd Place - Bronze Medalist",
        displaySchool: "Army Public School Jodhpur",
        certId: "AKF2026-AIL-032"
    },
    {
        name: "dhruv",
        category: "stem",
        competitionName: "FutureTech League",
        school: "army_public_school_jodhpur",
        status: "Winner",
        prize: "3rd Place - Bronze Medalist",
        displaySchool: "Army Public School Jodhpur",
        certId: "AKF2026-FTL-032"
    },
    {
        name: "priyanshi kumari",
        category: "stem",
        competitionName: "FutureTech League",
        school: "army_public_school_jodhpur",
        status: "Winner",
        prize: "3rd Place - Bronze Medalist",
        displaySchool: "Army Public School Jodhpur",
        certId: "AKF2026-FTL-031"
    },
    {
        name: "sanvi pandit",
        category: "literary",
        competitionName: "Essay Writing Competition",
        school: "delhi_public_school_raipur",
        status: "Participant",
        prize: "Certificate of Participation",
        displaySchool: "Delhi Public School Raipur",
        certId: null
    },
    {
        name: "tanisha garg",
        category: "design",
        competitionName: "EcoVision 3D Challenge",
        school: "delhi_public_school_raipur",
        status: "Winner",
        prize: "3rd Place - Bronze Medalist",
        displaySchool: "Delhi Public School Raipur",
        certId: "AKF2026-EV3D-031"
    },
    {
        name: "riddhima r. kumar",
        category: "design",
        competitionName: "EcoVision 3D Challenge",
        school: "delhi_public_school_raipur",
        status: "Winner",
        prize: "3rd Place - Bronze Medalist",
        displaySchool: "Delhi Public School Raipur",
        certId: "AKF2026-EV3D-032"
    },
    {
        name: "moovika sahu",
        category: "design",
        competitionName: "EcoVision 3D Challenge",
        school: "delhi_public_school_raipur",
        status: "Participant",
        prize: "Certificate of Participation",
        displaySchool: "Delhi Public School Raipur",
        certId: null
    },
    {
        name: "namit lakhotia",
        category: "design",
        competitionName: "EcoVision 3D Challenge",
        school: "delhi_public_school_raipur",
        status: "Participant",
        prize: "Certificate of Participation",
        displaySchool: "Delhi Public School Raipur",
        certId: null
    },
    {
        name: "aarya singh",
        category: "literary",
        competitionName: "Story Writing Competition",
        school: "dps_raipur",
        status: "Participant",
        prize: "Certificate of Participation",
        displaySchool: "DPS Raipur",
        certId: null
    },
    {
        name: "ananya kishwani",
        category: "literary",
        competitionName: "Essay Writing Competition",
        school: "delhi_public_school_raipur",
        status: "Winner",
        prize: "3rd Place - Bronze Medalist",
        displaySchool: "Delhi Public School Raipur",
        certId: "AKF2026-EWC-031"
    },
    {
        name: "ananya kishwani",
        category: "literary",
        competitionName: "Story Writing Competition",
        school: "delhi_public_school",
        status: "Participant",
        prize: "Certificate of Participation",
        displaySchool: "Delhi public school",
        certId: null
    },
    {
        name: "rhea tiwari",
        category: "literary",
        competitionName: "Story Writing Competition",
        school: "delhi_public_school_raipur",
        status: "Winner",
        prize: "3rd Place - Bronze Medalist",
        displaySchool: "Delhi Public School Raipur",
        certId: "AKF2026-SWC-031"
    },
    {
        name: "ananya goyal",
        category: "quiz",
        competitionName: "Mathematics Quiz",
        school: "delhi_public_school_raipur",
        status: "Participant",
        prize: "Certificate of Participation",
        displaySchool: "Delhi public school Raipur",
        certId: null
    },
    {
        name: "9406266608",
        category: "quiz",
        competitionName: "Science Quiz",
        school: "delhi_public_school",
        status: "Participant",
        prize: "Certificate of Participation",
        displaySchool: "Delhi public school",
        certId: null
    },
    {
        name: "pahal jaiswal",
        category: "quiz",
        competitionName: "Mathematics Quiz",
        school: "dps_nava_raipur",
        status: "Participant",
        prize: "Certificate of Participation",
        displaySchool: "Dps Nava Raipur",
        certId: null
    },
    {
        name: "aishi roy",
        category: "quiz",
        competitionName: "Mathematics Quiz",
        school: "dps_nava_raipur",
        status: "Participant",
        prize: "Certificate of Participation",
        displaySchool: "Dps Nava Raipur",
        certId: null
    },
    {
        name: "7898900628",
        category: "design",
        competitionName: "Canva Design Contest",
        school: "delhi_public_school",
        status: "Participant",
        prize: "Certificate of Participation",
        displaySchool: "Delhi Public School",
        certId: null
    },
    {
        name: "harshit meshram",
        category: "design",
        competitionName: "Meme Design Competition",
        school: "delhi_public_school_raipur",
        status: "Participant",
        prize: "Certificate of Participation",
        displaySchool: "Delhi public school Raipur",
        certId: null
    },
    {
        name: "sirat kaur",
        category: "entrepreneurship",
        competitionName: "EcoRise Business Blueprint",
        school: "army_public_school_chandimandir",
        status: "Winner",
        prize: "2nd Place - Silver Medalist",
        displaySchool: "Army Public School, Chandimandir",
        certId: "AKF2026-ERB-031"
    },
    {
        name: "sirat kaur",
        category: "design",
        competitionName: "Meme Design Competition",
        school: "army_public_school_chandimandir",
        status: "Winner",
        prize: "3rd Place - Bronze Medalist",
        displaySchool: "Army Public School, Chandimandir",
        certId: "AKF2026-MDC-031"
    },
    {
        name: "divyansh agarwal",
        category: "quiz",
        competitionName: "Science Quiz",
        school: "delhi_public_school_raipur",
        status: "Participant",
        prize: "Certificate of Participation",
        displaySchool: "Delhi Public School Raipur",
        certId: null
    },
    {
        name: "laksh jain",
        category: "quiz",
        competitionName: "Science Quiz",
        school: "delhi_public_school_raipur",
        status: "Participant",
        prize: "Certificate of Participation",
        displaySchool: "Delhi Public School Raipur",
        certId: null
    },
    {
        name: "divyansh agarwal",
        category: "quiz",
        competitionName: "Mathematics Quiz",
        school: "delhi_public_school_raipur",
        status: "Participant",
        prize: "Certificate of Participation",
        displaySchool: "Delhi Public School Raipur",
        certId: null
    },
    {
        name: "laksh jain",
        category: "quiz",
        competitionName: "Mathematics Quiz",
        school: "delhi_public_school_raipur",
        status: "Participant",
        prize: "Certificate of Participation",
        displaySchool: "Delhi Public School Raipur",
        certId: null
    },
    {
        name: "neeru sharma",
        category: "literary",
        competitionName: "Poetry Writing Competition",
        school: "army_public_school_damana",
        status: "Participant",
        prize: "Certificate of Participation",
        displaySchool: "Army public school Damana",
        certId: "AKF2026-PWC-031"
    },
    {
        name: "aadya agrawal",
        category: "stem",
        competitionName: "ATL Innovators Lab",
        school: "delhi_public_school_raipur",
        status: "Participant",
        prize: "Certificate of Participation",
        displaySchool: "Delhi public school raipur",
        certId: null
    },
    {
        name: "anishka jain",
        category: "stem",
        competitionName: "ATL Innovators Lab",
        school: "delhi_public_school_raipur",
        status: "Participant",
        prize: "Certificate of Participation",
        displaySchool: "Delhi public school raipur",
        certId: null
    },
    {
        name: "meher mayani",
        category: "quiz",
        competitionName: "Current Affairs Quiz",
        school: "delhi_public_school_raipur",
        status: "Winner",
        prize: "3rd Place - Bronze Medalist",
        displaySchool: "Delhi Public School, Raipur",
        certId: "AKF2026-CAQ-031"
    },
    {
        name: "aadya agrawal",
        category: "quiz",
        competitionName: "Current Affairs Quiz",
        school: "delhi_public_school_raipur",
        status: "Winner",
        prize: "3rd Place - Bronze Medalist",
        displaySchool: "Delhi Public School, Raipur",
        certId: "AKF2026-CAQ-032"
    },
    {
        name: "meher mayani",
        category: "quiz",
        competitionName: "Science Quiz",
        school: "delhi_public_school_raipur",
        status: "Participant",
        prize: "Certificate of Participation",
        displaySchool: "Delhi Public School, Raipur",
        certId: null
    },
    {
        name: "aadya agrawal",
        category: "quiz",
        competitionName: "Science Quiz",
        school: "delhi_public_school_raipur",
        status: "Participant",
        prize: "Certificate of Participation",
        displaySchool: "Delhi Public School, Raipur",
        certId: null
    },
    {
        name: "meher mayani",
        category: "design",
        competitionName: "Magazine Design Competition",
        school: "delhi_public_school_raipur",
        status: "Participant",
        prize: "Certificate of Participation",
        displaySchool: "Delhi Public School, Raipur",
        certId: null
    },
    {
        name: "aadya agrawal",
        category: "design",
        competitionName: "Magazine Design Competition",
        school: "delhi_public_school_raipur",
        status: "Participant",
        prize: "Certificate of Participation",
        displaySchool: "Delhi Public School, Raipur",
        certId: null
    },
    {
        name: "anshika verma",
        category: "design",
        competitionName: "Canva Design Contest",
        school: "delhi_public_school",
        status: "Participant",
        prize: "Certificate of Participation",
        displaySchool: "Delhi Public School",
        certId: null
    },
    {
        name: "anshika verma",
        category: "design",
        competitionName: "Magazine Design Competition",
        school: "delhi_public_school_raipur",
        status: "Winner",
        prize: "3rd Place - Bronze Medalist",
        displaySchool: "Delhi Public School, Raipur",
        certId: "AKF2026-MGC-031"
    },
    {
        name: "tarush shashwati shukla",
        category: "design",
        competitionName: "Magazine Design Competition",
        school: "delhi_public_school_raipur",
        status: "Winner",
        prize: "3rd Place - Bronze Medalist",
        displaySchool: "Delhi Public School, Raipur",
        certId: "AKF2026-MGC-032"
    },
    {
        name: "miraaya vaishnav",
        category: "entrepreneurship",
        competitionName: "EcoRise Business Blueprint",
        school: "delhi_public_school_raipur",
        status: "Participant",
        prize: "Certificate of Participation",
        displaySchool: "Delhi Public School, Raipur",
        certId: null
    },
    {
        name: "vinayak aadi dash",
        category: "entrepreneurship",
        competitionName: "EcoRise Business Blueprint",
        school: "delhi_public_school_raipur",
        status: "Participant",
        prize: "Certificate of Participation",
        displaySchool: "Delhi Public School, Raipur",
        certId: null
    },
    {
        name: "miraaya vaishnav",
        category: "creative",
        competitionName: "Filmmaking Competition",
        school: "delhi_public_school_raipur",
        status: "Winner",
        prize: "3rd Place - Bronze Medalist",
        displaySchool: "Delhi Public School, Raipur",
        certId: "AKF2026-FLM-031"
    },
    {
        name: "vinayak aadi dash",
        category: "creative",
        competitionName: "Filmmaking Competition",
        school: "delhi_public_school_raipur",
        status: "Winner",
        prize: "3rd Place - Bronze Medalist",
        displaySchool: "Delhi Public School, Raipur",
        certId: "AKF2026-FLM-032"
    },
    {
        name: "arya agrawalla",
        category: "creative",
        competitionName: "Filmmaking Competition",
        school: "delhi_public_school_raipur",
        status: "Winner",
        prize: "3rd Place - Bronze Medalist",
        displaySchool: "Delhi Public School, Raipur",
        certId: "AKF2026-FLM-033"
    },
    {
        name: "vihaan mall",
        category: "creative",
        competitionName: "Filmmaking Competition",
        school: "delhi_public_school_raipur",
        status: "Winner",
        prize: "3rd Place - Bronze Medalist",
        displaySchool: "Delhi Public School, Raipur",
        certId: "AKF2026-FLM-034"
    },
    {
        name: "daksh arora",
        category: "creative",
        competitionName: "Filmmaking Competition",
        school: "delhi_public_school_raipur",
        status: "Winner",
        prize: "3rd Place - Bronze Medalist",
        displaySchool: "Delhi Public School, Raipur",
        certId: "AKF2026-FLM-035"
    },
    {
        name: "adit pandey",
        category: "quiz",
        competitionName: "Mathematics Quiz",
        school: "delhi_public_school_raipur",
        status: "Winner",
        prize: "3rd Place - Bronze Medalist",
        displaySchool: "Delhi Public School, Raipur",
        certId: "AKF2026-MQ-032"
    },
    {
        name: "aman nathani",
        category: "quiz",
        competitionName: "Mathematics Quiz",
        school: "delhi_public_school_raipur",
        status: "Winner",
        prize: "3rd Place - Bronze Medalist",
        displaySchool: "Delhi Public School, Raipur",
        certId: "AKF2026-MQ-031"
    },
    {
        name: "anant kedia",
        category: "stem",
        competitionName: "FutureTech League",
        school: "delhi_public_school_raipur",
        status: "Participant",
        prize: "Certificate of Participation",
        displaySchool: "Delhi Public School Raipur",
        certId: null
    },
    {
        name: "deeva chhablani",
        category: "design",
        competitionName: "EcoVision 3D Challenge",
        school: "delhi_public_school_raipur",
        status: "Participant",
        prize: "Certificate of Participation",
        displaySchool: "Delhi Public School Raipur",
        certId: null
    },
    {
        name: "palak gupta",
        category: "design",
        competitionName: "EcoVision 3D Challenge",
        school: "delhi_public_school_raipur",
        status: "Participant",
        prize: "Certificate of Participation",
        displaySchool: "Delhi Public School Raipur",
        certId: null
    },
    {
        name: "ishita chauhan",
        category: "literary",
        competitionName: "Story Writing Competition",
        school: "delhi_public_school",
        status: "Participant",
        prize: "Certificate of Participation",
        displaySchool: "Delhi Public School",
        certId: null
    },
    {
        name: "aryan kumar",
        category: "quiz",
        competitionName: "Science Quiz",
        school: "army_public_school_gorakhpur",
        status: "Winner",
        prize: "3rd Place - Bronze Medalist",
        displaySchool: "Army Public School Gorakhpur",
        certId: "AKF2026-SQ-031"
    },
    {
        name: "satyam singh",
        category: "quiz",
        competitionName: "Science Quiz",
        school: "army_public_school_gorakhpur",
        status: "Winner",
        prize: "3rd Place - Bronze Medalist",
        displaySchool: "Army Public School Gorakhpur",
        certId: "AKF2026-SQ-032"
    },
    {
        name: "nandani",
        category: "design",
        competitionName: "Canva Design Contest",
        school: "army_public_school_gorakhpur",
        status: "Winner",
        prize: "3rd Place - Bronze Medalist",
        displaySchool: "Army Public School Gorakhpur",
        certId: "AKF2026-CDC-031"
    },
    {
        name: "trijal pathak",
        category: "design",
        competitionName: "Canva Design Contest",
        school: "army_public_school_gorakhpur",
        status: "Winner",
        prize: "3rd Place - Bronze Medalist",
        displaySchool: "Army Public School Gorakhpur",
        certId: "AKF2026-CDC-032"
    },
    {
        name: "anay agrawal",
        category: "quiz",
        competitionName: "Science Quiz",
        school: "delhi_public_school",
        status: "Participant",
        prize: "Certificate of Participation",
        displaySchool: "Delhi Public School",
        certId: null
    },
    {
        name: "anay agrawal",
        category: "design",
        competitionName: "Canva Design Contest",
        school: "delhi_public_school",
        status: "Participant",
        prize: "Certificate of Participation",
        displaySchool: "Delhi Public School",
        certId: null
    },
    {
        name: "siddharth agrawal",
        category: "design",
        competitionName: "Canva Design Contest",
        school: "delhi_public_school_raipur_chhattisgarh",
        status: "Participant",
        prize: "Certificate of Participation",
        displaySchool: "Delhi Public School, Raipur, Chhattisgarh",
        certId: null
    },
    {
        name: "siddharth agrawal",
        category: "quiz",
        competitionName: "Mathematics Quiz",
        school: "delhi_public_school_raipur_chhattisgarh",
        status: "Participant",
        prize: "Certificate of Participation",
        displaySchool: "Delhi Public School, Raipur, Chhattisgarh",
        certId: null
    },
    {
        name: "anshika verma",
        category: "quiz",
        competitionName: "Mathematics Quiz",
        school: "delhi_public_school_raipur_chhattisgarh",
        status: "Participant",
        prize: "Certificate of Participation",
        displaySchool: "Delhi Public School, Raipur, Chhattisgarh",
        certId: null
    }
];

// ==========================================
// SHARED DATA EXPORT
// ==========================================
// Expose the canonical results/certificate database as a single source of truth so
// StudentPortal.html and verifycertificate.html can both read from this one file.
window.RESULTS_DB = result_announcer_2026_database;

// ==========================================
// 2. SECURITY: MATH CAPTCHA SYSTEM
// ==========================================
let result_announcer_2026_captchaAnswer = 0;

function result_announcer_2026_generateCaptcha() {
    // Generate two random numbers between 1 and 10
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    
    // Store the correct answer
    result_announcer_2026_captchaAnswer = num1 + num2;
    
    // Update the UI
    const mathDisplay = document.getElementById('result_announcer_2026_captcha_math');
    const inputField = document.getElementById('result_announcer_2026_captcha_input');
    
    if (mathDisplay && inputField) {
        mathDisplay.innerText = `${num1} + ${num2}`;
        inputField.value = ''; // Clear previous input
    }
}

// ==========================================
// 3. CORE LOGIC: FETCHING RESULTS
// ==========================================
// Note: This function is triggered by the onsubmit attribute in the HTML form
function fetchResultsLogic() {
    // A. Grab all the input values
    const rawName = document.getElementById('result_announcer_2026_studentName').value;
    const category = document.getElementById('result_announcer_2026_category').value;
    const school = document.getElementById('result_announcer_2026_school').value;
    const inputCaptcha = parseInt(document.getElementById('result_announcer_2026_captcha_input').value);
    
    // B. Clean up the text input (lowercase, remove extra spaces) to prevent simple typing errors
    const cleanName = rawName.trim().toLowerCase();

    // C. Grab all UI elements we need to show/hide
    const errorBox = document.getElementById('result_announcer_2026_error');
    const errorText = document.getElementById('result_announcer_2026_error_text');
    const loader = document.getElementById('result_announcer_2026_loader');
    const outputArea = document.getElementById('result_announcer_2026_outputArea');
    const btn = document.getElementById('result_announcer_2026_btn');

    // D. Reset UI state before starting a new search
    errorBox.classList.add('hidden_element');
    outputArea.classList.add('hidden_element');

    // E. Verify the Captcha First
    if (isNaN(inputCaptcha) || inputCaptcha !== result_announcer_2026_captchaAnswer) {
        errorText.innerText = "Security Check Failed: Incorrect math answer. Please try again.";
        errorBox.classList.remove('hidden_element');
        result_announcer_2026_generateCaptcha(); // Regenerate for security
        return; // Stop the function here
    }

    // F. Simulate a server delay (makes it feel like it's querying a massive database)
    loader.classList.add('active_loader');
    btn.disabled = true; 
    btn.style.opacity = "0.7"; 
    btn.innerText = "Querying Database...";

    setTimeout(() => {
        // Remove loader and reset button
        loader.classList.remove('active_loader');
        btn.disabled = false; 
        btn.style.opacity = "1"; 
        btn.innerHTML = `<svg style="width: 24px; height: 24px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg> Check Database Now`;

        // G. Search the database for an exact match
        const match = result_announcer_2026_database.find(r => 
            r.name === cleanName && 
            r.category === category && 
            r.school === school
        );

        // H. Display the outcome
        if (match) {
            // Determine styling based on whether they won or just participated
            let badgeHtml = '';
            let highlightClass = '';
            
            if (match.status === "Winner") {
                badgeHtml = `
                    <div class="badge_win_2026">
                        <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                        Verified Winner
                    </div>`;
                highlightClass = 'data_row_highlight_2026';
            } else {
                badgeHtml = `
                    <div class="badge_part_2026">
                        <svg style="width: 20px; height: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Verified Participant
                    </div>`;
            }

            // Inject the HTML directly into the page
            outputArea.innerHTML = `
                ${badgeHtml}
                <div class="data_grid_2026">
                    <div class="data_row_2026 data_row_full_2026 delay_1 ${highlightClass}">
                        <span class="label_2026">Student Name</span>
                        <span class="value_2026" style="font-size: 28px;">${rawName}</span>
                    </div>
                    <div class="data_row_2026 delay_2">
                        <span class="label_2026">Standing / Result</span>
                        <span class="value_2026 value_prize_2026">${match.prize}</span>
                    </div>
                    <div class="data_row_2026 delay_2">
                        <span class="label_2026">Registered School</span>
                        <span class="value_2026 value_school_2026">${match.displaySchool}</span>
                    </div>
                </div>
                <a href="${match.certLink}" class="download_btn_2026" target="_blank">
                    <svg style="width: 24px; height: 24px; position: relative; z-index: 2;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    <span style="position: relative; z-index: 2;">Download Official Certificate</span>
                </a>
            `;
            
            outputArea.classList.remove('hidden_element');
        } else {
            // Show error if no match is found
            errorText.innerText = "No secure record found. Please verify your exact spelling and selected dropdowns.";
            errorBox.classList.remove('hidden_element');
        }

        // Always regenerate the captcha after an attempt for security
        result_announcer_2026_generateCaptcha(); 

    }, 1200); // 1.2 second delay simulation
}


// ==========================================
// 4. UI INITIALIZATION & EVENT LISTENERS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {

    // This script is also loaded purely as a shared data source on other pages.
    // Only run the stand-alone Result Announcer UI wiring when its own form is present,
    // so it never double-binds the navbar/footer on StudentPortal or verifycertificate.
    if (!document.getElementById('result_announcer_2026_studentName')) return;

    // A. Initialize the Captcha on page load
    result_announcer_2026_generateCaptcha();

    // B. Mobile Hamburger Menu Toggle
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => { 
            navLinks.classList.toggle('open'); 
            
            // Animate the hamburger icon into an 'X'
            const spans = hamburger.querySelectorAll('span');
            if (navLinks.classList.contains('open')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }

    // C. FAQ Accordion Logic
    const faqButtons = document.querySelectorAll('.faq_button_2026');
    faqButtons.forEach(button => {
        button.addEventListener('click', () => {
            const faqItem = button.parentElement;
            const isActive = faqItem.classList.contains('active');
            
            // Close all other open FAQ items
            document.querySelectorAll('.faq_item_2026').forEach(item => {
                item.classList.remove('active');
                item.querySelector('.faq_button_2026').setAttribute('aria-expanded', 'false');
            });

            // Open the clicked one if it wasn't already open
            if (!isActive) {
                faqItem.classList.add('active');
                button.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // D. Initialize WebGL Footer Sky Animation
    initFooterSky();
});

// ==========================================
// 5. WEBGL FOOTER ANIMATION (Cosmetic)
// ==========================================
function initFooterSky() {
    const canvases = document.querySelectorAll('.webgl-sky');
    if (canvases.length === 0) return;
    
    canvases.forEach(canvas => {
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) { canvas.style.background = '#07090E'; return; }
      
      const vsSource = `attribute vec2 position; void main() { gl_Position = vec4(position, 0.0, 1.0); }`;
      const fsSource = `
        precision mediump float; uniform vec2 u_resolution; uniform float u_time;
        vec2 hash(vec2 p) { p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return -1.0 + 2.0 * fract(sin(p) * 43758.5453123); }
        float noise(vec2 p) {
            const float K1 = 0.366025404; const float K2 = 0.211324865;
            vec2 i = floor(p + (p.x + p.y) * K1); vec2 a = p - i + (i.x + i.y) * K2;
            vec2 o = (a.x > a.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec2 b = a - o + K2; vec2 c = a - 1.0 + 2.0 * K2;
            vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
            vec3 n = h * h * h * h * vec3(dot(a, hash(i + 0.0)), dot(b, hash(i + o)), dot(c, hash(i + 1.0)));
            return dot(n, vec3(70.0));
        }
        float fbm(vec2 uv) { float f = 0.0; vec2 p = uv; float w = 0.5; for(int i = 0; i < 4; i++) { f += w * noise(p); p *= 2.0; w *= 0.5; } return f; }
        void main() {
            vec2 uv = gl_FragCoord.xy / u_resolution.xy;
            vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
            float t = u_time * 0.05; 
            vec2 flow = vec2(fbm(p * 1.5 + vec2(t, t * 0.5)), fbm(p * 1.2 - vec2(t * 0.3, t)));
            float dCenter = length(p); float aCenter = atan(p.y, p.x);
            flow += vec2(sin(aCenter + t), cos(aCenter + t)) * exp(-dCenter * 1.5) * 1.5;
            vec2 brush_uv = p * 3.5 + flow * 2.0;
            float strokeVal = fbm(brush_uv * vec2(2.5, 1.0)); strokeVal += fbm(brush_uv * 8.0) * 0.2;
            vec3 bgDeep = vec3(0.03, 0.04, 0.05); vec3 darkNavy = vec3(0.05, 0.06, 0.09); vec3 accentBlue = vec3(0.08, 0.1, 0.15); vec3 paleHighlight = vec3(0.12, 0.15, 0.2);
            float colorMix = smoothstep(0.1, 0.9, strokeVal + flow.x * 0.2);
            vec3 skyColor = mix(bgDeep, darkNavy, smoothstep(0.0, 0.4, colorMix));
            skyColor = mix(skyColor, accentBlue, smoothstep(0.3, 0.7, colorMix));
            skyColor = mix(skyColor, paleHighlight, smoothstep(0.6, 1.0, colorMix));
            float vignette = length(uv - vec2(0.5));
            skyColor *= smoothstep(1.2, 0.3, vignette); skyColor *= 0.9; 
            
            // Gold particle stars
            float star = smoothstep(0.98, 1.0, noise(p * 50.0 + t * 5.0));
            skyColor += vec3(0.9, 0.7, 0.3) * star * 0.5;
            
            gl_FragColor = vec4(skyColor, 1.0);
        }
      `;
      
      function createShader(type, source) { const s = gl.createShader(type); gl.shaderSource(s, source); gl.compileShader(s); return s; }
      const vs = createShader(gl.VERTEX_SHADER, vsSource);
      const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
      const program = gl.createProgram(); gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
      
      const positionBuffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0,-1.0, 1.0,-1.0, -1.0,1.0, 1.0,-1.0, 1.0,1.0, -1.0,1.0]), gl.STATIC_DRAW);
      
      const positionLocation = gl.getAttribLocation(program, "position"); gl.enableVertexAttribArray(positionLocation); gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      const resolutionLocation = gl.getUniformLocation(program, "u_resolution"); const timeLocation = gl.getUniformLocation(program, "u_time");
      
      function resize() { const parent = canvas.parentElement; canvas.width = parent.offsetWidth || window.innerWidth; canvas.height = parent.offsetHeight || window.innerHeight; gl.viewport(0, 0, canvas.width, canvas.height); }
      const ro = new ResizeObserver(() => resize()); ro.observe(canvas.parentElement || document.body); resize();
      
      function render(time) { gl.useProgram(program); gl.uniform2f(resolutionLocation, canvas.width, canvas.height); gl.uniform1f(timeLocation, time * 0.001); gl.drawArrays(gl.TRIANGLES, 0, 6); requestAnimationFrame(render); }
      requestAnimationFrame(render);
    });
}