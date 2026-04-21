const initialProjects = [
    {
        id: 1,
        title: "IoT Based Smart Agriculture System",
        category: "ECE",
        shortDesc: "Automated irrigation and crop monitoring using IoT.",
        fullDesc: "This project uses IoT sensors to monitor soil moisture, temperature, and humidity, and automatically waters the crop based on the threshold values. It also sends real-time data to a mobile app.",
        components: "ESP32, Soil Moisture Sensor, DHT11, Relay Module, Water Pump",
        output: "Real-time monitoring dashboard and automated water supply.",
        price: "₹3500",
        image: "https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 2,
        title: "AI Based Plant Disease Detection",
        category: "CSE",
        shortDesc: "Machine learning model to identify leaf diseases.",
        fullDesc: "A convolutional neural network (CNN) model trained on a dataset of diseased plant leaves. Users can upload an image, and the system identifies the disease and suggests remedies.",
        components: "Python, TensorFlow, Keras, Flask, React",
        output: "Web application predicting disease with 95% accuracy.",
        price: "₹4500",
        image: "https://images.unsplash.com/photo-1530836369250-ef71a3f5e481?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 3,
        title: "Solar Powered Auto Charging Vehicle",
        category: "EEE",
        shortDesc: "Electric vehicle that charges via solar panels.",
        fullDesc: "A mini electric vehicle prototype equipped with solar panels on the roof to continuously charge the battery during daylight, increasing the vehicle's range.",
        components: "Solar Panel, Charge Controller, DC Motor, 12V Battery, Microcontroller",
        output: "Functional EV prototype with self-charging capability.",
        price: "₹5000",
        image: "https://images.unsplash.com/photo-1509391366360-1f9509ce1581?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 4,
        title: "Smart Braking System",
        category: "Mechanical",
        shortDesc: "Automatic braking system to prevent collisions.",
        fullDesc: "An intelligent braking system that uses ultrasonic sensors to detect obstacles in front of the vehicle and automatically applies brakes if the driver fails to react in time.",
        components: "Ultrasonic Sensor, Arduino, Servo Motor, Braking Mechanism",
        output: "Prototype vehicle demonstrating automatic collision avoidance.",
        price: "₹4000",
        image: "https://images.unsplash.com/photo-1551040855-ab1cb960780d?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 5,
        title: "E-Commerce Website with Payment Gateway",
        category: "CSE",
        shortDesc: "Full-stack e-commerce platform.",
        fullDesc: "A complete e-commerce solution featuring product listings, cart functionality, user authentication, and Stripe/Razorpay payment gateway integration.",
        components: "React, Node.js, Express, MongoDB, Razorpay",
        output: "Fully functional e-commerce website.",
        price: "₹3000",
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 6,
        title: "Home Automation System via Bluetooth",
        category: "ECE",
        shortDesc: "Control home appliances using a smartphone.",
        fullDesc: "A low-cost home automation system allowing users to switch on/off lights and fans using a custom Android app via Bluetooth communication.",
        components: "Arduino Uno, HC-05 Bluetooth Module, Relay Board",
        output: "Android app and hardware setup controlling 4 appliances.",
        price: "₹2500",
        image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80"
    }
];

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
