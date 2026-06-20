/**
 * TeezCutz Premium - Firebase Integration Module (Production Ready)
 * Features: Dynamic Firebase v9 Compat SDK loader, real-time Firestore sync
 * for both bookings (reservations) and customizable products, fallback management, and Admin state synchronization.
 * Date Rule: 2026
 */

window.FirebaseSync = (function() {
  let db = null;
  let auth = null;
  let isFirebaseLoaded = false;
  let authStateCallback = null;
  
  // Real Production Firebase Config
  const firebaseConfig = {
    apiKey: "AIzaSyDttst9w--TpHEHStjo345TMCfGNq3vwBo",
    authDomain: "studio-2910052238-e5ae1.firebaseapp.com",
    projectId: "studio-2910052238-e5ae1",
    storageBucket: "studio-2910052238-e5ae1.firebasestorage.app",
    messagingSenderId: "646487006918",
    appId: "1:646487006918:web:e270cc4debed7c079601c7"
  };

  // No hardcoded mock bookings - started completely empty for user-driven data
  let simulatedBookings = [];

  // Minimal default product templates to seed when the cloud database is initialized
  const defaultProductTemplates = [
    { id: "prod-1", name: "Classic Signature Trim", tag: "Signature", price: 4000, icon: "✂️", description: "Premium razor-edge trim with soothing hot towel experience.", image1: "", image2: "" },
    { id: "prod-2", name: "VVIP Royal Treatment", tag: "Luxury", price: 10000, icon: "👑", description: "The ultimate styling package, complete with dynamic scalp therapy and facial mask.", image1: "", image2: "" }
  ];

  let simulatedProducts = [];

  // Dynamic SDK Loader Utility
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async function loadFirebaseLibraries() {
    if (typeof firebase !== 'undefined') return;
    try {
      // Load standard Firebase compat layers dynamically for robust compatibility
      await loadScript("https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js");
      await loadScript("https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js");
      await loadScript("https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js");
    } catch (err) {
      console.warn("Could not load Firebase CDNs. Reverting to robust localStorage fallbacks.", err);
    }
  }

  async function init() {
    await loadFirebaseLibraries();

    if (typeof firebase !== 'undefined') {
      try {
        if (!firebase.apps.length) {
          firebase.initializeApp(firebaseConfig);
        }
        db = firebase.firestore();
        auth = firebase.auth();
        
        // Enable offline persistence if possible
        db.enablePersistence().catch((err) => {
          if (err.code == 'failed-precondition') {
            console.warn("Persistence failed: multiple tabs open");
          } else if (err.code == 'unimplemented') {
            console.warn("Persistence is not supported by current browser");
          }
        });

        isFirebaseLoaded = true;
        console.log("🔥 Production Firebase real-time Sync Engine connected successfully (2026).");
        
        // Listen to Auth State Changes
        if (auth && authStateCallback) {
          auth.onAuthStateChanged(authStateCallback);
        }

        // Populate initial default products in Firestore if collection is empty
        ensureDefaultProducts();
      } catch (e) {
        console.error("Firebase Initialization Error. Switching to local sandbox mode:", e);
        setupLocalStorageSimulator();
      }
    } else {
      setupLocalStorageSimulator();
    }
  }

  function setupLocalStorageSimulator() {
    isFirebaseLoaded = false;
    if (!localStorage.getItem('teezcutz_bookings')) {
      localStorage.setItem('teezcutz_bookings', JSON.stringify(simulatedBookings));
    } else {
      try { simulatedBookings = JSON.parse(localStorage.getItem('teezcutz_bookings')); } catch(e) {}
    }

    if (!localStorage.getItem('teezcutz_products')) {
      localStorage.setItem('teezcutz_products', JSON.stringify(defaultProductTemplates));
    } else {
      try { simulatedProducts = JSON.parse(localStorage.getItem('teezcutz_products')); } catch(e) {}
    }
  }

  async function ensureDefaultProducts() {
    if (!db) return;
    try {
      const snap = await db.collection("products").limit(1).get();
      if (snap.empty) {
        for (const prod of defaultProductTemplates) {
          await db.collection("products").doc(prod.id).set({
            name: prod.name,
            tag: prod.tag,
            price: prod.price,
            icon: prod.icon,
            description: prod.description,
            image1: prod.image1,
            image2: prod.image2,
            updatedAt: new Date().toISOString()
          });
        }
        console.log("Default customizable products seeded in cloud database.");
      }
    } catch (e) {
      console.warn("Seeding products skipped:", e);
    }
  }

  return {
    initialize: function() {
      return init();
    },

    isCloudActive: function() {
      return isFirebaseLoaded;
    },

    // --- STANDARD AUTH OPERATIONS ---
    signInAdmin: async function(email, password) {
      if (isFirebaseLoaded && auth) {
        return auth.signInWithEmailAndPassword(email, password);
      } else {
        // Fallback simulated authentication for testing / local sandbox mode
        if (email === "admin@teezcutz.com" && password === "admin2026") {
          localStorage.setItem('teezcutz_simulated_auth', 'true');
          if (authStateCallback) authStateCallback({ email: "admin@teezcutz.com" });
          return { user: { email: "admin@teezcutz.com" } };
        } else {
          throw new Error("Authentication failed. Use Firebase Auth credentials or fallback credentials.");
        }
      }
    },

    signOutAdmin: async function() {
      if (isFirebaseLoaded && auth) {
        return auth.signOut();
      } else {
        localStorage.removeItem('teezcutz_simulated_auth');
        if (authStateCallback) authStateCallback(null);
      }
    },

    onAuthStateChanged: function(callback) {
      authStateCallback = callback;
      if (isFirebaseLoaded && auth) {
        return auth.onAuthStateChanged(callback);
      } else {
        const checkLocal = () => {
          const isAuthed = localStorage.getItem('teezcutz_simulated_auth') === 'true';
          callback(isAuthed ? { email: "admin@teezcutz.com" } : null);
        };
        checkLocal();
        return () => {};
      }
    },

    // --- BOOKING OPERATIONS ---
    saveBooking: async function(bookingData) {
      const payload = {
        name: bookingData.name || "Anonymous Client",
        phone: bookingData.phone || "",
        service: bookingData.service || "signature",
        barber: bookingData.barber || "teez",
        date: bookingData.date || "2026-06-15",
        time: bookingData.time || "09:00 AM",
        customized: bookingData.customized || false,
        price: Number(bookingData.price) || 4000,
        status: "Active",
        createdAt: new Date().toISOString()
      };

      if (isFirebaseLoaded && db) {
        try {
          const docRef = await db.collection("bookings").add(payload);
          return { success: true, id: docRef.id, provider: "Firestore" };
        } catch (error) {
          console.error("Firestore sync write failed, fallback to local store:", error);
        }
      }

      // Local Storage Fallback
      const newLocal = { id: 'bk-' + Date.now(), ...payload };
      simulatedBookings.unshift(newLocal);
      localStorage.setItem('teezcutz_bookings', JSON.stringify(simulatedBookings));
      
      window.dispatchEvent(new CustomEvent('bookingSyncComplete', { detail: simulatedBookings }));
      return { success: true, id: newLocal.id, provider: "LocalStorage" };
    },

    updateBookingStatus: async function(bookingId, newStatus) {
      if (isFirebaseLoaded && db) {
        try {
          await db.collection("bookings").doc(bookingId).update({ status: newStatus });
          return true;
        } catch (e) {
          console.error("Failed to update status on cloud", e);
        }
      }
      
      const idx = simulatedBookings.findIndex(b => b.id === bookingId);
      if (idx !== -1) {
        simulatedBookings[idx].status = newStatus;
        localStorage.setItem('teezcutz_bookings', JSON.stringify(simulatedBookings));
        window.dispatchEvent(new CustomEvent('bookingSyncComplete', { detail: simulatedBookings }));
        return true;
      }
      return false;
    },

    onBookingsUpdate: function(callback) {
      if (isFirebaseLoaded && db) {
        return db.collection("bookings")
          .orderBy("createdAt", "desc")
          .onSnapshot(snapshot => {
            const list = [];
            snapshot.forEach(doc => {
              list.push({ id: doc.id, ...doc.data() });
            });
            callback(list);
          }, error => {
            console.error("Real-time bookings subscriber error:", error);
            callback(simulatedBookings);
          });
      } else {
        window.addEventListener('bookingSyncComplete', (e) => callback(e.detail));
        callback(simulatedBookings);
        return () => {};
      }
    },

    // --- PRODUCTS & SERVICES CUSTOMIZER OPERATIONS ---
    saveProduct: async function(productId, productData) {
      const payload = {
        name: productData.name || "Unnamed Custom Cut",
        tag: productData.tag || "Custom",
        price: Number(productData.price) || 3000,
        icon: productData.icon || "💈",
        description: productData.description || "",
        image1: productData.image1 || "", // Base64 picture 1
        image2: productData.image2 || "", // Base64 picture 2
        updatedAt: new Date().toISOString()
      };

      if (isFirebaseLoaded && db) {
        try {
          if (productId) {
            await db.collection("products").doc(productId).set(payload, { merge: true });
          } else {
            await db.collection("products").add(payload);
          }
          return { success: true, provider: "Firestore" };
        } catch (error) {
          console.error("Firestore product write failed:", error);
        }
      }

      // Local Storage Fallback
      if (productId) {
        const idx = simulatedProducts.findIndex(p => p.id === productId);
        if (idx !== -1) {
          simulatedProducts[idx] = { id: productId, ...payload };
        }
      } else {
        const newProd = { id: 'prod-' + Date.now(), ...payload };
        simulatedProducts.push(newProd);
      }
      localStorage.setItem('teezcutz_products', JSON.stringify(simulatedProducts));
      window.dispatchEvent(new CustomEvent('productSyncComplete', { detail: simulatedProducts }));
      return { success: true, provider: "LocalStorage" };
    },

    deleteProduct: async function(productId) {
      if (isFirebaseLoaded && db) {
        try {
          await db.collection("products").doc(productId).delete();
          return true;
        } catch (e) {
          console.error("Failed to delete product from cloud:", e);
        }
      }

      simulatedProducts = simulatedProducts.filter(p => p.id !== productId);
      localStorage.setItem('teezcutz_products', JSON.stringify(simulatedProducts));
      window.dispatchEvent(new CustomEvent('productSyncComplete', { detail: simulatedProducts }));
      return true;
    },

    onProductsUpdate: function(callback) {
      if (isFirebaseLoaded && db) {
        return db.collection("products")
          .orderBy("updatedAt", "desc")
          .onSnapshot(snapshot => {
            const list = [];
            snapshot.forEach(doc => {
              list.push({ id: doc.id, ...doc.data() });
            });
            if (list.length === 0) {
              callback(simulatedProducts);
            } else {
              callback(list);
            }
          }, error => {
            console.error("Real-time products subscription error:", error);
            callback(simulatedProducts);
          });
      } else {
        window.addEventListener('productSyncComplete', (e) => callback(e.detail));
        callback(simulatedProducts);
        return () => {};
      }
    }
  };
})();

