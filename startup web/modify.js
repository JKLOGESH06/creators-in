const fs = require('fs');
let code = fs.readFileSync('e:/startup web/script.js', 'utf8');

// navigateTo
code = code.replace(/function navigateTo\(route, param = null\) \{/, 'async function navigateTo(route, param = null) {');
code = code.replace(/injectContactInfo\(\);/, 'await injectContactInfo();');
code = code.replace(/routes\[route\]\(param\);/, 'await routes[route](param);');

// Initial Load
code = code.replace(/document\.addEventListener\('DOMContentLoaded', \(\) => \{/, 'document.addEventListener(\'DOMContentLoaded\', async () => {');
code = code.replace(/injectContactInfo\(\);/, 'await injectContactInfo();');

// injectContactInfo
code = code.replace(/function injectContactInfo\(\) \{/, 'async function injectContactInfo() {');
code = code.replace(/const contact = getContactInfo\(\);/, 'const contact = await getContactInfo();');

// renderHome
code = code.replace(/function renderHome\(\) \{/, 'async function renderHome() {');
code = code.replace(/const currentProjects = getProjects\(\);/, 'const currentProjects = await getProjects();');

// renderProjects
code = code.replace(/function renderProjects\(\) \{/, 'async function renderProjects() {');
code = code.replace(/const currentProjects = getProjects\(\);/, 'const currentProjects = await getProjects();');
// string IDs
code = code.replace(/onclick="navigateTo\('detail', \$\{project\.id\}\)"/g, 'onclick="navigateTo(\'detail\', \'${project.id}\')"');

// renderProjectDetail
code = code.replace(/function renderProjectDetail\(id\) \{/, 'async function renderProjectDetail(id) {');
code = code.replace(/const project = getProjects\(\)\.find\(p => p\.id === id\);/, 'const projects = await getProjects(); const project = projects.find(p => String(p.id) === String(id));');
code = code.replace(/const contact = getContactInfo\(\);/, 'const contact = await getContactInfo();');

// submitCustomRequest
code = code.replace(/function submitCustomRequest\(e\) \{/, 'async function submitCustomRequest(e) {');
code = code.replace(/addRequest\(newReq\);/, 'await addRequest(newReq);');

// renderContact
code = code.replace(/function renderContact\(\) \{/, 'async function renderContact() {');
code = code.replace(/const contact = getContactInfo\(\);/, 'const contact = await getContactInfo();');

// renderAdminDashboard
code = code.replace(/function renderAdminDashboard\(\) \{/, 'async function renderAdminDashboard() {');
code = code.replace(/const requests = getRequests\(\);/, 'const requests = await getRequests();');
code = code.replace(/const projects = getProjects\(\);/, 'const projects = await getProjects();');

// renderAdminRequests
code = code.replace(/function renderAdminRequests\(\) \{/, 'async function renderAdminRequests() {');
code = code.replace(/const requests = getRequests\(\)\.reverse\(\);/, 'let requests = await getRequests(); requests = requests.reverse();');
code = code.replace(/onclick="approveRequestToProject\(\$\{r\.id\}\)"/g, 'onclick="approveRequestToProject(\'${r.id}\')"');

// approveRequestToProject
code = code.replace(/window\.approveRequestToProject = function\(id\) \{/, 'window.approveRequestToProject = async function(id) {');
code = code.replace(/const requests = getRequests\(\);/, 'const requests = await getRequests();');
code = code.replace(/const req = requests\.find\(r => r\.id === id\);/, 'const req = requests.find(r => String(r.id) === String(id));');
code = code.replace(/addProject\(newProject\);/, 'await addProject(newProject);');
code = code.replace(/removeRequest\(id\);/, 'await removeRequest(id);');

// renderAdminProjects
code = code.replace(/function renderAdminProjects\(\) \{/, 'async function renderAdminProjects() {');
code = code.replace(/const projects = getProjects\(\);/, 'const projects = await getProjects();');
code = code.replace(/onclick="saveProjectPrice\(\$\{p\.id\}\)"/g, 'onclick="saveProjectPrice(\'${p.id}\')"');
code = code.replace(/onclick="markProjectCompleted\(\$\{p\.id\}\)"/g, 'onclick="markProjectCompleted(\'${p.id}\')"');
code = code.replace(/onclick="deleteProject\(\$\{p\.id\}\)"/g, 'onclick="deleteProject(\'${p.id}\')"');

// markProjectCompleted
code = code.replace(/window\.markProjectCompleted = function\(id\) \{[\s\S]*?renderAdminProjects\(\);\s*\}/, 'window.markProjectCompleted = async function(id) { await updateProjectStatus(id, \'completed\'); renderAdminProjects(); }');

// deleteProject
code = code.replace(/window\.deleteProject = function\(id\) \{/, 'window.deleteProject = async function(id) {');
code = code.replace(/removeProject\(id\);/, 'await removeProject(id);');

// saveProjectPrice
code = code.replace(/window\.saveProjectPrice = function\(id\) \{/, 'window.saveProjectPrice = async function(id) {');
code = code.replace(/updateProjectPrice\(id, newPrice\);/, 'await updateProjectPrice(id, newPrice);');

// renderAdminSettings
code = code.replace(/function renderAdminSettings\(\) \{/, 'async function renderAdminSettings() {');
code = code.replace(/const contact = getContactInfo\(\);/, 'const contact = await getContactInfo();');

// saveAdminSettings
code = code.replace(/window\.saveAdminSettings = function\(e\) \{/, 'window.saveAdminSettings = async function(e) {');
code = code.replace(/updateContactInfo\(newInfo\);/, 'await updateContactInfo(newInfo);');

fs.writeFileSync('e:/startup web/script.js', code);
console.log('script.js updated!');
