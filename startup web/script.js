// DOM Elements
const appContent = document.getElementById('app-content');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.getElementById('nav-links');

// Mobile Menu Toggle
mobileMenuBtn.addEventListener('click', () => {
    const activeNav = document.querySelector('.navbar').style.display !== 'none'
        ? document.getElementById('nav-links')
        : document.querySelector('.admin-navbar .nav-links');
    if (activeNav) activeNav.classList.toggle('show');
});

// Hide mobile menu on link click
document.querySelectorAll('.nav-links').forEach(nav => {
    nav.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            nav.classList.remove('show');
        }
    });
});

// Authentication State
let isAuthenticated = false;
let userRole = 'none'; // 'none', 'customer', 'admin'

// Routing
const routes = {
    home: renderHome,
    projects: renderProjects,
    custom: renderCustomRequest,
    contact: renderContact,
    detail: renderProjectDetail,
    login: renderLogin
};

async function navigateTo(route, param = null, pushState = true) {
    // Close mobile menus on navigation
    if (navLinks) navLinks.classList.remove('show');
    const adminNav = document.querySelector('.admin-navbar .nav-links');
    if (adminNav) adminNav.classList.remove('show');

    const publicRoutes = ['home', 'projects', 'custom', 'contact', 'detail', 'login'];
    if (!isAuthenticated && !publicRoutes.includes(route)) {
        route = 'login';
    }

    if (pushState) {
        history.pushState({ route, param }, '', `#${route}${param ? '-' + param : ''}`);
    }

    // Toggle layout visibility based on route and role
    const navbar = document.querySelector('.navbar');
    const adminNavbar = document.querySelector('.admin-navbar');
    const footer = document.querySelector('.footer');
    const floatingWhatsApp = document.querySelector('.floating-whatsapp');
    const backBtn = document.getElementById('back-button-container');

    if (route === 'login') {
        if (navbar) navbar.style.display = 'block';
        if (navLinks) navLinks.style.display = 'none'; // Hide all links
        if (footer) footer.style.display = 'block';
        if (floatingWhatsApp) floatingWhatsApp.style.display = 'none';
        if (backBtn) backBtn.style.display = 'none';
        document.body.classList.remove('customer-bg');
    } else {
        if (navLinks) navLinks.style.display = ''; // Restore links on other pages
        if (navbar) navbar.style.display = 'block';
        if (footer) footer.style.display = 'block';
        if (floatingWhatsApp) floatingWhatsApp.style.display = 'flex';
        // Show back button only if not on home
        if (backBtn) backBtn.style.display = route === 'home' ? 'none' : 'block';
        document.body.classList.add('customer-bg');
    }

    // Update Navbar buttons based on auth state
    const loginBtn = document.getElementById('login-nav-btn');
    const logoutBtn = document.getElementById('logout-nav-btn');
    const adminDashLink = document.getElementById('admin-dash-link');

    if (loginBtn && logoutBtn) {
        if (isAuthenticated) {
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'block';
            // Show admin dash link only if user is admin
            if (adminDashLink) {
                adminDashLink.style.display = userRole === 'admin' ? 'block' : 'none';
            }
        } else {
            loginBtn.style.display = 'block';
            logoutBtn.style.display = 'none';
            if (adminDashLink) adminDashLink.style.display = 'none';
        }
    }

    // Update active nav link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        const onclickAttr = link.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(`navigateTo('${route}'`)) {
            link.classList.add('active');
        }
    });

    // Inject contact info dynamically
    await injectContactInfo();

    // Render corresponding view
    if (routes[route]) {
        window.scrollTo(0, 0);
        appContent.innerHTML = '<div style="text-align:center; padding: 5rem;"><i class="fa-solid fa-spinner fa-spin fa-3x" style="color:var(--primary-color)"></i><p class="mt-2">Loading...</p></div>';
        await routes[route](param);
    }
}

window.navigateTo = navigateTo;

window.onpopstate = function (event) {
    if (event.state) {
        navigateTo(event.state.route, event.state.param, false);
    } else {
        navigateTo('home', null, false);
    }
};

window.goBack = function () {
    window.history.back();
};

