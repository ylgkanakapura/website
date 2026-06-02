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
    const tabs = ['waxing', 'hair', 'skin', 'nails', 'de-tan', 'mens-services', 'others'];
    
    tabs.forEach(tab => {
        const tabEl = document.getElementById(`tab-${tab}`);
        if (!tabEl) return;
        
        const listContainer = tabEl.querySelector('.tab-services-list');
        if (!listContainer) return;
        
        // Ensure 3-column DOM structure exists
        let bodyLayout = tabEl.querySelector('.tab-body-layout');
        let subSidebar = tabEl.querySelector('.tab-sub-sidebar');
        
        if (!bodyLayout) {
            bodyLayout = document.createElement('div');
            bodyLayout.className = 'tab-body-layout';
            
            subSidebar = document.createElement('div');
            subSidebar.className = 'tab-sub-sidebar';
            
            listContainer.parentNode.insertBefore(bodyLayout, listContainer);
            bodyLayout.appendChild(subSidebar);
            bodyLayout.appendChild(listContainer);
        }
        
        subSidebar.innerHTML = '';
        listContainer.innerHTML = '';
        
        const items = window.menuData[tab] || [];
        
        // Group items by subheading
        const groups = [];
        let currentGroup = null;
        
        items.forEach(item => {
            if (item.type === 'subheading') {
                if (currentGroup) {
                    groups.push(currentGroup);
                }
                currentGroup = {
                    name: item.name,
                    items: []
                };
            } else {
                if (!currentGroup) {
                    currentGroup = {
                        name: 'General Services',
                        items: []
                    };
                }
                currentGroup.items.push(item);
            }
        });
        if (currentGroup) {
            groups.push(currentGroup);
        }
        
        // Save groups on the tab element for search reference
        tabEl.serviceGroups = groups;
        
        // Function to render active group items
        const renderGroupItems = (group) => {
            listContainer.innerHTML = '';
            
            // Sub-category Title at the top of the list
            const titleEl = document.createElement('div');
            titleEl.className = 'service-list-subheading';
            titleEl.style.marginTop = '0';
            titleEl.style.paddingTop = '0';
            titleEl.innerHTML = `<h3>${group.name}</h3>`;
            listContainer.appendChild(titleEl);
            
            group.items.forEach(item => {
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
            
            listContainer.scrollTop = 0;
            listContainer.dispatchEvent(new Event('scroll'));
        };
        
        // Render sub-category buttons
        groups.forEach((group, index) => {
            if (group.items.length === 0) return;
            
            const btn = document.createElement('button');
            btn.className = 'sub-tab-btn';
            btn.type = 'button';
            btn.innerHTML = `
                <span class="sub-tab-text">${group.name}</span>
                <span class="sub-tab-chevron">›</span>
            `;
            
            btn.addEventListener('click', () => {
                subSidebar.querySelectorAll('.sub-tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Store active group index on tab element
                tabEl.dataset.activeSubIndex = index;
                
                renderGroupItems(group);
            });
            
            subSidebar.appendChild(btn);
        });
        
        // Select first subcategory by default
        const firstBtn = subSidebar.querySelector('.sub-tab-btn');
        if (firstBtn) {
            firstBtn.click();
        }
        
        // Wrap in .tab-services-wrapper for scroll fade indicator (iOS fix)
        if (!listContainer.parentElement.classList.contains('tab-services-wrapper')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'tab-services-wrapper';
            listContainer.parentNode.insertBefore(wrapper, listContainer);
            wrapper.appendChild(listContainer);

            // Check if scroll fade is needed; hide it when list is fully scrolled
            const checkFade = () => {
                const atBottom = listContainer.scrollHeight - listContainer.scrollTop <= listContainer.clientHeight + 4;
                wrapper.classList.toggle('at-bottom', atBottom);
            };
            listContainer.addEventListener('scroll', checkFade, { passive: true });
            checkFade();
        }
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
    
    const subSidebar = activeTab.querySelector('.tab-sub-sidebar');
    const listContainer = activeTab.querySelector('.tab-services-list');
    const groups = activeTab.serviceGroups || [];
    
    if (filter.trim() !== "") {
        // Hide sub-sidebar during search
        if (subSidebar) subSidebar.style.display = "none";
        
        // Render matching items across all categories
        listContainer.innerHTML = '';
        
        groups.forEach(group => {
            const matches = group.items.filter(item => {
                return item.name.toUpperCase().indexOf(filter) > -1 || 
                       item.desc.toUpperCase().indexOf(filter) > -1;
            });
            
            if (matches.length > 0) {
                const titleEl = document.createElement('div');
                titleEl.className = 'service-list-subheading';
                titleEl.innerHTML = `<h3>${group.name}</h3>`;
                listContainer.appendChild(titleEl);
                
                matches.forEach(item => {
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
            }
        });
        
        if (listContainer.innerHTML === '') {
            listContainer.innerHTML = '<div style="padding: 30px; text-align: center; color: #777;">No matching services found.</div>';
        }
    } else {
        // Show sub-sidebar
        if (subSidebar) {
            subSidebar.style.display = "flex";
        }
        
        // Restore currently active sub-category items
        const activeIdx = activeTab.dataset.activeSubIndex || 0;
        const activeGroup = groups[activeIdx];
        if (activeGroup) {
            listContainer.innerHTML = '';
            
            const titleEl = document.createElement('div');
            titleEl.className = 'service-list-subheading';
            titleEl.style.marginTop = '0';
            titleEl.style.paddingTop = '0';
            titleEl.innerHTML = `<h3>${activeGroup.name}</h3>`;
            listContainer.appendChild(titleEl);
            
            activeGroup.items.forEach(item => {
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
        }
    }
    
    // Update scroll fade indicator
    listContainer.dispatchEvent(new Event('scroll'));
}