// Function to dynamically inject brand logo and favicon
function injectBrandAssets() {
  try {
    // 1. Favicon Override
    const faviconSelectors = ["link[rel='icon']", "link[rel='shortcut icon']", "link[rel='apple-touch-icon']"];
    let faviconUpdated = false;
    faviconSelectors.forEach(selector => {
      const link = document.querySelector(selector);
      if (link) {
        link.href = 'TeezCutz-logo.jpeg';
        faviconUpdated = true;
      }
    });
    if (!faviconUpdated) {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = 'TeezCutz-logo.jpeg';
      document.head.appendChild(link);
    }

    // 2. Dynamic Header & Footer Brand Injection
    const selectors = [
      'header a', 'nav a', 'footer a', 
      '.brand-logo', '#brand-logo', '.logo', '#logo',
      'a[href="#"]', 'a[href="index.html"]'
    ];
    
    document.querySelectorAll(selectors.join(', ')).forEach(el => {
      if (el.href && (el.href.includes('tel:') || el.href.includes('mailto:') || el.href.includes('instagram.com') || el.href.includes('facebook.com') || el.href.includes('twitter.com'))) {
        return;
      }
      
      const innerText = el.textContent.trim().toLowerCase();
      const hasBrandKeyword = innerText.includes('teez') || innerText.includes('cutz') || innerText.includes('✂️');
      const hasLogoIdentifier = (el.id && el.id.toLowerCase().includes('logo')) || (el.className && el.className.toLowerCase().includes('logo'));
      
      if (hasBrandKeyword || hasLogoIdentifier) {
        const logoImg = document.createElement('img');
        logoImg.src = 'TeezCutz-logo.jpeg';
        logoImg.alt = 'TeezCutz Logo';
        logoImg.className = 'h-10 md:h-12 w-auto object-contain rounded border border-zinc-800 hover:border-zinc-500 transition-all duration-300 inline-block shadow-md';
        
        el.innerHTML = '';
        el.appendChild(logoImg);
      }
    });

    // 3. Remove residual separate text brands/icons directly adjacent to brand links
    const textBrands = document.querySelectorAll('header span, header h1, footer span, footer h2, footer h3');
    textBrands.forEach(el => {
      const text = el.textContent.trim();
      if (text === 'TeezCutz' || text === '✂️ TeezCutz' || text === 'TeezCutz Premium') {
        el.remove();
      }
    });
  } catch (err) {
    console.warn("Brand assets injection warning:", err);
  }
}

// Auto-initialize
document.addEventListener("DOMContentLoaded", () => {
  window.FirebaseSync.initialize();
  injectBrandAssets();
});

// Run again on full load to ensure dynamically rendered components get styled/injected
window.addEventListener("load", injectBrandAssets);