// Initial Load — let Firebase decide routing
document.addEventListener('DOMContentLoaded', async () => {
    // Show loading spinner while Firebase checks auth state
    appContent.innerHTML = '<div style="text-align:center; padding: 5rem;"><i class="fa-solid fa-spinner fa-spin fa-3x" style="color:var(--primary-color)"></i><p style="margin-top:1rem;">Loading...</p></div>';

    await injectContactInfo();

    // Firebase Auth state listener — only fires once on load
    firebase.auth().onAuthStateChanged(async (user) => {
        // Determine initial route from URL hash
        const hash = window.location.hash.substring(1);
        const initialRoute = hash.split('-')[0] || 'home';
        const initialParam = hash.split('-')[1] || null;

        const publicRoutes = ['home', 'projects', 'custom', 'contact', 'detail', 'login'];

        if (user) {
            isAuthenticated = true;
            // Check if user is admin
            if (user.email === 'admin@creators.in') {
                userRole = 'admin';
            } else {
                userRole = 'customer';
            }
            await navigateTo(initialRoute, initialParam);
        } else {
            isAuthenticated = false;
            userRole = null;
            // Allow public routes, otherwise go to login
            if (publicRoutes.includes(initialRoute)) {
                await navigateTo(initialRoute, initialParam);
            } else {
                navigateTo('login');
            }
        }
    });
});

// Helper: Inject dynamic contact info
async function injectContactInfo() {
    const contact = await getContactInfo();
    if (!contact) return;

    const waMessage = encodeURIComponent("HI WE ARE CREATORS.IN HOW WE CAN GIVE OUR SUPPORT FOR YOU");
    const waLink = `https://wa.me/${contact.whatsapp}?text=${waMessage}`;

    const waFloating = document.getElementById('floating-wa');
    if (waFloating) waFloating.href = waLink;

    const footerPhone = document.getElementById('footer-phone');
    if (footerPhone) footerPhone.textContent = contact.phone;

    const footerEmail = document.getElementById('footer-email');
    if (footerEmail) footerEmail.textContent = contact.email;
}

// ==============================
// AUTHENTICATION VIEWS
// ==============================

function createGradientBGHTML() {
    return `
        <div class="gradient-bg">
            <div class="gradients-container">
                <div class="g1"></div>
                <div class="g2"></div>
                <div class="g3"></div>
                <div class="g4"></div>
                <div class="g5"></div>
            </div>
        </div>
    `;
}

function renderLogin(isSignup = false) {
    let html = '';

    html = `
        ${createGradientBGHTML()}
        <div class="gradient-header" style="margin-top: 3rem; margin-bottom: 2rem;">
            <div class="logo-shine-wrapper">
                <img src="logo.jpg" alt="Logo" style="max-width: 250px; display: block;">
            </div>
        </div>
        <div class="auth-container glass-panel">
            <div class="auth-header">
                <h2 style="color: white; margin-bottom: 0.5rem;">Welcome Back</h2>
                <p style="color: rgba(255,255,255,0.7);">Log in to manage your project requests.</p>
            </div>
            
            <div class="auth-tabs">
                <div class="auth-tab ${!isSignup ? 'active' : ''}" onclick="renderLogin(false)">Login</div>
                <div class="auth-tab ${isSignup ? 'active' : ''}" onclick="renderLogin(true)">Sign Up</div>
            </div>

            <form onsubmit="submitAuth(event, ${isSignup})">
                ${isSignup ? `
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" class="form-control" required placeholder="YOUR NAME">
                </div>
                <div class="form-group">
                    <label>Phone / WhatsApp</label>
                    <input type="tel" class="form-control" required placeholder="+91 XXXXX XXXXX">
                </div>
                ` : ''}
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" id="auth-email" class="form-control" required placeholder="ENTER MAIL">
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="auth-password" class="form-control" required placeholder="ENTER PASSWORD">
                </div>
                
                ${!isSignup ? `
                <div style="text-align: right; margin-bottom: 1.5rem;">
                    <a href="#" style="font-size: 0.9rem;">Forgot Password?</a>
                </div>
                ` : '<div style="margin-bottom: 1.5rem;"></div>'}
                
                <div id="login-error" style="color: #dc3545; margin-bottom: 1rem; display: none; font-size: 0.9rem; text-align: center; font-weight: 500;">Invalid email or password! Please try again.</div>

                <button type="submit" id="auth-submit-btn" class="btn btn-primary" style="width: 100%;">
                    ${isSignup ? 'Create Account' : 'Log In'}
                </button>
            </form>
        </div>
        <section class="how-it-works on-dark" style="margin-top: 4rem;">
            <h2 class="section-title">Service Provider</h2>
            <div class="steps">
                <div class="step-card">
                    <div class="step-icon"><i class="fa-solid fa-magnifying-glass"></i></div>
                    <h3>1. Choose or Request</h3>
                    <p>Browse our collection of ready-made projects or submit a custom requirement.</p>
                </div>
                <div class="step-card">
                    <div class="step-icon"><i class="fa-solid fa-sliders"></i></div>
                    <h3>2. Customize &amp; Confirm</h3>
                    <p>Discuss the details, get a price estimate, and customize components as needed.</p>
                </div>
                <div class="step-card">
                    <div class="step-icon"><i class="fa-solid fa-truck-fast"></i></div>
                    <h3>3. Fast Delivery</h3>
                    <p>Receive your complete project with code, components, and documentation quickly.</p>
                </div>
                <div class="step-card">
                    <div class="step-icon"><i class="fa-solid fa-file-pdf"></i></div>
                    <h3>4. Reports &amp; Softcopy</h3>
                    <p>We design and develop academic projects tailored to your requirements and provide a complete project report in soft copy, ready for submission.</p>
                </div>
            </div>
        </section>
    `;
    appContent.innerHTML = html;
}

