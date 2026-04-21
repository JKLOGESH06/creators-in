// DOM Elements
const appContent = document.getElementById('app-content');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.getElementById('nav-links');

// Mobile Menu Toggle
mobileMenuBtn.addEventListener('click', () => {
    const activeNav = document.querySelector('.navbar').style.display !== 'none' 
        ? document.getElementById('nav-links') 
        : document.querySelector('.admin-navbar .nav-links');
    if(activeNav) activeNav.classList.toggle('show');
});

// Hide mobile menu on link click
document.querySelectorAll('.nav-links').forEach(nav => {
    nav.addEventListener('click', (e) => {
        if(e.target.tagName === 'A') {
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
    login: renderLoginCustomer,
    'admin-login': renderLoginAdmin,
    // Admin Routes
    'admin-dashboard': renderAdminDashboard,
    'admin-requests': renderAdminRequests,
    'admin-projects': renderAdminProjects,
    'admin-settings': renderAdminSettings
};

async function navigateTo(route, param = null) {
    // Enforce authentication
    if (!isAuthenticated && route !== 'login' && route !== 'admin-login') {
        route = 'login';
    }

    // Toggle layout visibility based on route and role
    const navbar = document.querySelector('.navbar');
    const adminNavbar = document.querySelector('.admin-navbar');
    const footer = document.querySelector('.footer');
    const floatingWhatsApp = document.querySelector('.floating-whatsapp');
    
    if (route === 'login' || route === 'admin-login') {
        if(navbar) navbar.style.display = 'none';
        if(adminNavbar) adminNavbar.style.display = 'none';
        if(footer) footer.style.display = 'none';
        if(floatingWhatsApp) floatingWhatsApp.style.display = 'none';
        document.body.classList.remove('customer-bg');
        document.body.classList.remove('admin-bg');
    } else {
        if (userRole === 'admin') {
            if(navbar) navbar.style.display = 'none';
            if(adminNavbar) adminNavbar.style.display = 'block';
            if(footer) footer.style.display = 'none';
            if(floatingWhatsApp) floatingWhatsApp.style.display = 'none';
            document.body.classList.remove('customer-bg');
            document.body.classList.add('admin-bg');
        } else {
            if(navbar) navbar.style.display = 'block';
            if(adminNavbar) adminNavbar.style.display = 'none';
            if(footer) footer.style.display = 'block';
            if(floatingWhatsApp) floatingWhatsApp.style.display = 'flex';
            document.body.classList.add('customer-bg');
            document.body.classList.remove('admin-bg');
        }
    }

    // Update active nav link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === `#${route}` || (route === 'admin-login' && href === '#login')) {
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

// Initial Load — let Firebase decide routing
document.addEventListener('DOMContentLoaded', async () => {
    // Show loading spinner while Firebase checks auth state
    appContent.innerHTML = '<div style="text-align:center; padding: 5rem;"><i class="fa-solid fa-spinner fa-spin fa-3x" style="color:var(--primary-color)"></i><p style="margin-top:1rem;">Loading...</p></div>';

    await injectContactInfo();

    // Firebase Auth state listener — only fires once on load
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            // A customer is already logged in from a previous session
            isAuthenticated = true;
            userRole = 'customer';
            await navigateTo('home');
        } else {
            // No one is logged in — go to login page
            isAuthenticated = false;
            userRole = 'none';
            navigateTo('login');
        }
    });
});

// Helper: Inject dynamic contact info
async function injectContactInfo() {
    const contact = await getContactInfo();
    if(!contact) return;
    
    const waLink = `https://wa.me/${contact.whatsapp}?text=Hi%20CREATORS.IN`;
    
    const waFloating = document.getElementById('floating-wa');
    if(waFloating) waFloating.href = waLink;
    
    const footerPhone = document.getElementById('footer-phone');
    if(footerPhone) footerPhone.textContent = contact.phone;
    
    const footerEmail = document.getElementById('footer-email');
    if(footerEmail) footerEmail.textContent = contact.email;
}

// ==============================
// AUTHENTICATION VIEWS
// ==============================

// Customer Portal Login (direct entry)
function renderLoginCustomer(isSignup = false) {
    let html = `
        <div class="auth-container form-container">
            <div class="auth-header">
                <h2><i class="fa-solid fa-user-graduate" style="color: var(--primary-color);"></i> Customer Portal</h2>
                <p>Log in to manage your project requests.</p>
            </div>

            <div class="auth-tabs">
                <div class="auth-tab ${!isSignup ? 'active' : ''}" onclick="renderLoginCustomer(false)">Login</div>
                <div class="auth-tab ${isSignup ? 'active' : ''}" onclick="renderLoginCustomer(true)">Sign Up</div>
            </div>

            <form onsubmit="submitAuth(event, 'customer', ${isSignup})">
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

            <div style="text-align: center; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #e9ecef;">
                <a href="#admin-login" onclick="navigateTo('admin-login')" style="font-size: 0.85rem; color: var(--text-muted);">
                    <i class="fa-solid fa-user-tie"></i> Admin Portal
                </a>
            </div>
        </div>
    `;
    appContent.innerHTML = html;
}

// Admin Portal Login (direct entry)
function renderLoginAdmin() {
    let html = `
        <div class="auth-container form-container">
            <button class="btn btn-outline" style="padding: 0.3rem 0.8rem; margin-bottom: 1rem; font-size: 0.8rem;" onclick="navigateTo('login')">
                <i class="fa-solid fa-arrow-left"></i> Back to Customer Portal
            </button>

            <div class="auth-header">
                <h2><i class="fa-solid fa-user-tie" style="color: var(--primary-color);"></i> Admin Portal</h2>
                <p>Log in to manage the platform.</p>
            </div>

            <form onsubmit="submitAuth(event, 'admin', false)">
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" id="auth-email" class="form-control" required placeholder="ADMIN EMAIL">
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="auth-password" class="form-control" required placeholder="ENTER PASSWORD">
                </div>

                <div id="login-error" style="color: #dc3545; margin-bottom: 1rem; display: none; font-size: 0.9rem; text-align: center; font-weight: 500;">Invalid credentials! Please try again.</div>

                <button type="submit" id="auth-submit-btn" class="btn btn-primary" style="width: 100%;">
                    <i class="fa-solid fa-lock"></i> Log In as Admin
                </button>
            </form>
        </div>
    `;
    appContent.innerHTML = html;
}

// Legacy alias kept for any internal references
function renderLogin(step = 'role', role = 'customer', isSignup = false) {
    if (role === 'admin' || step === 'admin') {
        renderLoginAdmin();
    } else {
        renderLoginCustomer(isSignup);
    }
}

function submitAuth(e, role, isSignup) {
    e.preventDefault();
    
    if (role === 'admin') {
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        
        if (email === 'projectcenter@gmail.com' && password === 'LOGESH008@') {
            isAuthenticated = true;
            userRole = 'admin';
            navigateTo('admin-dashboard');
        } else {
            const err = document.getElementById('login-error');
            if(err) err.style.display = 'block';
        }
    } else {
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        const btn = document.querySelector('#auth-submit-btn');
        if(btn) { btn.disabled = true; btn.textContent = 'Please wait...'; }

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
                    if(err) { err.style.display = 'block'; err.textContent = error.message; }
                    if(btn) { btn.disabled = false; btn.textContent = 'Create Account'; }
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
                    if(err) { err.style.display = 'block'; err.textContent = 'Invalid email or password!'; }
                    if(btn) { btn.disabled = false; btn.textContent = 'Log In'; }
                });
        }
    }
}

