const TOTAL_STEPS = 15;
        const state = {
            currentStep: 0,
            totalSteps: TOTAL_STEPS,
            locked: false,
            data: {
                primary_contact_name: '',
                primary_contact_title: '',
                business_owner_name: '',
                contact_email: '',
                contact_phone: '',
                country_code: '+91',
                business_name: '',
                website_url: '',
                year_established: '',
                product_info: '',
                branch_locations: '',
                number_of_branches: '',
                number_of_employees: '',
                daily_staff_names: '',
                price_range: '',
                current_platforms: '',
                profile_urls: '',
                current_star_rating: '',
                current_total_reviews: '',
                target_platform: '',
                package_selection: '',
                advance_payment_agree: false,
                advance_payment_amount: '',
                payment_mode: '',
                advance_payment_timestamp: null,
                consent: false,
                consent_timestamp: null
            },
            files: {
                logo: null,           // <-- added back
                menu: [],
                cameraPhotos: []
            }
        };

        const steps = document.querySelectorAll('.step');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');
        const navActions = document.getElementById('navActions');
        const progressFill = document.getElementById('progressFill');
        const currentStepNum = document.getElementById('currentStepNum');
        const totalStepsNum = document.getElementById('totalStepsNum');
        const statusMsg = document.getElementById('statusMessage');
        const summaryGrid = document.getElementById('summaryGrid');
        const fileLogo = document.getElementById('fileLogo');
        const fileMenu = document.getElementById('fileMenu');
        const fileCamera = document.getElementById('fileCamera');
        const logoBadge = document.getElementById('logoBadge');
        const menuBadge = document.getElementById('menuBadge');
        const photoGallery = document.getElementById('photoGallery');
        const photoCountNum = document.getElementById('photoCountNum');
        const consentBusinessLabel = document.getElementById('consentBusinessLabel');
        const advancePaymentBusinessLabel = document.getElementById('advancePaymentBusinessLabel');
        const stepsWrapper = document.getElementById('stepsWrapper');
        const lockedBanner = document.getElementById('lockedBanner');

        // NEW: welcome overlay elements
        const welcomeOverlay = document.getElementById('welcomeOverlay');
        const welcomeName = document.getElementById('welcomeName');
        const welcomeRefNumber = document.getElementById('welcomeRefNumber');
        const closeWelcomeBtn = document.getElementById('closeWelcomeBtn');

        const inputs = {
            primaryContactName: document.getElementById('inputPrimaryContactName'),
            primaryContactTitle: document.getElementById('inputPrimaryContactTitle'),
            businessOwnerName: document.getElementById('inputBusinessOwnerName'),
            contactEmail: document.getElementById('inputContactEmail'),
            contactPhone: document.getElementById('inputContactPhone'),
            countryCode: document.getElementById('inputCountryCode'),
            businessName: document.getElementById('inputBusinessName'),
            websiteUrl: document.getElementById('inputWebsiteUrl'),
            yearEstablished: document.getElementById('inputYearEstablished'),
            productInfo: document.getElementById('inputProductInfo'),
            branchLocations: document.getElementById('inputBranchLocations'),
            numberOfBranches: document.getElementById('inputNumberOfBranches'),
            numberOfEmployees: document.getElementById('inputNumberOfEmployees'),
            dailyStaffNames: document.getElementById('inputDailyStaffNames'),
            priceRange: document.getElementById('inputPriceRange'),
            currentPlatforms: document.getElementById('inputCurrentPlatforms'),
            profileUrls: document.getElementById('inputProfileUrls'),
            currentStarRating: document.getElementById('inputCurrentStarRating'),
            currentTotalReviews: document.getElementById('inputCurrentTotalReviews'),
            targetPlatform: document.getElementById('inputTargetPlatform'),
            packageSelection: document.getElementById('inputPackageSelection'),
            advancePaymentAgree: document.getElementById('inputAdvancePaymentAgree'),
            advancePaymentAmount: document.getElementById('inputAdvancePaymentAmount'),
            paymentMode: document.getElementById('inputPaymentMode'),
            consentCheck: document.getElementById('inputConsentCheck')
        };

        const errEls = {
            primaryContactName: document.getElementById('errPrimaryContactName'),
            businessOwnerName: document.getElementById('errBusinessOwnerName'),
            contactEmail: document.getElementById('errContactEmail'),
            contactPhone: document.getElementById('errContactPhone'),
            businessName: document.getElementById('errBusinessName'),
            yearEstablished: document.getElementById('errYearEstablished'),
            productInfo: document.getElementById('errProductInfo'),
            branchLocations: document.getElementById('errBranchLocations'),
            numberOfBranches: document.getElementById('errNumberOfBranches'),
            numberOfEmployees: document.getElementById('errNumberOfEmployees'),
            priceRange: document.getElementById('errPriceRange'),
            currentPlatforms: document.getElementById('errCurrentPlatforms'),
            currentStarRating: document.getElementById('errCurrentStarRating'),
            currentTotalReviews: document.getElementById('errCurrentTotalReviews'),
            targetPlatform: document.getElementById('errTargetPlatform'),
            packageSelection: document.getElementById('errPackageSelection'),
            advancePaymentAgree: document.getElementById('errAdvancePaymentAgree'),
            advancePaymentAmount: document.getElementById('errAdvancePaymentAmount'),
            paymentMode: document.getElementById('errPaymentMode'),
            cameraPhotos: document.getElementById('errCameraPhotos'),
            consent: document.getElementById('errConsent')
        };

        totalStepsNum.textContent = TOTAL_STEPS;

        function hideAllErrors() { Object.values(errEls).forEach(el => el.classList.remove('show')); }

        // ---- consent timestamp capture ----
        // Records the exact moment the client checks the consent box, in a
        // human-readable local format. Cleared if they uncheck it. This value
        // travels with the rest of the form payload to the backend, where it
        // is stored in the Sheet and shown in both confirmation emails.
        inputs.consentCheck.addEventListener('change', function() {
            if (this.checked) {
                state.data.consent_timestamp = new Date().toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                });
            } else {
                state.data.consent_timestamp = null;
            }
            if (this.checked) errEls.consent.classList.remove('show');
        });

        // ---- advance payment agreement timestamp capture ----
        // Same pattern as the consent timestamp above: records the exact
        // moment the client agrees to the 35% advance payment. This travels
        // with the rest of the payload and is stored in the Sheet + emails
        // as proof of when the advance payment terms were agreed to.
        inputs.advancePaymentAgree.addEventListener('change', function() {
            if (this.checked) {
                state.data.advance_payment_timestamp = new Date().toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                });
            } else {
                state.data.advance_payment_timestamp = null;
            }
            if (this.checked) errEls.advancePaymentAgree.classList.remove('show');
        });

        // ---- payment mode selection ----
        // Clears the payment-mode error as soon as the client picks an
        // option, matching the pattern used by the other step-11 fields.
        inputs.paymentMode.addEventListener('change', function() {
            if (this.value) errEls.paymentMode.classList.remove('show');
        });

        // ---- update photo gallery ----
        function updatePhotoGallery() {
            photoGallery.innerHTML = '';
            state.files.cameraPhotos.forEach((file, idx) => {
                const thumb = document.createElement('div');
                thumb.className = 'photo-thumb';
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.alt = 'Photo ' + (idx + 1);
                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-photo';
                removeBtn.textContent = '✕';
                removeBtn.type = 'button';
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    state.files.cameraPhotos.splice(idx, 1);
                    updatePhotoGallery();
                    errEls.cameraPhotos.classList.remove('show');
                });
                thumb.appendChild(img);
                thumb.appendChild(removeBtn);
                photoGallery.appendChild(thumb);
            });
            photoCountNum.textContent = state.files.cameraPhotos.length;
            if (state.currentStep === 12) {
                if (state.files.cameraPhotos.length > 0) errEls.cameraPhotos.classList.remove('show');
            }
        }

        // ---- logo file handler ----
        fileLogo.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                state.files.logo = e.target.files[0];
                logoBadge.style.display = 'inline-block';
                logoBadge.textContent = '\u2705 ' + state.files.logo.name;
            } else {
                state.files.logo = null;
                logoBadge.style.display = 'none';
            }
        });

        // ---- camera file handler ----
        fileCamera.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                state.files.cameraPhotos.push(file);
                updatePhotoGallery();
                fileCamera.value = '';
                errEls.cameraPhotos.classList.remove('show');
            }
        });

        // ---- make entire camera box clickable ----
        const cameraDrop = document.getElementById('cameraDrop');
        cameraDrop.addEventListener('click', function(e) {
            // avoid double-triggering if the label/input itself was clicked
            if (e.target.id !== 'fileCamera') {
                fileCamera.click();
            }
        });

        // ---- menu file handler ----
        fileMenu.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                state.files.menu = Array.from(e.target.files);
                menuBadge.style.display = 'inline-block';
                menuBadge.textContent = '\u2705 ' + state.files.menu.length + ' file(s) selected';
            } else {
                state.files.menu = [];
                menuBadge.style.display = 'none';
            }
        });

        function validateStep(i) {
            hideAllErrors();
            let ok = true;
            switch (i) {
                case 0:
                    if (!inputs.primaryContactName.value.trim()) { errEls.primaryContactName.classList.add('show');
                        ok = false; }
                    break;
                case 1:
                    if (!inputs.businessOwnerName.value.trim()) { errEls.businessOwnerName.classList.add('show');
                        ok = false; }
                    break;
                case 2:
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputs.contactEmail.value.trim())) { errEls.contactEmail
                            .classList.add('show');
                        ok = false; }
                    const phoneVal = inputs.contactPhone.value.trim();
                    if (!/^\d{10}$/.test(phoneVal)) {
                        errEls.contactPhone.classList.add('show');
                        ok = false;
                    }
                    break;
                case 3:
                    if (!inputs.businessName.value.trim()) { errEls.businessName.classList.add('show');
                        ok = false; }
                    const yr = parseInt(inputs.yearEstablished.value);
                    if (!inputs.yearEstablished.value.trim() || yr < 1900 || yr > 2099) { errEls.yearEstablished
                            .classList.add('show');
                        ok = false; }
                    if (!inputs.productInfo.value.trim()) { errEls.productInfo.classList.add('show');
                        ok = false; }
                    break;
                case 4:
                    if (!inputs.branchLocations.value.trim()) { errEls.branchLocations.classList.add('show');
                        ok = false; }
                    if (!inputs.numberOfBranches.value.trim() || parseInt(inputs.numberOfBranches.value) < 1) { errEls
                            .numberOfBranches.classList.add('show');
                        ok = false; }
                    break;
                case 5:
                    if (!inputs.numberOfEmployees.value.trim() || parseInt(inputs.numberOfEmployees.value) < 1) { errEls
                            .numberOfEmployees.classList.add('show');
                        ok = false; }
                    break;
                case 6:
                    if (!inputs.priceRange.value.trim()) { errEls.priceRange.classList.add('show');
                        ok = false; }
                    break;
                case 7:
                    if (!inputs.currentPlatforms.value.trim()) { errEls.currentPlatforms.classList.add('show');
                        ok = false; }
                    break;
                case 8:
                    const rating = parseFloat(inputs.currentStarRating.value);
                    if (!inputs.currentStarRating.value || rating < 1 || rating > 5) { errEls.currentStarRating
                            .classList.add('show');
                        ok = false; }
                    if (!inputs.currentTotalReviews.value.trim() || parseInt(inputs.currentTotalReviews.value) < 0) { errEls
                            .currentTotalReviews.classList.add('show');
                        ok = false; }
                    break;
                case 9:
                    if (!inputs.targetPlatform.value) { errEls.targetPlatform.classList.add('show');
                        ok = false; }
                    break;
                case 10:
                    if (!inputs.packageSelection.value) { errEls.packageSelection.classList.add('show');
                        ok = false; }
                    break;
                case 11:
                    // ADVANCE PAYMENT: agreement checkbox + amount + payment mode all required
                    if (!inputs.advancePaymentAgree.checked) {
                        errEls.advancePaymentAgree.classList.add('show');
                        ok = false;
                    }
                    if (!inputs.advancePaymentAmount.value.trim()) {
                        errEls.advancePaymentAmount.classList.add('show');
                        ok = false;
                    }
                    if (!inputs.paymentMode.value) {
                        errEls.paymentMode.classList.add('show');
                        ok = false;
                    }
                    break;
                case 12:
                    // CAMERA REQUIRED: at least one photo
                    if (state.files.cameraPhotos.length === 0) {
                        errEls.cameraPhotos.classList.add('show');
                        ok = false;
                    }
                    // Logo is optional — no validation needed
                    break;
                case 13:
                    if (!inputs.consentCheck.checked) { errEls.consent.classList.add('show');
                        ok = false; }
                    break;
            }
            return ok;
        }

        function saveCurrentData() {
            state.data.primary_contact_name = inputs.primaryContactName.value.trim();
            state.data.primary_contact_title = inputs.primaryContactTitle.value.trim();
            state.data.business_owner_name = inputs.businessOwnerName.value.trim();
            state.data.contact_email = inputs.contactEmail.value.trim();
            state.data.contact_phone = inputs.contactPhone.value.trim();
            state.data.country_code = inputs.countryCode.value;
            state.data.business_name = inputs.businessName.value.trim();
            state.data.website_url = inputs.websiteUrl.value.trim();
            state.data.year_established = inputs.yearEstablished.value.trim();
            state.data.product_info = inputs.productInfo.value.trim();
            state.data.branch_locations = inputs.branchLocations.value.trim();
            state.data.number_of_branches = inputs.numberOfBranches.value.trim();
            state.data.number_of_employees = inputs.numberOfEmployees.value.trim();
            state.data.daily_staff_names = inputs.dailyStaffNames.value.trim();
            state.data.price_range = inputs.priceRange.value.trim();
            state.data.current_platforms = inputs.currentPlatforms.value.trim();
            state.data.profile_urls = inputs.profileUrls.value.trim();
            state.data.current_star_rating = inputs.currentStarRating.value.trim();
            state.data.current_total_reviews = inputs.currentTotalReviews.value.trim();
            state.data.target_platform = inputs.targetPlatform.value;
            state.data.package_selection = inputs.packageSelection.value;
            state.data.advance_payment_agree = inputs.advancePaymentAgree.checked;
            state.data.advance_payment_amount = inputs.advancePaymentAmount.value.trim();
            state.data.payment_mode = inputs.paymentMode.value;
            state.data.consent = inputs.consentCheck.checked;
            // consent_timestamp / advance_payment_timestamp are set/cleared directly by
            // their respective 'change' listeners above (not derived from an input value),
            // so they're left as-is here.
        }

        function renderSummary() {
            const d = state.data;
            const photoNames = state.files.cameraPhotos.map(f => f.name).join(', ') || 'None';
            const logoName = state.files.logo ? state.files.logo.name : 'None uploaded';
            const fields = [
                { label: 'Primary Contact Name', value: d.primary_contact_name },
                { label: 'Primary Contact Title', value: d.primary_contact_title || '\u2014' },
                { label: 'Business Owner', value: d.business_owner_name },
                { label: 'Contact Email', value: d.contact_email },
                { label: 'Contact Phone', value: d.contact_phone ? d.country_code + ' ' + d.contact_phone :
                    '\u2014' },
                { label: 'Business Name', value: d.business_name },
                { label: 'Website URL', value: d.website_url || '\u2014', full: true },
                { label: 'Year Established', value: d.year_established },
                { label: 'About Your Product(s)', value: d.product_info, full: true },
                { label: 'Branch Locations', value: d.branch_locations, full: true },
                { label: 'Number of Branches', value: d.number_of_branches },
                { label: 'Number of Employees', value: d.number_of_employees },
                { label: 'Daily Staff Names', value: d.daily_staff_names || '\u2014', full: true },
                { label: 'Price Range', value: d.price_range },
                { label: 'Current Platforms', value: d.current_platforms },
                { label: 'Profile URLs', value: d.profile_urls || '\u2014', full: true },
                { label: 'Current Star Rating', value: d.current_star_rating ? d.current_star_rating + ' \u2605' :
                        '\u2014' },
                { label: 'Total Reviews', value: d.current_total_reviews },
                { label: 'Target Platform', value: d.target_platform },
                { label: 'Package Selected', value: d.package_selection },
                { label: 'Advance Payment Agreed', value: d.advance_payment_agree ? '\u2705 Agreed (35%)' : '\u274C Not agreed' },
                { label: 'Advance Amount', value: d.advance_payment_amount || '\u2014' },
                { label: 'Payment Mode', value: d.payment_mode || '\u2014' },
                { label: 'Advance Agreed At', value: d.advance_payment_agree ? (d.advance_payment_timestamp || '\u2014') : '\u2014' },
                { label: 'Consent Signed', value: d.consent ? '\u2705 Agreed' : '\u274C Not signed' },
                { label: 'Consent Given At', value: d.consent ? (d.consent_timestamp || '\u2014') : '\u2014' },
                { label: 'Logo', value: logoName },
                { label: 'Photos Taken', value: state.files.cameraPhotos.length + ' photo(s)' },
                { label: 'Supporting Documents', value: state.files.menu.length > 0 ? state.files.menu.map(f => f
                        .name).join(', ') : 'None uploaded', full: true }
            ];
            summaryGrid.innerHTML = fields.map(f =>
                '<div class="summary-item ' + (f.full ? 'full' : '') + '">' +
                '<span class="s-label">' + f.label + '</span>' +
                '<span class="s-value ' + (!f.value || f.value === '\u2014' || f.value === 'None uploaded' || f
                    .value === 'None taken' ? 'na' : '') + '">' + f.value + '</span>' +
                '</div>'
            ).join('');
        }

        function goToStep(index) {
            if (state.locked) return; // form is finalized — no navigation at all
            if (index < 0 || index >= state.totalSteps) return;
            if (index > state.currentStep) {
                if (!validateStep(state.currentStep)) return;
                saveCurrentData();
                if (state.data.business_name) {
                    consentBusinessLabel.textContent = state.data.business_name;
                    advancePaymentBusinessLabel.textContent = state.data.business_name;
                }
            } else {
                saveCurrentData();
            }
            state.currentStep = index;
            steps.forEach((el, i) => el.classList.toggle('active', i === index));
            const progress = (index / (state.totalSteps - 1)) * 100;
            progressFill.style.width = progress + '%';
            currentStepNum.textContent = index + 1;
            prevBtn.disabled = index === 0;
            if (index === state.totalSteps - 1) {
                nextBtn.style.display = 'none';
                submitBtn.style.display = 'flex';
                renderSummary();
                setTimeout(() => submitBtn.focus(), 100);
            } else {
                nextBtn.style.display = 'flex';
                submitBtn.style.display = 'none';
                const inp = steps[index].querySelector('input, textarea, select');
                if (inp) setTimeout(() => inp.focus(), 150);
            }
            statusMsg.className = '';
            statusMsg.style.display = 'none';
            statusMsg.textContent = '';
        }

        // ---- lock the form after the client hits "Continue" on the
        // welcome card: no more edits, no more going back. The Back
        // button is visibly blurred + disabled and a banner explains why.
        function lockForm() {
            if (state.locked) return;
            state.locked = true;
            prevBtn.disabled = true;
            prevBtn.classList.add('locked-btn');
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'none';
            stepsWrapper.classList.add('locked');
            lockedBanner.classList.add('show');
        }

        nextBtn.addEventListener('click', () => goToStep(state.currentStep + 1));
        prevBtn.addEventListener('click', () => goToStep(state.currentStep - 1));
        document.addEventListener('keydown', e => {
            if (state.locked) return;
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'SELECT') {
                if (state.currentStep === state.totalSteps - 1 && submitBtn.style.display !== 'none') submitBtn
                .click();
                else if (state.currentStep < state.totalSteps - 1) nextBtn.click();
            }
        });

        const ONBOARDING_SCRIPT_URL =
            'https://script.google.com/macros/s/AKfycbwnlpE9dvjrIWauzutQLPcg2ocUdcYlamm3IjgWjMlozTD0FZA-0gflEM95-AeI-_X_jQ/exec';

        // Splash + water-drop
        const splash = document.getElementById('introSplash');
        const wizardCard = document.getElementById('app');
        wizardCard.style.opacity = '0';
        wizardCard.style.pointerEvents = 'none';
        setTimeout(() => {
            splash.style.transition = 'opacity 0.6s ease';
            splash.style.opacity = '0';
            splash.style.pointerEvents = 'none';
            setTimeout(() => {
                splash.style.display = 'none';
                wizardCard.style.opacity = '1';
                wizardCard.style.pointerEvents = 'all';
                wizardCard.classList.add('drop-in');
                wizardCard.addEventListener('animationend', () => wizardCard.classList.remove('drop-in'), { once: true });
            }, 620);
        }, 4800);

        goToStep(0);

        // ===== FIREWORKS =====
        const canvas = document.getElementById('fireworksCanvas');
        const ctx = canvas.getContext('2d');
        let fireworksActive = false,
            animationId = null,
            particles = [],
            fireworksTimeout = null;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Particle {
            constructor(x, y, color, velocity, size, life) {
                Object.assign(this, { x, y, color, velocity, size: size || 3, life: life || 1, decay: 0.008 + Math
                        .random() * 0.015, gravity: 0.05, friction: 0.98 });
            }
            update() {
                this.velocity.x *= this.friction;
                this.velocity.y *= this.friction;
                this.velocity.y += this.gravity;
                this.x += this.velocity.x;
                this.y += this.velocity.y;
                this.life -= this.decay;
                this.size *= 0.998;
            }
            draw() {
                ctx.save();
                ctx.globalAlpha = Math.max(this.life, 0);
                ctx.fillStyle = this.color;
                ctx.shadowBlur = 16;
                ctx.shadowColor = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, Math.max(this.size, 0.5), 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        function createExplosion(x, y) {
            const colors = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6', '#fb923c', '#2dd4bf'];
            for (let i = 0, count = 80 + Math.floor(Math.random() * 60); i < count; i++) {
                const angle = Math.random() * Math.PI * 2,
                    speed = 2 + Math.random() * 6;
                particles.push(new Particle(x, y, colors[Math.floor(Math.random() * colors.length)], {
                    x: Math.cos(angle) * speed * (0.5 + Math.random() * 0.6),
                    y: Math.sin(angle) * speed * (0.5 + Math.random() * 0.6)
                }, 2 + Math.random() * 4, 0.8 + Math.random() * 0.6));
            }
        }

        function launchFirework() {
            createExplosion(100 + Math.random() * (canvas.width - 200), 80 + Math.random() * (canvas.height * 0.5));
        }

        function animateFireworks() {
            if (!fireworksActive) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let alive = false;
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.update();
                if (p.life <= 0 || p.size < 0.2) particles.splice(i, 1);
                else {
                    p.draw();
                    alive = true;
                }
            }
            animationId = requestAnimationFrame(animateFireworks);
        }

        function startFireworks() {
            if (fireworksActive) return;
            fireworksActive = true;
            canvas.style.display = 'block';
            particles = [];
            if (animationId) cancelAnimationFrame(animationId);
            animateFireworks();

            function launchLoop() {
                if (!fireworksActive) return;
                launchFirework();
                setTimeout(launchLoop, 200 + Math.random() * 600);
            }
            launchLoop();
        }

        function stopFireworks() {
            fireworksActive = false;
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.style.display = 'none';
            particles = [];
            if (fireworksTimeout) {
                clearTimeout(fireworksTimeout);
                fireworksTimeout = null;
            }
        }

        // ===== SUBMIT =====
        submitBtn.addEventListener('click', async () => {
            saveCurrentData();
            const d = state.data;
            // Logo is optional – only check required fields + camera photos
            const allFilled = d.primary_contact_name && d.business_owner_name && d.contact_email &&
                d.contact_phone && d.business_name && d.year_established && d.product_info && d.branch_locations &&
                d.number_of_branches && d.number_of_employees && d.price_range && d.current_platforms &&
                d.current_star_rating && d.current_total_reviews && d.target_platform &&
                d.package_selection && d.advance_payment_agree && d.advance_payment_amount && d.payment_mode &&
                d.consent && state.files.cameraPhotos.length > 0; // <-- CAMERA REQUIRED

            if (!allFilled) {
                statusMsg.className = 'error';
                statusMsg.textContent = '\u274C Missing required fields. Please go back and complete all sections.';
                statusMsg.style.display = 'block';
                return;
            }
            submitBtn.disabled = true;
            submitBtn.textContent = '\u23F3 Submitting...';

            function fileToBase64(file) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve({
                        name: file.name,
                        mimeType: file.type,
                        data: reader.result.split(',')[1]
                    });
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            }

            try {
                const payload = { ...d, files: {} };

                if (state.files.logo) {
                    payload.files.logo = await fileToBase64(state.files.logo);
                }
                if (state.files.cameraPhotos.length > 0) {
                    payload.files.cameraPhotos = await Promise.all(state.files.cameraPhotos.map(fileToBase64));
                }
                if (state.files.menu && state.files.menu.length > 0) {
                    payload.files.menu = await Promise.all(state.files.menu.map(fileToBase64));
                }

                const response = await fetch(ONBOARDING_SCRIPT_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();
                if (result.success) {
                    const customerName = d.primary_contact_name || 'Guest';
                    welcomeName.textContent = customerName;
                    welcomeRefNumber.textContent = result.refNumber || '—';
                    welcomeOverlay.classList.add('show');

                    navActions.classList.add('submitted');

                    statusMsg.className = 'success';
                    statusMsg.textContent = '\uD83C\uDF89 Submitted! Reference: ' + result.refNumber;
                    statusMsg.style.display = 'block';
                    submitBtn.textContent = '\u2705 Submitted!';
                    submitBtn.disabled = true;

                    startFireworks();
                } else throw new Error(result.error || 'Submission failed.');
            } catch (error) {
                statusMsg.className = 'error';
                statusMsg.textContent = '\u274C Error: ' + error.message;
                statusMsg.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.textContent = '\uD83D\uDE80 Confirm & Submit';
            }
        });

        // ---- "Continue" on the welcome card now locks the form for good:
        // the client lands back on the (already-submitted) review screen,
        // but can no longer navigate, edit, or go back — matching the
        // "locked / read-only" behaviour requested.
        closeWelcomeBtn.addEventListener('click', () => {
            welcomeOverlay.classList.remove('show');
            lockForm();
        });

        welcomeOverlay.addEventListener('click', (e) => {
            if (e.target === welcomeOverlay) {
                welcomeOverlay.classList.remove('show');
                lockForm();
            }
        });

        // ===== SOUNDTRACK =====
      /* ===== WELCOME SOUND – Fixed Web Audio Chime ===== */

(function () {
  let soundPlayed = false;

  function doPlay(ctx) {
    const now = ctx.currentTime;
    // C4 – E4 – G4 – C5 ascending arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach(function (freq, i) {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = now + 0.1 + i * 0.18;   // slightly wider gap = cleaner arpeggio
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(0.28, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.55);
    });
    soundPlayed = true;   // ✅ moved here — only marked done after actual playback
  }

  function playWelcomeChime() {
    if (soundPlayed) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') {
        // ✅ Wait for resume to succeed before playing
        ctx.resume().then(function () { doPlay(ctx); }).catch(function () {});
      } else {
        doPlay(ctx);
      }
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }

  // ---- 1. Try on page load (works if browser allows autoplay) ----
  if (document.readyState === 'complete') {
    playWelcomeChime();
  } else {
    window.addEventListener('load', playWelcomeChime);
  }

  // ---- 2. Fallback: first click or tap (always works) ----
  function onInteract() {
    playWelcomeChime();
    document.removeEventListener('click',      onInteract);
    document.removeEventListener('touchstart', onInteract);
  }
  document.addEventListener('click',      onInteract);
  document.addEventListener('touchstart', onInteract);

  // ---- 3. Extra: play when welcome overlay appears ----
  window.addEventListener('load', function () {
    const overlay = document.getElementById('welcomeOverlay');
    if (overlay) {
      overlay.addEventListener('click', function handler() {
        playWelcomeChime();
        overlay.removeEventListener('click', handler);
      });
    }
  });

})();