function submitAuth(e, isSignup) {
    e.preventDefault();

    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const btn = document.querySelector('#auth-submit-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Please wait...'; }

    if (isSignup) {
        // Create new customer account in Firebase
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(async (userCredential) => {
                isAuthenticated = true;
                userRole = 'customer';
                // Save customer info to Firestore
                const name = document.querySelector('input[placeholder="YOUR NAME"]');
                await db.collection('customers').doc(userCredential.user.uid).set({
                    email: email,
                    name: name ? name.value : '',
                    createdAt: new Date().toLocaleDateString()
                });
                navigateTo('home');
            })
            .catch((error) => {
                const err = document.getElementById('login-error');
                if (err) { err.style.display = 'block'; err.textContent = error.message; }
                if (btn) { btn.disabled = false; btn.textContent = 'Create Account'; }
            });
    } else {
        // Login existing customer
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(() => {
                isAuthenticated = true;
                userRole = 'customer';
                navigateTo('home');
            })
            .catch((error) => {
                const err = document.getElementById('login-error');
                if (err) { err.style.display = 'block'; err.textContent = 'Invalid email or password!'; }
                if (btn) { btn.disabled = false; btn.textContent = 'Log In'; }
            });
    }
}

function handleLogout(e) {
    if (e) e.preventDefault();
    isAuthenticated = false;
    userRole = 'none';
    // Sign out from Firebase if customer
    firebase.auth().signOut().catch(() => { });
    navigateTo('login');
}

// ==============================
// CUSTOMER VIEWS
// ==============================

