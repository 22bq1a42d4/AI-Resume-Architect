// script.js - New frontend logic for the wizard UI and advanced rendering.
document.addEventListener('DOMContentLoaded', () => {

    // --- STATE MANAGEMENT ---
    let userInfo = { name: '', role: '', job: '', email: '', phone: '', hiringManager: '', companyName: '', companyAddress: '' };
    let extractedResumeText = "";
    let currentStep = 1;

    // --- DOM ELEMENT CACHE ---
    const dom = {
        wizardContainer: document.getElementById('wizard-container'),
        outputArea: document.getElementById('output-area'),
        steps: { step1: document.getElementById('step-1'), step2: document.getElementById('step-2'), step3: document.getElementById('step-3') },
        inputs: {
            name: document.getElementById('name'), role: document.getElementById('role'), job: document.getElementById('job'),
            resumeUpload: document.getElementById('resumeUpload'), hiringManager: document.getElementById('hiringManager'),
            companyName: document.getElementById('companyName'), companyAddress: document.getElementById('companyAddress')
        },
        buttons: {
            next1: document.getElementById('next-btn-1'),
            extract: document.getElementById('extractBtn'),
            generateResume: document.getElementById('generate-resume-btn'),
            goToCoverLetterStep: document.getElementById('go-to-cover-letter-step-btn'),
            generateCoverLetter: document.getElementById('generate-cover-letter-btn'),
            downloadPdf: document.getElementById('download-pdf-btn'),
            startOver: document.getElementById('start-over-btn'),
            notificationClose: document.getElementById('notification-close-btn')
        },
        displays: {
            infoSummary: document.getElementById('info-summary'), extractStatus: document.getElementById('extract-status'),
            generationStatus: document.getElementById('generation-status'), resumeOutputContainer: document.getElementById('resume-output-container'),
            notificationToast: document.getElementById('notification-toast'), notificationMessage: document.getElementById('notification-message')
        },
        auroraGlow: document.querySelector('.aurora-glow')
    };

    // --- INTERACTIVE EFFECTS ---
    dom.wizardContainer.addEventListener('mousemove', (e) => {
        const rect = dom.wizardContainer.getBoundingClientRect();
        dom.auroraGlow.style.transform = `translate(${e.clientX - rect.left - 200}px, ${e.clientY - rect.top - 200}px)`;
    });

    // --- NOTIFICATION SYSTEM ---
    const showNotification = (message) => {
        dom.displays.notificationMessage.innerHTML = message;
        dom.displays.notificationToast.classList.remove('hidden');
        setTimeout(() => dom.displays.notificationToast.classList.remove('translate-y-[150%]'), 50);
    };
    const hideNotification = () => {
        dom.displays.notificationToast.classList.add('translate-y-[150%]');
        setTimeout(() => dom.displays.notificationToast.classList.add('hidden'), 500);
    };
    dom.buttons.notificationClose.addEventListener('click', hideNotification);

    // --- WIZARD NAVIGATION ---
    const goToStep = (nextStep) => {
        const currentStepEl = dom.steps[`step${currentStep}`];
        const nextStepEl = dom.steps[`step${nextStep}`];
        if (!currentStepEl || !nextStepEl) return;
        currentStepEl.classList.remove('active');
        currentStepEl.style.transform = 'rotateY(-90deg) scale(0.9)';
        setTimeout(() => { nextStepEl.classList.add('active'); }, 250);
        currentStep = nextStep;
    };

    dom.buttons.next1.addEventListener('click', () => {
        userInfo.name = dom.inputs.name.value.trim();
        userInfo.role = dom.inputs.role.value.trim();
        userInfo.job = dom.inputs.job.value.trim();
        if (!userInfo.name || !userInfo.role) { alert('Please fill out your Name and Target Role.'); return; }
        dom.displays.infoSummary.innerText = `Name: ${userInfo.name} | Target Role: ${userInfo.role}`;
        goToStep(2);
    });

    dom.buttons.goToCoverLetterStep.addEventListener('click', () => goToStep(3));

    // --- FILE & CONTACT EXTRACTION ---
    dom.buttons.extract.addEventListener('click', async () => {
        const file = dom.inputs.resumeUpload.files[0];
        if (!file) { dom.displays.extractStatus.innerHTML = `<span class="text-amber-400">Please choose a file first.</span>`; return; }
        dom.displays.extractStatus.innerHTML = `⏳ Extracting text...`;
        dom.buttons.extract.disabled = true;
        try {
            const text = await extractTextFromFile(file);
            extractedResumeText = text;
            dom.displays.extractStatus.innerHTML = `<span class="text-green-400">✅ Resume text extracted. Now extracting contact info...</span>`;
            await extractContactInfo(text);
            checkForAliasedLinks(text);
        } catch (err) {
            dom.displays.extractStatus.innerHTML = `<span class="text-red-400">❌ Error: ${err.message}</span>`;
        } finally {
            dom.buttons.extract.disabled = false;
        }
    });

    async function extractContactInfo(resumeText) {
        const response = await fetch('/api/extract-contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resumeText })
        });
        if (!response.ok) {
            dom.displays.extractStatus.innerHTML += ` <span class="text-red-400">Could not extract contact info.</span>`;
            return;
        }
        const data = await response.json();
        userInfo.email = data.email || '';
        userInfo.phone = data.phone || '';
        if (data.name && !dom.inputs.name.value) {
            dom.inputs.name.value = data.name;
            userInfo.name = data.name;
        }
        dom.displays.extractStatus.innerHTML = `<span class="text-green-400">✅ Contact info extracted successfully!</span>`;
    }

    function checkForAliasedLinks(text) {
        const keywords = ["linkedin", "github", "portfolio", "website", "blog"];
        const foundKeywords = keywords.filter(kw => new RegExp(`\\b${kw}\\b`, 'i').test(text));
        if (foundKeywords.length > 0 && !/https?:\/\/[^\s,.]+/g.test(text)) {
            const keywordList = foundKeywords.map(kw => kw.charAt(0).toUpperCase() + kw.slice(1)).join(', ');
            showNotification(`We noticed your resume mentions: <strong class="text-amber-300">${keywordList}</strong>, but doesn't include the full URLs. For best ATS results, use complete links like "https://linkedin.com/in/your-name".`);
        }
    }

    async function extractTextFromFile(file) {
        const fileName = file.name.toLowerCase();
        if (fileName.endsWith(".pdf")) {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let text = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                text += (await page.getTextContent()).items.map(item => item.str).join(" ");
            }
            return text;
        } else if (fileName.endsWith(".docx")) {
            return (await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })).value;
        }
        throw new Error("Unsupported file type.");
    }

    // --- CORE GENERATION LOGIC ---
    dom.buttons.generateResume.addEventListener('click', () => generateDocument('resume'));
    dom.buttons.generateCoverLetter.addEventListener('click', () => {
        userInfo.hiringManager = dom.inputs.hiringManager.value.trim();
        userInfo.companyName = dom.inputs.companyName.value.trim();
        userInfo.companyAddress = dom.inputs.companyAddress.value.trim();
        if (!userInfo.companyName) { alert("Please enter the Company Name."); return; }
        generateDocument('cover');
    });

    async function generateDocument(type) {
        dom.wizardContainer.style.display = 'none';
        dom.outputArea.style.display = 'grid';
        dom.displays.generationStatus.style.display = 'flex';
        dom.displays.resumeOutputContainer.style.display = 'none';
        dom.displays.generationStatus.innerHTML = `<div class="flex flex-col items-center justify-center gap-6"><div class="relative h-16 w-16"><div class="absolute inset-0 border-4 border-sky-500/30 rounded-full"></div><div class="absolute inset-0 border-t-4 border-sky-500 rounded-full animate-spin" style="animation-duration: 1s;"></div></div><p class="text-2xl text-slate-300 font-medium tracking-wider">Architecting your document...</p></div>`;

        let prompt;
        if (type === 'resume') {
            prompt = `Generate a polished, ATS-friendly resume for ${userInfo.name} applying for the role of ${userInfo.role}.`;
        } else {
            prompt = `Write a professional cover letter for ${userInfo.name} applying for the role of ${userInfo.role} at ${userInfo.companyName}.
- Applicant Name: ${userInfo.name}
- Applicant Email: ${userInfo.email}
- Applicant Phone: ${userInfo.phone}
- Hiring Manager: ${userInfo.hiringManager || 'Hiring Team'}
- Company Name: ${userInfo.companyName}
- Company Address: ${userInfo.companyAddress}`;
        }
        prompt += `\n\nJob Description:\n${userInfo.job}`;
        if (extractedResumeText) {
            prompt += `\n\nExisting Resume Context:\n${extractedResumeText}`;
        }

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, type }),
            });
            if (!response.ok) throw new Error((await response.json()).error || 'API request failed');
            const data = await response.json();
            renderOutput(data.output, type);
        } catch (err) {
            dom.displays.generationStatus.innerHTML = `<p class="text-xl text-red-400">❌ Error: ${err.message}</p>`;
        }
    }
    
    // --- OUTPUT RENDERING & PDF EXPORT ---
    function renderOutput(markdownText, type) {
        dom.displays.generationStatus.style.display = 'none';
        dom.displays.resumeOutputContainer.style.display = 'block';
        dom.displays.resumeOutputContainer.innerHTML = parseMarkdownToHtml(markdownText, type);
    }

    function parseMarkdownToHtml(text, type) {
        const linkRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])|(\bwww\.[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])|(\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b)/ig;
        text = text.replace(linkRegex, (match, url, protocol, www, email) => {
            if (email) return `<a href="mailto:${email}" class="text-sky-600 hover:underline font-medium">${email}</a>`;
            const fullUrl = www ? `http://${match}` : match;
            return `<a href="${fullUrl}" target="_blank" rel="noopener noreferrer" class="text-sky-600 hover:underline font-medium">${match}</a>`;
        });

        if (type === 'resume') {
            const parts = text.split('---[COLUMN_BREAK]---');
            const leftColumn = parts[0] || '';
            const rightColumn = parts[1] || '';
            
            const parseColumn = (columnText) => {
                return columnText
                    .replace(/^# (.*$)/gim, '<h1 class="text-5xl font-bold text-center mb-1 tracking-tight text-gray-900">$1</h1>')
                    .replace(/^(Location.*$)/gim, '<div class="text-center text-gray-500 text-sm mb-8">$1</div>')
                    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold border-b-2 border-gray-200 mt-8 pb-2 mb-4 tracking-normal text-gray-800">$1</h2>')
                    .replace(/^\* (.*$)/gim, '<li class="mb-3 ml-5">$1</li>')
                    .replace(/<\/li>\s*<li/g, '</li><li')
                    .replace(/(<li.*<\/li>)/gs, (match) => `<ul class="list-disc list-outside text-gray-700">${match}</ul>`);
            };

            return `<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div class="md:col-span-2 text-left">${parseColumn(leftColumn).replace(/\n/g, '<br>')}</div>
                        <div class="md:col-span-1 text-left">${parseColumn(rightColumn).replace(/\n/g, '<br>')}</div>
                    </div>`;
        } else {
            return `<div class="text-gray-800 text-lg">${text.replace(/\n\n/g, '</p><p class="mt-6">').replace(/\n/g, '<br>')}</div>`;
        }
    }

    dom.buttons.downloadPdf.addEventListener('click', () => {
        const element = dom.displays.resumeOutputContainer;
        const opt = {
            margin: 0.5, filename: `${userInfo.name.replace(/\s+/g, '_')}_document.pdf`,
            image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    });

    // --- RESET WORKFLOW ---
    dom.buttons.startOver.addEventListener('click', () => {
        userInfo = { name: '', role: '', job: '', email: '', phone: '', hiringManager: '', companyName: '', companyAddress: '' };
        extractedResumeText = "";
        Object.values(dom.inputs).forEach(input => input.value = '');
        dom.displays.extractStatus.textContent = '';
        dom.displays.resumeOutputContainer.innerHTML = '';
        dom.wizardContainer.style.display = 'block';
        dom.outputArea.style.display = 'none';
        hideNotification();
        
        const step1 = dom.steps.step1;
        Object.values(dom.steps).forEach(step => {
            step.classList.remove('active');
            step.style.transform = 'rotateY(90deg) scale(0.9)';
        });
        step1.classList.add('active');
        step1.style.transform = 'rotateY(0deg) scale(1)';
        currentStep = 1;
    });
});
