document.addEventListener('DOMContentLoaded', () => {
    // 1. WhatsApp Form Builder
    const appointmentForm = document.getElementById('appointmentForm');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const date = document.getElementById('date').value;
            const time = document.getElementById('time').value;
            const service = document.getElementById('service').value;
            const notes = document.getElementById('notes').value;

            // WhatsApp number placeholder - replace with actual number
            const waNumber = '919876543210'; 
            
            let message = `Hi, I'd like to book an appointment at YLG Vajarahalli.\n\n`;
            message += `*Name:* ${name}\n`;
            message += `*Phone:* ${phone}\n`;
            message += `*Date:* ${date}\n`;
            message += `*Time:* ${time}\n`;
            message += `*Service:* ${service}\n`;
            if (notes) {
                message += `*Notes:* ${notes}\n`;
            }

            const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
            // window.open(waUrl, '_blank'); // Disabled to prevent redirect
        });
    }

    // 2. Lightbox functionality
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeLightbox = document.querySelector('.close-lightbox');

    if (galleryItems.length > 0 && lightbox) {
        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img');
                lightbox.classList.add('active');
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            });
        });

        closeLightbox.addEventListener('click', () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // 3. Scroll Animations (Intersection Observer)
    const fadeElements = document.querySelectorAll('.fade-in');

    const appearOptions = {
        threshold: 0.08,
        rootMargin: "0px 0px 0px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            }
            entry.target.classList.add('appear');
            observer.unobserve(entry.target);
        });
    }, appearOptions);

    fadeElements.forEach(element => {
        // If already in viewport on page load, reveal immediately
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            element.classList.add('appear');
        } else {
            appearOnScroll.observe(element);
        }
    });

    // 4. Sticky Header Behavior
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // 5. Active Nav Link on Scroll
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a, .nav-links li a');

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { threshold: 0.35 });

    sections.forEach(section => sectionObserver.observe(section));


    // 7. Service Card subtle hover tilt (desktop only)
    if (window.innerWidth > 768) {
        document.querySelectorAll('.service-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                const tiltX = (y / rect.height) * 6;
                const tiltY = -(x / rect.width) * 6;
                card.style.transform = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-5px)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // 8. Menu Rendering
    if (window.menuData) {
        renderMenu();
    }
});

function renderMenu() {
    const tabs = ['hair', 'skin', 'waxing', 'nails', 'packages', 'de-tan', 'makeup', 'others'];
    
    tabs.forEach(tab => {
        const listContainer = document.querySelector(`#tab-${tab} .tab-services-list`);
        if (!listContainer) return;
        
        listContainer.innerHTML = ''; // Clear hardcoded
        
        const items = window.menuData[tab] || [];
        items.forEach(item => {
            const el = document.createElement('div');
            el.className = 'service-list-item';
            el.innerHTML = `
                <div class="service-icon"><span style="color:#c2185b; font-size:12px;">✦</span></div>
                <div class="service-info">
                    <span class="service-name">${item.name}</span>
                    <span class="service-desc">${item.desc}</span>
                </div>
                <div class="service-dots"></div>
                <div class="service-price">${item.price}</div>
            `;
            listContainer.appendChild(el);
        });
    });
}

function filterMenu() {
    const input = document.getElementById("menuSearchInput");
    if (!input) return;
    const filter = input.value.toUpperCase();
    
    // Find the currently active tab by checking the computed display style or active class
    const activeTab = Array.from(document.querySelectorAll(".service-tab-content"))
        .find(tab => tab.style.display === 'block' || window.getComputedStyle(tab).display === 'block');
        
    if (!activeTab) return;
    
    const items = activeTab.querySelectorAll(".service-list-item");
    
    items.forEach(item => {
        const nameNode = item.querySelector(".service-name");
        const descNode = item.querySelector(".service-desc");
        if (!nameNode || !descNode) return;
        
        const name = nameNode.textContent;
        const desc = descNode.textContent;
        if (name.toUpperCase().indexOf(filter) > -1 || desc.toUpperCase().indexOf(filter) > -1) {
            item.style.display = "flex";
        } else {
            item.style.display = "none";
        }
    });
}