async function renderHome() {
    const currentProjects = await getProjects();
    const ongoingProjects = currentProjects.filter(p => !p.status || p.status.toLowerCase() !== 'completed');
    const finishedProjects = currentProjects.filter(p => p.status && p.status.toLowerCase() === 'completed');

    let html = `
        <section class="hero">
            <div class="marquee-container">
                <div class="marquee-content">
                    <h1>Get Your Academic Projects Done &nbsp;&bull;&nbsp;</h1>
                    <h1>Get Your Academic Projects Done &nbsp;&bull;&nbsp;</h1>
                </div>
            </div>
            <p style="font-size: 1.35rem; font-weight: 700; line-height: 1.6; letter-spacing: 0.3px;">
                <span style="color: var(--primary-color);">Smart Solutions</span> for Every Engineering Department.<br>
                <span style="font-size: 1.1rem; font-weight: 500; opacity: 0.85;">Efficient, Affordable, and Future-Ready.</span>
            </p>

            <div class="marquee-container" style="margin-top: 3rem;">
                <div class="marquee-content" style="animation-duration: 40s;">
                    <div class="trust-badges">
                        <div class="trust-badge"><i class="fa-solid fa-check-circle"></i> 100+ Projects Delivered</div>
                        <div class="trust-badge"><i class="fa-solid fa-shield-halved"></i> Support till Viva</div>
                        <div class="trust-badge"><i class="fa-solid fa-gears"></i> Fully Customizable</div>
                    </div>
                    <div class="trust-badges">
                        <div class="trust-badge"><i class="fa-solid fa-check-circle"></i> 100+ Projects Delivered</div>
                        <div class="trust-badge"><i class="fa-solid fa-shield-halved"></i> Support till Viva</div>
                        <div class="trust-badge"><i class="fa-solid fa-gears"></i> Fully Customizable</div>
                    </div>
                </div>
            </div>
        </section>

        <section class="how-it-works">
            <h2 class="section-title">Service Provider</h2>
            <div class="steps">
                <div class="step-card">
                    <div class="step-icon"><i class="fa-solid fa-magnifying-glass"></i></div>
                    <h3>1. Choose or Request</h3>
                    <p>Browse our collection of ready-made projects or submit a custom requirement.</p>
                </div>
                <div class="step-card">
                    <div class="step-icon"><i class="fa-solid fa-sliders"></i></div>
                    <h3>2. Customize &amp; Confirm</h3>
                    <p>Discuss the details, get a price estimate, and customize components as needed.</p>
                </div>
                <div class="step-card">
                    <div class="step-icon"><i class="fa-solid fa-truck-fast"></i></div>
                    <h3>3. Fast Delivery</h3>
                    <p>Receive your complete project with code, components, and documentation quickly.</p>
                </div>
                <div class="step-card">
                    <div class="step-icon"><i class="fa-solid fa-file-pdf"></i></div>
                    <h3>4. Reports &amp; Softcopy</h3>
                    <p>We design and develop academic projects tailored to your requirements and provide a complete project report in soft copy, ready for submission.</p>
                </div>
            </div>
        </section>

        <section class="featured-projects mb-4">
            <h2 class="section-title">Ongoing Projects</h2>
            <div class="projects-grid">
                ${ongoingProjects.length > 0 ? ongoingProjects.map(createProjectCardHTML).join('') : '<p class="text-center w-100" style="grid-column: 1/-1;">No ongoing projects at the moment.</p>'}
            </div>
        </section>

        <section class="featured-projects mb-4" style="margin-top: 5rem;">
            <h2 class="section-title">Finished Projects</h2>
            <div class="projects-grid">
                ${finishedProjects.length > 0 ? finishedProjects.map(createProjectCardHTML).join('') : '<p class="text-center w-100" style="grid-column: 1/-1;">No finished projects at the moment.</p>'}
            </div>
            <div class="text-center mt-4">
                <button class="btn btn-primary" onclick="navigateTo('projects')">View All Projects</button>
            </div>
        </section>
    `;
    appContent.innerHTML = html;
}

let currentFilter = 'All';
let searchQuery = '';

async function renderProjects() {
    const categories = ['All', 'EEE', 'ECE', 'CSE', 'Mechanical'];
    const currentProjects = await getProjects();

    let filtered = currentProjects;
    if (currentFilter !== 'All') {
        filtered = filtered.filter(p => p.category === currentFilter);
    }
    if (searchQuery) {
        filtered = filtered.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    let html = `
        <h2 class="section-title">Browse Projects</h2>
        
        <div class="search-container">
            <i class="fa-solid fa-search"></i>
            <input type="text" id="project-search" placeholder="Search for projects..." value="${searchQuery}">
        </div>

        <div class="filters-container">
            <!-- Desktop filter buttons -->
            <div class="filters-desktop">
                ${categories.map(cat => `
                    <button class="filter-btn ${currentFilter === cat ? 'active' : ''}" onclick="setFilter('${cat}')">${cat}</button>
                `).join('')}
            </div>
            <!-- Mobile filter select dropdown -->
            <div class="filters-mobile" style="margin-bottom: 2rem;">
                <label for="mobile-filter-select" style="font-weight: 600; margin-bottom: 0.5rem; display: block; text-align: center;">Filter by Department:</label>
                <select id="mobile-filter-select" class="form-control" onchange="setFilter(this.value)" style="height: 48px; border-radius: 8px;">
                    ${categories.map(cat => `
                        <option value="${cat}" ${currentFilter === cat ? 'selected' : ''}>${cat === 'All' ? 'All Departments' : cat}</option>
                    `).join('')}
                </select>
            </div>
        </div>

        <div class="projects-grid">
            ${filtered.length > 0 ? filtered.map(createProjectCardHTML).join('') : '<p class="text-center w-100" style="grid-column: 1/-1;">No projects found matching your criteria.</p>'}
        </div>
    `;

    appContent.innerHTML = html;

    const searchInput = document.getElementById('project-search');
    searchInput.focus();
    searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);

    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        clearTimeout(window.searchTimeout);
        window.searchTimeout = setTimeout(renderProjects, 300);
    });
}

