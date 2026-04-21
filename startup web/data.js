const initialProjects = [];

const testimonials = [
    {
        name: "Rahul Kumar",
        branch: "CSE, 4th Year",
        text: "The AI disease detection project was perfect. The code was well-documented, and they helped me set it up on my laptop. Highly recommended!"
    },
    {
        name: "Sneha Reddy",
        branch: "ECE, 3rd Year",
        text: "Ordered the Home Automation project. It arrived on time, completely assembled, and they even explained the circuit diagram to me for my viva."
    },
    {
        name: "Vikram Singh",
        branch: "Mechanical, Final Year",
        text: "Requested a custom braking system project. They understood the requirements perfectly and delivered a working prototype within a week."
    }
];

const initialContactInfo = {
    whatsapp: "919876543210",
    email: "support@creators.in",
    phone: "+91 98765 43210"
};

const firebaseConfig = {
  apiKey: "AIzaSyBiLhNxdow1VxTVGKNATMU8pDRXplomDyI",
  authDomain: "creators-in.firebaseapp.com",
  projectId: "creators-in",
  storageBucket: "creators-in.firebasestorage.app",
  messagingSenderId: "494958265479",
  appId: "1:494958265479:web:faa15c0d49324545c52422",
  measurementId: "G-WHDTPE0WZX"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Wait for initial data setup if DB is empty
async function setupInitialDataIfNeeded() {
    const projectsSnap = await db.collection('projects').limit(1).get();
    if (projectsSnap.empty) {
        for (const p of initialProjects) {
            await db.collection('projects').add(p);
        }
    }
    const contactSnap = await db.collection('settings').doc('contact').get();
    if (!contactSnap.exists) {
        await db.collection('settings').doc('contact').set(initialContactInfo);
    }
}

// Ensure setup runs
const setupPromise = setupInitialDataIfNeeded();

// Helper Functions
async function getProjects() {
    await setupPromise;
    const snapshot = await db.collection('projects').get();
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
}

async function updateProjectPrice(id, newPrice) {
    await db.collection('projects').doc(id).update({ price: newPrice });
}

async function updateProjectStatus(id, newStatus) {
    await db.collection('projects').doc(id).update({ status: newStatus });
}

async function getContactInfo() {
    await setupPromise;
    const doc = await db.collection('settings').doc('contact').get();
    return doc.data();
}

async function updateContactInfo(newInfo) {
    await db.collection('settings').doc('contact').set(newInfo);
}

async function getRequests() {
    const snapshot = await db.collection('requests').get();
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
}

async function addRequest(request) {
    request.date = new Date().toLocaleDateString();
    await db.collection('requests').add(request);
}

async function addProject(project) {
    await db.collection('projects').add(project);
}

async function removeProject(id) {
    await db.collection('projects').doc(id).delete();
}

async function removeRequest(id) {
    await db.collection('requests').doc(id).delete();
}