function handleLogout(e) {
    if(e) e.preventDefault();
    isAuthenticated = false;
    userRole = 'none';
    // Sign out from Firebase if customer
    firebase.auth().signOut().catch(() => {});
    navigateTo('login');
}

// ==============================
// CUSTOMER VIEWS
// ==============================

async function renderHome() {
    const currentProjects = await getProjects();
    const featuredProjects = currentProjects.slice(0, 3);
    
    let html = `
        <section class="hero">
            <h1>Get Your Academic Projects Done</h1>
            <p>Fast, Affordable, Reliable. Specially designed for EEE, ECE, CSE, and Mechanical Engineering students.</p>
            <div class="hero-ctas">
                <button class="btn btn-primary" onclick="navigateTo('projects')">Browse Projects</button>
                <button class="btn btn-outline" onclick="navigateTo('custom')">Request Custom Project</button>
            </div>
            <div class="trust-badges">
                <div class="trust-badge"><i class="fa-solid fa-check-circle"></i> 100+ Projects Delivered</div>
                <div class="trust-badge"><i class="fa-solid fa-shield-halved"></i> Support till Viva</div>
                <div class="trust-badge"><i class="fa-solid fa-gears"></i> Fully Customizable</div>
            </div>
        </section>

        <section class="how-it-works">
            <h2 class="section-title">How It Works</h2>
            <div class="steps">
                <div class="step-card">
                    <div class="step-icon"><i class="fa-solid fa-magnifying-glass"></i></div>
                    <h3>1. Choose or Request</h3>
                    <p>Browse our collection of ready-made projects or submit a custom requirement.</p>
                </div>
                <div class="step-card">
                    <div class="step-icon"><i class="fa-solid fa-sliders"></i></div>
                    <h3>2. Customize & Confirm</h3>
                    <p>Discuss the details, get a price estimate, and customize components as needed.</p>
                </div>
                <div class="step-card">
                    <div class="step-icon"><i class="fa-solid fa-truck-fast"></i></div>
                    <h3>3. Fast Delivery</h3>
                    <p>Receive your complete project with code, components, and documentation quickly.</p>
                </div>
                <div class="step-card">
                    <div class="step-icon"><i class="fa-solid fa-file-pdf"></i></div>
                    <h3>4. Reports & Softcopy</h3>
                    <p>We design and develop academic projects tailored to your requirements and provide a complete project report in soft copy, ready for submission.</p>
                </div>
            </div>
        </section>

        <section class="featured-projects mb-4">
            <h2 class="section-title">Featured Projects</h2>
            <div class="projects-grid">
                ${featuredProjects.map(createProjectCardHTML).join('')}
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

        <div class="filters">
            ${categories.map(cat => `
                <button class="filter-btn ${currentFilter === cat ? 'active' : ''}" onclick="setFilter('${cat}')">${cat}</button>
            `).join('')}
        </div>

        <div class="projects-grid">
            ${filtered.length > 0 ? filtered.map(createProjectCardHTML).join('') : '<p class="text-center w-100" style="grid-column: 1/-1;">No projects found matching your criteria.</p>'}
        </div>
    `;
    
    appContent.innerHTML = html;

    document.getElementById('project-search').addEventListener('input', (e) => {
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
    return `
        <div class="project-card">
            <img src="${project.image}" alt="${project.title}" class="project-img">
            <div class="project-content">
                <span class="project-category">${project.category}</span>
                <h3 class="project-title">${project.title}</h3>
                <p class="project-desc">${project.shortDesc}</p>
                <div class="project-footer">
                    <span class="project-price">${project.price}</span>
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

    let html = `
        <button class="btn btn-outline mb-4" onclick="navigateTo('projects')"><i class="fa-solid fa-arrow-left"></i> Back to Projects</button>
        <div class="project-detail-view">
            <div>
                <img src="${project.image}" alt="${project.title}" class="detail-img">
            </div>
            <div class="detail-info">
                <span class="project-category">${project.category}</span>
                <h1>${project.title}</h1>
                <div class="detail-price">${project.price} <span style="font-size: 1rem; color: #6c757d; font-weight: 400;">(Estimated)</span></div>
                
                <div class="detail-section">
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
                <div class="form-group">
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
                <div class="form-group">
                    <label>Project Description & Requirements</label>
                    <textarea id="req-desc" class="form-control" required placeholder="Describe what you want to build..."></textarea>
                </div>
                <div class="form-group">
                    <label>Estimated Budget (₹)</label>
                    <input type="number" id="req-budget" class="form-control" placeholder="e.g. 4000">
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;"><i class="fa-solid fa-paper-plane"></i> Submit Request</button>
            </form>
        </div>
    `;
    appContent.innerHTML = html;
}

async function submitCustomRequest(e) {
    e.preventDefault();
    const newReq = {
        name: document.getElementById('req-name').value,
        email: document.getElementById('req-email').value,
        phone: document.getElementById('req-phone').value,
        branch: document.getElementById('req-branch').value,
        desc: document.getElementById('req-desc').value,
        budget: document.getElementById('req-budget').value
    };
    
    await addRequest(newReq);
    
    navigateTo('home');
}

async function renderContact() {
    const contact = await getContactInfo();
    let html = `
        <h2 class="section-title">Get In Touch</h2>
        <div class="contact-grid">
            <div class="contact-cards">
                <a href="https://wa.me/${contact.whatsapp}" target="_blank" class="contact-card">
                    <div class="contact-icon whatsapp"><i class="fa-brands fa-whatsapp"></i></div>
                    <div>
                        <h3>Chat on WhatsApp</h3>
                        <p style="color: var(--text-muted);">Instant replies</p>
                    </div>
                </a>
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
        </div>
    `;
    appContent.innerHTML = html;
}

function toggleFaq(el) {
    const item = el.parentElement;
    item.classList.toggle('active');
}

// ==============================
// ADMIN VIEWS
// ==============================

async function renderAdminDashboard() {
    const requests = await getRequests();
    const projects = await getProjects();
    const activeProjects = projects.filter(p => p.status !== 'completed');
    const completedProjects = projects.filter(p => p.status === 'completed');
    
    let html = `
        <h2 class="section-title">Admin Dashboard</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2rem; margin-bottom: 3rem;">
            <div class="step-card" style="padding: 2rem; cursor: pointer;" onclick="navigateTo('admin-requests')">
                <h1 style="font-size: 3rem; color: var(--primary-color);">${requests.length}</h1>
                <h3>Total Custom Requests</h3>
            </div>
            <div class="step-card" style="padding: 2rem; cursor: pointer;" onclick="navigateTo('admin-projects')">
                <h1 style="font-size: 3rem; color: var(--primary-color);">${activeProjects.length}</h1>
                <h3>Active Projects</h3>
            </div>
            <div class="step-card" style="padding: 2rem; cursor: pointer;" onclick="navigateTo('admin-projects')">
                <h1 style="font-size: 3rem; color: #198754;">${completedProjects.length}</h1>
                <h3>Completed Projects</h3>
            </div>
        </div>
        
        <h3>Recent Customer Requests</h3>
        <div class="admin-table-container mt-4">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Name</th>
                        <th>Branch</th>
                        <th>Budget</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${requests.slice(0, 5).reverse().map(r => `
                        <tr>
                            <td>${r.date}</td>
                            <td>${r.name}</td>
                            <td>${r.branch}</td>
                            <td>₹${r.budget || 'N/A'}</td>
                            <td><button class="admin-action-btn" onclick="navigateTo('admin-requests')">View All</button></td>
                        </tr>
                    `).join('')}
                    ${requests.length === 0 ? '<tr><td colspan="5" class="text-center">No requests found.</td></tr>' : ''}
                </tbody>
            </table>
        </div>
    `;
    appContent.innerHTML = html;
}

async function renderAdminRequests() {
    let requests = await getRequests();
    requests = requests.reverse();
    
    let html = `
        <h2 class="section-title">Customer Requests</h2>
        <div class="admin-table-container">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Name</th>
                        <th>Contact</th>
                        <th>Branch</th>
                        <th>Description</th>
                        <th>Budget</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${requests.map(r => `
                        <tr>
                            <td>${r.date}</td>
                            <td><strong>${r.name}</strong></td>
                            <td>${r.phone}<br><small>${r.email}</small></td>
                            <td>${r.branch}</td>
                            <td style="max-width: 300px;">${r.desc}</td>
                            <td style="color: #198754; font-weight: bold;">₹${r.budget || 'N/A'}</td>
                            <td>
                                <button class="admin-action-btn" style="background-color: #10b981;" onclick="approveRequestToProject('${r.id}')">Add to Projects</button>
                            </td>
                        </tr>
                    `).join('')}
                    ${requests.length === 0 ? '<tr><td colspan="7" class="text-center">No requests found.</td></tr>' : ''}
                </tbody>
            </table>
        </div>
    `;
    appContent.innerHTML = html;
}

window.approveRequestToProject = async function(id) {
    const requests = await getRequests();
    const req = requests.find(r => String(r.id) === String(id));
    if (!req) return;

    const newProject = {
        title: "Custom: " + req.desc.substring(0, 30) + (req.desc.length > 30 ? "..." : ""),
        category: req.branch,
        shortDesc: req.desc.substring(0, 50) + "...",
        fullDesc: req.desc,
        components: "Custom Request Components",
        output: "Custom Delivery",
        price: "₹" + (req.budget || "TBD"),
        image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80"
    };

    await addProject(newProject);
    await removeRequest(id);
    renderAdminRequests();
}

async function renderAdminProjects() {
    const projects = await getProjects();
    const ongoingProjects = projects.filter(p => p.status !== 'completed');
    const completedProjects = projects.filter(p => p.status === 'completed');
    
    let html = `
        <h2 class="section-title">Manage Projects</h2>
        
        <h3 style="margin-bottom: 1rem; color: var(--primary-color);">Ongoing Projects</h3>
        <div class="admin-table-container" style="margin-bottom: 3rem;">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Project Title</th>
                        <th>Category</th>
                        <th>Current Price</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${ongoingProjects.map(p => `
                        <tr>
                            <td>#${p.id}</td>
                            <td><strong>${p.title}</strong></td>
                            <td>${p.category}</td>
                            <td>
                                <input type="text" id="price-${p.id}" value="${p.price}" class="form-control" style="width: 120px; padding: 0.4rem;">
                            </td>
                            <td>
                                <button class="admin-action-btn" onclick="saveProjectPrice('${p.id}')">Save Price</button>
                                <button class="admin-action-btn" style="background-color: #198754; margin-left: 0.5rem;" onclick="markProjectCompleted('${p.id}')">Complete</button>
                            </td>
                        </tr>
                    `).join('')}
                    ${ongoingProjects.length === 0 ? '<tr><td colspan="5" class="text-center">No ongoing projects.</td></tr>' : ''}
                </tbody>
            </table>
        </div>

        <h3 style="margin-bottom: 1rem; color: #198754;">Completed Projects</h3>
        <div class="admin-table-container">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Project Title</th>
                        <th>Category</th>
                        <th>Final Price</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${completedProjects.map(p => `
                        <tr>
                            <td>#${p.id}</td>
                            <td><strong>${p.title}</strong></td>
                            <td>${p.category}</td>
                            <td>${p.price}</td>
                            <td><span style="color: #198754; font-weight: bold;"><i class="fa-solid fa-check-circle"></i> Completed</span></td>
                            <td>
                                <button class="admin-action-btn" style="background-color: #dc3545;" onclick="deleteProject('${p.id}')">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                    ${completedProjects.length === 0 ? '<tr><td colspan="6" class="text-center">No completed projects yet.</td></tr>' : ''}
                </tbody>
            </table>
        </div>
    `;
    appContent.innerHTML = html;
}

window.markProjectCompleted = async function(id) {
    await updateProjectStatus(id, 'completed');
    renderAdminProjects();
}

window.deleteProject = async function(id) {
    await removeProject(id);
    renderAdminProjects();
}

window.saveProjectPrice = async function(id) {
    const newPrice = document.getElementById(`price-${id}`).value;
    await updateProjectPrice(id, newPrice);
}

async function renderAdminSettings() {
    const contact = await getContactInfo();
    
    let html = `
        <h2 class="section-title">Platform Settings</h2>
        <div class="form-container">
            <form onsubmit="saveAdminSettings(event)">
                <div class="form-group">
                    <label>Support Email Address</label>
                    <input type="email" id="set-email" class="form-control" value="${contact.email}" required>
                </div>
                <div class="form-group">
                    <label>Support Phone Number (Display)</label>
                    <input type="text" id="set-phone" class="form-control" value="${contact.phone}" required>
                </div>
                <div class="form-group">
                    <label>WhatsApp Number (For Links, e.g., 919876543210)</label>
                    <input type="text" id="set-whatsapp" class="form-control" value="${contact.whatsapp}" required>
                </div>
                <button type="submit" class="btn btn-primary">Save Settings</button>
            </form>
        </div>
    `;
    appContent.innerHTML = html;
}

window.saveAdminSettings = async function(e) {
    e.preventDefault();
    const newInfo = {
        email: document.getElementById('set-email').value,
        phone: document.getElementById('set-phone').value,
        whatsapp: document.getElementById('set-whatsapp').value
    };
    await updateContactInfo(newInfo);
    await injectContactInfo();
}