function setFilter(cat) {
    currentFilter = cat;
    renderProjects();
}

function createProjectCardHTML(project) {
    const isCompleted = project.status && project.status.toLowerCase() === 'completed';
    return `
        <div class="project-card">
            <img src="${project.image}" alt="${project.title}" class="project-img">
            <div class="project-content">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <span class="project-category">${project.category}</span>
                    <span class="project-status-badge" style="padding: 2px 8px; border-radius: 12px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; background: ${isCompleted ? 'rgba(25, 135, 84, 0.1)' : 'rgba(13, 110, 253, 0.1)'}; color: ${isCompleted ? '#198754' : '#0d6efd'}; border: 1px solid ${isCompleted ? 'rgba(25, 135, 84, 0.2)' : 'rgba(13, 110, 253, 0.2)'};">${isCompleted ? 'Finished' : 'Ongoing'}</span>
                </div>
                <h3 class="project-title">${project.title}</h3>
                <p class="project-desc">${project.shortDesc || ''}</p>
                <div class="project-footer" style="justify-content: flex-end;">
                    <button class="btn btn-outline" onclick="navigateTo('detail', '${project.id}')">View Details</button>
                </div>
            </div>
        </div>
    `;
}

async function renderProjectDetail(id) {
    const projects = await getProjects();
    const project = projects.find(p => String(p.id) === String(id));
    if (!project) return navigateTo('projects');
    const contact = await getContactInfo();
    const isCompleted = project.status && project.status.toLowerCase() === 'completed';

    let html = `
        <button class="btn btn-outline mb-4" onclick="navigateTo('projects')"><i class="fa-solid fa-arrow-left"></i> Back to Projects</button>
        <div class="project-detail-view">
            <div>
                <img src="${project.image}" alt="${project.title}" class="detail-img">
            </div>
            <div class="detail-info">
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                    <span class="project-category">${project.category}</span>
                    <span class="project-status-badge" style="padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; background: ${isCompleted ? 'rgba(25, 135, 84, 0.1)' : 'rgba(13, 110, 253, 0.1)'}; color: ${isCompleted ? '#198754' : '#0d6efd'}; border: 1px solid ${isCompleted ? 'rgba(25, 135, 84, 0.2)' : 'rgba(13, 110, 253, 0.2)'};">${isCompleted ? 'Finished' : 'Ongoing'}</span>
                </div>
                <h1>${project.title}</h1>
                
                <div class="detail-section" style="margin-top: 1.5rem;">
                    <h3>Description</h3>
                    <p>${project.fullDesc}</p>
                </div>
                
                <div class="detail-section">
                    <h3>Components Used</h3>
                    <p><i class="fa-solid fa-microchip" style="color: var(--primary-color); margin-right: 8px;"></i> ${project.components}</p>
                </div>
                
                <div class="detail-section">
                    <h3>Expected Output</h3>
                    <p><i class="fa-solid fa-display" style="color: var(--primary-color); margin-right: 8px;"></i> ${project.output}</p>
                </div>
                
                <div class="detail-ctas">
                    <a href="https://wa.me/${contact.whatsapp}?text=I%20want%20to%20order%20the%20project:%20${encodeURIComponent(project.title)}" target="_blank" class="btn btn-primary"><i class="fa-brands fa-whatsapp"></i> Order Now</a>
                    <button class="btn btn-outline" onclick="navigateTo('custom')">Request Modification</button>
                </div>
            </div>
        </div>
    `;
    appContent.innerHTML = html;
}

