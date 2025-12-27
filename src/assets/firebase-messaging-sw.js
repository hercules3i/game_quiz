importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// Initialize Firebase
firebase.initializeApp({
    apiKey: "AIzaSyCW-lBwakMAUAM7CbqmlDhjWG2nOmSTfYM",
    authDomain: "metalearn-7fa70.firebaseapp.com",
    projectId: "metalearn-7fa70",
    storageBucket: "metalearn-7fa70.firebasestorage.app",
    messagingSenderId: "322906159773",
    appId: "1:322906159773:web:8ebd4404809c25b6223274",
    measurementId: "G-N4PWQ2CN0B"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.setBackgroundMessageHandler(function (payload) {
    console.log('Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/assets/icon/firebase-logo.png'
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});
