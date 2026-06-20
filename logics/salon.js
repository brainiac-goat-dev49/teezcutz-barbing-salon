// Render Dynamic Products to Homepage Grid & Clear Hardcoded Mock Cards
function renderHomepageServices(products) {
  const container = document.getElementById('services-grid') || 
                    document.getElementById('services-container') || 
                    document.getElementById('services-showcase') ||
                    document.querySelector('.services-grid');
  
  if (!container) return;
  
  container.innerHTML = '';
  
  products.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'premium-card p-6 md:p-8 rounded-2xl border border-zinc-900 bg-black/60 relative overflow-hidden group hover:border-white/20 transition-all duration-500 flex flex-col justify-between';
    
    let imageHTML = '';
    if (prod.image1) {
      imageHTML = `
        <div class="relative w-full h-48 mb-6 rounded-xl overflow-hidden bg-stone-900 border border-zinc-800">
          <img src="${prod.image1}" alt="${prod.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ${prod.image2 ? `
            <img src="${prod.image2}" alt="${prod.name} detail" class="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          ` : ''}
          <span class="absolute top-3 right-3 bg-black/80 backdrop-blur-md border border-zinc-800 text-[10px] tracking-widest text-stone-300 font-bold uppercase py-1 px-2.5 rounded-full">${prod.tag || 'Service'}</span>
        </div>
      `;
    } else {
      imageHTML = `
        <div class="mb-6 flex items-center justify-between">
          <div class="w-14 h-14 rounded-xl bg-stone-900 border border-zinc-800 flex items-center justify-center text-2xl group-hover:border-zinc-500 transition-colors duration-300">
            ${prod.icon || '✂️'}
          </div>
          <span class="bg-stone-900/80 border border-zinc-800 text-[10px] tracking-widest text-stone-300 font-bold uppercase py-1 px-2.5 rounded-full">${prod.tag || 'Service'}</span>
        </div>
      `;
    }

    card.innerHTML = `
      <div>
        ${imageHTML}
        <h3 class="font-display text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-stone-200 transition-colors">${prod.name}</h3>
        <p class="text-stone-400 text-sm leading-relaxed mb-6 font-light">${prod.description || 'Premium custom treatment tailored to your look.'}</p>
      </div>
      <div class="flex items-center justify-between pt-4 border-t border-zinc-900">
        <div>
          <span class="text-xs text-stone-500 block uppercase tracking-wider font-semibold">Starting at</span>
          <span class="text-xl font-bold text-white font-display">₦${prod.price.toLocaleString()}</span>
        </div>
        <a href="#booking" class="inline-flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider border-b border-white/40 pb-1 hover:border-white transition-all duration-300">
          Book Session
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    `;
    
    container.appendChild(card);
  });
}

// Dynamic subscription to customizer and service catalog options
function listenToDynamicServices() {
  const checkInterval = setInterval(() => {
    if (window.FirebaseSync && typeof window.FirebaseSync.onProductsUpdate === 'function') {
      clearInterval(checkInterval);
      window.FirebaseSync.onProductsUpdate((products) => {
        state.prices.services = {};
        const serviceSelect = document.getElementById('booking-service');
        if (serviceSelect) {
          const currentVal = serviceSelect.value;
          serviceSelect.innerHTML = '';
          products.forEach((prod) => {
            state.prices.services[prod.id] = prod.price;
            const opt = document.createElement('option');
            opt.value = prod.id;
            opt.textContent = `${prod.icon || '✂️'} ${prod.name} (₦${prod.price.toLocaleString()})`;
            serviceSelect.appendChild(opt);
          });
          if (currentVal && state.prices.services[currentVal]) {
            serviceSelect.value = currentVal;
          } else if (products.length > 0) {
            serviceSelect.value = products[0].id;
          }
        }
        renderHomepageServices(products);
        calculateDynamicPrice();
      });
    }
  }, 300);
}