function renderCustomRequest() {
    let html = `
        <h2 class="section-title">Request Custom Project</h2>
        <div class="form-container">
            <form id="custom-request-form" onsubmit="submitCustomRequest(event)">
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" id="req-name" class="form-control" required placeholder="YOUR NAME">
                </div>
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" id="req-email" class="form-control" required placeholder="ENTER MAIL">
                </div>
                <div class="form-group">
                    <label>Phone / WhatsApp Number</label>
                    <input type="tel" id="req-phone" class="form-control" required placeholder="+91 XXXXX XXXXX">
                </div>
                <div style="display: flex; gap: 1rem;">
                    <div class="form-group" style="flex: 1; margin-bottom: 1.5rem;">
                        <label>Branch / Department</label>
                        <select id="req-branch" class="form-control" required>
                            <option value="">Select Branch</option>
                            <option value="EEE">EEE</option>
                            <option value="ECE">ECE</option>
                            <option value="CSE">CSE</option>
                            <option value="Mechanical">Mechanical</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1; margin-bottom: 1.5rem;">
                        <label>Year</label>
                        <select id="req-year" class="form-control" required>
                            <option value="">Select Year</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Project Type</label>
                    <select id="req-type" class="form-control" required>
                        <option value="">Select Project Type</option>
                        <option value="Hardware / Prototype">Hardware / Prototype</option>
                        <option value="Software / Simulation">Software / Simulation</option>
                        <option value="IoT / Embedded System">IoT / Embedded System</option>
                        <option value="MATLAB / VLSI / Labview">MATLAB / VLSI / Labview</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Project Description & Requirements</label>
                    <textarea id="req-desc" class="form-control" required placeholder="Describe what you want to build..."></textarea>
                </div>
                <button type="submit" id="custom-req-submit-btn" class="btn btn-primary" style="width: 100%; height: 48px;"><i class="fa-solid fa-paper-plane"></i> Submit Request</button>
            </form>
        </div>
    `;
    appContent.innerHTML = html;
}

async function submitCustomRequest(e) {
    e.preventDefault();
    const btn = document.getElementById('custom-req-submit-btn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...'; }
    try {
        const newReq = {
            name: document.getElementById('req-name').value,
            email: document.getElementById('req-email').value,
            phone: document.getElementById('req-phone').value,
            branch: document.getElementById('req-branch').value,
            year: document.getElementById('req-year').value,
            type: document.getElementById('req-type').value,
            projectType: document.getElementById('req-type').value,
            desc: document.getElementById('req-desc').value
        };

        await addRequest(newReq);
        alert('Your custom project request has been submitted successfully! We will get in touch with you shortly.');
        navigateTo('home');
    } catch (err) {
        console.error(err);
        alert('Failed to submit request: ' + err.message);
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit Request'; }
    }
}

async function renderContact() {
    const contact = await getContactInfo();
    const igHandle = contact.instagram_handle || '';
    const igUrl = contact.instagram_url || (`https://www.instagram.com/${igHandle}`);
    let html = `
        <h2 class="section-title">Get In Touch</h2>
        <div class="contact-grid">
            <div class="contact-cards">

                <a href="mailto:${contact.email}" class="contact-card">
                    <div class="contact-icon email"><i class="fa-solid fa-envelope"></i></div>
                    <div>
                        <h3>Email Us</h3>
                        <p style="color: var(--text-muted);">${contact.email}</p>
                    </div>
                </a>
                <div class="contact-card">
                    <div class="contact-icon phone"><i class="fa-solid fa-phone"></i></div>
                    <div>
                        <h3>Call Us</h3>
                        <p style="color: var(--text-muted);">${contact.phone}</p>
                    </div>
                </div>
                ${igHandle ? `
                <a href="${igUrl}" target="_blank" rel="noopener noreferrer" class="contact-card">
                    <div class="contact-icon instagram"><i class="fa-brands fa-instagram"></i></div>
                    <div>
                        <h3>Instagram</h3>
                        <p style="color: var(--text-muted);">@${igHandle}</p>
                    </div>
                </a>
                ` : ''}
            </div>
            
            <div class="form-container" style="margin: 0; max-width: 100%;">
                <h3 style="margin-bottom: 1.5rem;">Send Us a Message</h3>
                <form id="contact-form" onsubmit="submitContactForm(event)">
                    <div class="form-group">
                        <label>Full Name</label>
                        <input type="text" id="contact-name" class="form-control" required placeholder="Your Name">
                    </div>
                    <div class="form-group">
                        <label>Email Address</label>
                        <input type="email" id="contact-email" class="form-control" required placeholder="Your Email">
                    </div>
                    <div class="form-group">
                        <label>Message</label>
                        <textarea id="contact-message" class="form-control" required placeholder="How can we help you?"></textarea>
                    </div>
                    <button type="submit" id="contact-submit-btn" class="btn btn-primary" style="width: 100%; height: 48px;"><i class="fa-solid fa-paper-plane"></i> Send Message</button>
                </form>
            </div>
        </div>
    `;
    appContent.innerHTML = html;
}

