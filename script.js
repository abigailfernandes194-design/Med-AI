/* =====================================================
   MEDAI JAVASCRIPT
===================================================== */

document.addEventListener("DOMContentLoaded", function () {


    /* =================================================
       MOBILE NAVIGATION
    ================================================= */

    const menuBtn = document.getElementById("menuBtn");
    const navLinks = document.getElementById("navLinks");

    menuBtn.addEventListener("click", function () {

        navLinks.classList.toggle("active");

    });


    // Close mobile menu after clicking a link

    document.querySelectorAll(".nav-links a").forEach(function (link) {

        link.addEventListener("click", function () {

            navLinks.classList.remove("active");

        });

    });


    /* =================================================
       SYMPTOM CHECKER
    ================================================= */

    const analyzeBtn =
        document.getElementById("analyzeBtn");

    const clearBtn =
        document.getElementById("clearBtn");

    const resultBox =
        document.getElementById("resultBox");


    /*
       Knowledge Base

       Each condition has a group of symptoms.

       The system calculates how many of the condition's
       symptoms were selected and chooses the strongest
       match.

       This is a demonstration of an AI-inspired
       rule/scoring system, NOT a medical diagnostic tool.
    */

    const conditions = [

        {
            name: "Common Cold",
            symptoms: [
                "cold",
                "cough",
                "sorethroat"
            ],
            advice:
                "Rest, stay hydrated and maintain good hygiene. " +
                "Consult a healthcare professional if symptoms " +
                "persist or become severe.",
            icon: "🤧"
        },


        {
            name: "Flu-like Illness",
            symptoms: [
                "fever",
                "cough",
                "fatigue",
                "bodypain",
                "headache"
            ],
            advice:
                "Rest and drink plenty of fluids. Monitor your " +
                "symptoms and seek professional medical advice " +
                "if symptoms are severe or persistent.",
            icon: "🌡️"
        },


        {
            name: "Possible Respiratory Infection",
            symptoms: [
                "fever",
                "cough",
                "sorethroat",
                "fatigue"
            ],
            advice:
                "Rest, stay hydrated and monitor your symptoms. " +
                "A healthcare professional can determine whether " +
                "testing or treatment is necessary.",
            icon: "🫁"
        },


        {
            name: "Possible Tension Headache / Fatigue",
            symptoms: [
                "headache",
                "fatigue",
                "dizziness"
            ],
            advice:
                "Get adequate rest, stay hydrated and take regular " +
                "breaks from screens. Seek medical advice if the " +
                "headache is severe, sudden or recurring.",
            icon: "🤕"
        },


        {
            name: "Possible Digestive Problem",
            symptoms: [
                "stomach",
                "nausea"
            ],
            advice:
                "Stay hydrated and consider eating light meals. " +
                "Seek medical advice if abdominal pain is severe " +
                "or persistent.",
            icon: "🤢"
        },


        {
            name: "Possible Skin Irritation",
            symptoms: [
                "rash",
                "itching"
            ],
            advice:
                "Avoid known irritants and keep the affected area " +
                "clean. Consult a healthcare professional if the " +
                "rash spreads, becomes painful or persists.",
            icon: "🔴"
        },


        {
            name: "Possible Viral-like Illness",
            symptoms: [
                "fever",
                "fatigue",
                "headache",
                "bodypain"
            ],
            advice:
                "Rest, stay hydrated and monitor your symptoms. " +
                "Consult a healthcare professional for proper evaluation.",
            icon: "🩺"
        }

    ];


    /* =================================================
       ANALYZE BUTTON
    ================================================= */

    analyzeBtn.addEventListener("click", function () {


        // Find checked symptoms

        const checked =
            document.querySelectorAll(
                '.symptoms-grid input[type="checkbox"]:checked'
            );


        // No symptoms

        if (checked.length === 0) {

            resultBox.innerHTML = `

                <div class="robot">
                    ⚠️
                </div>

                <h2>
                    No Symptoms Selected
                </h2>

                <p>
                    Please select at least one symptom
                    before clicking Analyze Symptoms.
                </p>

            `;

            return;
        }


        // Convert checkboxes to array

        const selectedSymptoms =
            Array.from(checked).map(function (checkbox) {

                return checkbox.value;

            });


        /*
           Calculate condition scores.
        */

        let matches = [];


        conditions.forEach(function (condition) {

            let matchedSymptoms = [];

            condition.symptoms.forEach(function (symptom) {

                if (selectedSymptoms.includes(symptom)) {

                    matchedSymptoms.push(symptom);

                }

            });


            if (matchedSymptoms.length > 0) {

                /*
                   Percentage match between selected symptoms
                   and the condition's symptom set.
                */

                const score =
                    Math.round(
                        (matchedSymptoms.length /
                            condition.symptoms.length) * 100
                    );


                matches.push({

                    condition: condition,

                    matchedSymptoms: matchedSymptoms,

                    score: score

                });

            }

        });


        /*
           Sort results from highest match to lowest.
        */

        matches.sort(function (a, b) {

            return b.score - a.score;

        });


        // Best match

        const bestMatch = matches[0];


        /*
           If there is no matching condition.
        */

        if (!bestMatch) {

            resultBox.innerHTML = `

                <div class="robot">
                    🤖
                </div>

                <h2>
                    No Clear Match
                </h2>

                <p>
                    The selected symptoms do not match a
                    condition in our demonstration knowledge base.
                </p>

                <div class="selected-list">

                    <strong>
                        Selected Symptoms:
                    </strong>

                    <p>
                        ${selectedSymptoms.join(", ")}
                    </p>

                </div>

            `;

            return;

        }


        /* =================================================
           DISPLAY RESULT
        ================================================= */

        resultBox.innerHTML = `

            <div class="robot">
                ${bestMatch.condition.icon}
            </div>

            <h2>
                Possible Condition
            </h2>

            <div class="result-condition">

                ${bestMatch.condition.name}

            </div>


            <div class="match-score">

                AI symptom match:
                <strong>
                    ${bestMatch.score}%
                </strong>

            </div>


            <div class="remedy">

                <strong>
                    💡 General Care Suggestion
                </strong>

                <p>

                    ${bestMatch.condition.advice}

                </p>

            </div>


            <div class="selected-list">

                <strong>
                    Symptoms You Selected:
                </strong>

                <p>

                    ${selectedSymptoms.join(", ")}

                </p>

            </div>

        `;


        /*
           Smoothly scroll result into view on smaller screens.
        */

        if (window.innerWidth <= 900) {

            resultBox.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }

    });


    /* =================================================
       CLEAR SYMPTOMS
    ================================================= */

    clearBtn.addEventListener("click", function () {


        document
            .querySelectorAll(
                '.symptoms-grid input[type="checkbox"]'
            )
            .forEach(function (checkbox) {

                checkbox.checked = false;

            });


        resultBox.innerHTML = `

            <div class="robot">
                🤖
            </div>

            <h2>
                AI Health Assistant
            </h2>

            <p>
                Select your symptoms and click
                <strong>Analyze Symptoms</strong>
                to receive a result.
            </p>

        `;

    });


    /* =================================================
       APPOINTMENT FORM
    ================================================= */

    const appointmentForm =
        document.getElementById("appointmentForm");


    appointmentForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const name =
                document.getElementById("patientName").value;


            document.getElementById(
                "appointmentMessage"
            ).innerHTML =

                `✅ Appointment request submitted successfully for ${name}.`;


            appointmentForm.reset();

        }
    );


    /* =================================================
       REGISTRATION FORM
    ================================================= */

    const registrationForm =
        document.getElementById("registrationForm");


    registrationForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            document.getElementById(
                "registrationMessage"
            ).innerHTML =

                "✅ Patient registration completed successfully!";


            registrationForm.reset();

        }
    );

});


/* =====================================================
   STAFF PROFILE
===================================================== */

function showStaff(
    name,
    speciality,
    experience,
    availability
) {


    const modal =
        document.getElementById("staffModal");


    const details =
        document.getElementById("staffDetails");


    details.innerHTML = `

        <div class="doctor">

            👨‍⚕️

        </div>


        <h2>

            ${name}

        </h2>


        <p class="speciality">

            ${speciality}

        </p>


        <p>

            ${experience}

        </p>


        <p>

            Available:
            ${availability}

        </p>


        <br>


        <p>

            This staff profile is part of the
            MedAI demonstration hospital database.

        </p>

    `;


    modal.style.display = "flex";

}


/* =====================================================
   CLOSE STAFF MODAL
===================================================== */

function closeModal() {

    document.getElementById(
        "staffModal"
    ).style.display = "none";

}


window.addEventListener(
    "click",
    function (event) {

        const modal =
            document.getElementById("staffModal");


        if (event.target === modal) {

            modal.style.display = "none";

        }

    }
);