window.submitContactForm = async function (e) {
    e.preventDefault();
    const btn = document.getElementById('contact-submit-btn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...'; }
    try {
        const contactMsg = {
            name: document.getElementById('contact-name').value,
            email: document.getElementById('contact-email').value,
            message: document.getElementById('contact-message').value,
            createdAt: new Date().toLocaleDateString()
        };
        await db.collection('contact_messages').add(contactMsg);
        alert('Thank you for contacting us! We will get back to you soon.');
        document.getElementById('contact-form').reset();
    } catch (err) {
        console.error(err);
        alert('Failed to send message: ' + err.message);
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message'; }
    }
};

function toggleFaq(el) {
    const item = el.parentElement;
    item.classList.toggle('active');
}

function renderAbout() {
    let html = `
        <section class="about-hero" style="text-align: center; padding: 4rem 1rem; background: var(--bg-gradient); border-radius: var(--border-radius); margin-bottom: 4rem; border: 1px solid rgba(255,255,255,0.2);">
            <h2 class="section-title" style="margin-bottom: 2rem;">About CREATORS.IN</h2>
            <p style="font-size: 1.25rem; color: var(--text-muted); max-width: 800px; margin: 0 auto 2rem; line-height: 1.8;">
                We are a team of passionate engineers and educators dedicated to helping engineering students turn their academic ideas into high-quality working prototypes. Since our inception, we have helped over 100+ students succeed in their project submissions and vivas.
            </p>
            <div style="display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap;">
                <div style="background: white; padding: 1.5rem 2rem; border-radius: 12px; box-shadow: var(--shadow-sm); display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fa-solid fa-graduation-cap" style="color: var(--primary-color); font-size: 1.5rem;"></i>
                    <span style="font-weight: 700;">Academic Excellence</span>
                </div>
                <div style="background: white; padding: 1.5rem 2rem; border-radius: 12px; box-shadow: var(--shadow-sm); display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fa-solid fa-laptop-code" style="color: var(--primary-color); font-size: 1.5rem;"></i>
                    <span style="font-weight: 700;">Hands-on Support</span>
                </div>
                <div style="background: white; padding: 1.5rem 2rem; border-radius: 12px; box-shadow: var(--shadow-sm); display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fa-solid fa-trophy" style="color: var(--primary-color); font-size: 1.5rem;"></i>
                    <span style="font-weight: 700;">100% Viva Ready</span>
                </div>
            </div>
        </section>

        <section class="about-services" style="margin-bottom: 4rem;">
            <h2 class="section-title">What We Offer</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;">
                <div class="about-card" style="background: white; padding: 2.5rem 2rem; border-radius: var(--border-radius); box-shadow: var(--shadow-md); text-align: center;">
                    <div style="font-size: 2.5rem; color: var(--primary-color); margin-bottom: 1.5rem;"><i class="fa-solid fa-microchip"></i></div>
                    <h3 style="margin-bottom: 1rem;">Complete Hardware Kits</h3>
                    <p style="color: var(--text-muted);">Fully assembled and tested electronics/mechanical systems built with high-quality components.</p>
                </div>
                <div class="about-card" style="background: white; padding: 2.5rem 2rem; border-radius: var(--border-radius); box-shadow: var(--shadow-md); text-align: center;">
                    <div style="font-size: 2.5rem; color: var(--primary-color); margin-bottom: 1.5rem;"><i class="fa-solid fa-code"></i></div>
                    <h3 style="margin-bottom: 1rem;">Clean & Commented Code</h3>
                    <p style="color: var(--text-muted);">Well-structured and thoroughly commented code files in Arduino C, Python, MATLAB, etc. for easy learning.</p>
                </div>
                <div class="about-card" style="background: white; padding: 2.5rem 2rem; border-radius: var(--border-radius); box-shadow: var(--shadow-md); text-align: center;">
                    <div style="font-size: 2.5rem; color: var(--primary-color); margin-bottom: 1.5rem;"><i class="fa-solid fa-file-invoice"></i></div>
                    <h3 style="margin-bottom: 1rem;">Professional Reports</h3>
                    <p style="color: var(--text-muted);">Comprehensive project reports and documentation (soft copy) prepared strictly according to university guidelines.</p>
                </div>
                <div class="about-card" style="background: white; padding: 2.5rem 2rem; border-radius: var(--border-radius); box-shadow: var(--shadow-md); text-align: center;">
                    <div style="font-size: 2.5rem; color: var(--primary-color); margin-bottom: 1.5rem;"><i class="fa-solid fa-chalkboard-user"></i></div>
                    <h3 style="margin-bottom: 1rem;">Viva Explanation & Prep</h3>
                    <p style="color: var(--text-muted);">Exclusive 1-on-1 explanation sessions to prepare you for critical queries during your project viva voce.</p>
                </div>
            </div>
        </section>
    `;
    appContent.innerHTML = html;
}

function renderPricing() {
    let html = `
        <h2 class="section-title">Pricing Packages</h2>
        <p style="text-align: center; color: var(--text-muted); max-width: 600px; margin: -2rem auto 3rem; font-size: 1.1rem;">
            Affordable tiers tailored to your department and academic requirement. Select the best package for your needs.
        </p>
        
        <div class="pricing-grid">
            <!-- Standard Plan -->
            <div class="pricing-card">
                <h3>Mini Project Standard</h3>
                <p class="plan-subtitle">Ideal for semester-end submissions</p>
                <div class="plan-price">
                    ₹2,999<span> onwards</span>
                </div>
                <ul class="plan-features">
                    <li><i class="fa-solid fa-circle-check"></i> Working Circuit & Prototype</li>
                    <li><i class="fa-solid fa-circle-check"></i> Complete Code File</li>
                    <li><i class="fa-solid fa-circle-check"></i> Circuit / Connection Diagram</li>
                    <li style="color: var(--text-muted);"><i class="fa-solid fa-circle-xmark" style="color: #dc3545;"></i> Full Viva Explanation</li>
                    <li style="color: var(--text-muted);"><i class="fa-solid fa-circle-xmark" style="color: #dc3545;"></i> Detailed Project Report</li>
                </ul>
                <button class="btn btn-outline" onclick="navigateTo('custom')">Request This Plan</button>
            </div>

            <!-- Pro Plan (Popular) -->
            <div class="pricing-card popular">
                <div class="popular-badge">Most Popular</div>
                <h3>Final Year Pro</h3>
                <p class="plan-subtitle">Perfect for major project submission</p>
                <div class="plan-price">
                    ₹5,999<span> onwards</span>
                </div>
                <ul class="plan-features">
                    <li><i class="fa-solid fa-circle-check"></i> High-end Sensors/Actuators</li>
                    <li><i class="fa-solid fa-circle-check"></i> Complete Code & App/Cloud Integration</li>
                    <li><i class="fa-solid fa-circle-check"></i> Ready-to-Submit Softcopy Report</li>
                    <li><i class="fa-solid fa-circle-check"></i> 1-on-1 Online Viva Prep Session</li>
                    <li><i class="fa-solid fa-circle-check"></i> 3 Months Component Support</li>
                </ul>
                <button class="btn btn-primary" onclick="navigateTo('custom')">Request This Plan</button>
            </div>

            <!-- Custom Plan -->
            <div class="pricing-card">
                <h3>Custom Research</h3>
                <p class="plan-subtitle">Designed strictly to your requirements</p>
                <div class="plan-price">
                    ₹8,999<span> onwards</span>
                </div>
                <ul class="plan-features">
                    <li><i class="fa-solid fa-circle-check"></i> Customizable Hardware & Simulation</li>
                    <li><i class="fa-solid fa-circle-check"></i> Fully custom code or MATLAB model</li>
                    <li><i class="fa-solid fa-circle-check"></i> IEEE Paper Reference Integration</li>
                    <li><i class="fa-solid fa-circle-check"></i> Unlimited Viva Prep & Support</li>
                    <li><i class="fa-solid fa-circle-check"></i> Support until final evaluation</li>
                </ul>
                <button class="btn btn-outline" onclick="navigateTo('custom')">Contact for Estimate</button>
            </div>
        </div>
    `;
    appContent.innerHTML = html;
}
