/*
   AyurQ — Premium Ayurveda Wellness JavaScript Core
   Shared Scripts and Interactions
*/

document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initLenis();
  initHeader();
  initMobileMenu();
  initScrollProgressBar();
  initGSAPAnimations();
  initFAQAccordion();
  initGalleryLightbox();
  initFormValidation();
});

/* 1. Page Loader Fade Out */
function initLoader() {
  const loader = document.getElementById('loading-screen');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
          loader.style.display = 'none';
        }, 800); // matches transition time
      }, 1500); // breathing intro time
    });
    
    // Fallback if load event takes too long
    setTimeout(() => {
      if (loader.style.display !== 'none') {
        loader.style.opacity = '0';
        setTimeout(() => {
          loader.style.display = 'none';
        }, 800);
      }
    }, 4000);
  }
}

/* 2. Lenis Smooth Scrolling */
let lenisInstance;
function initLenis() {
  if (typeof Lenis !== 'undefined') {
    lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }
}

/* 3. Header Scroll States */
function initHeader() {
  const header = document.querySelector('header.site-header');
  if (header) {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Run initially
  }
  
  // Highlight active link based on filename
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.desktop-nav .nav-list > li');
  
  navLinks.forEach(item => {
    const link = item.querySelector('.nav-link');
    if (link) {
      const href = link.getAttribute('href');
      // Simple exact match or fallback
      if (href === currentPath || 
          (currentPath === '' && href === 'index.html') ||
          (href !== 'index.html' && currentPath.includes(href.replace('.html', '')))) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    }
  });
}

/* 4. Mobile Menu Toggles and Accordions */
function initMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const body = document.body;

  if (toggleBtn && mobileMenu) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = toggleBtn.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      
      if (isOpen) {
        body.style.overflow = 'hidden';
        if (lenisInstance) lenisInstance.stop();
      } else {
        body.style.overflow = '';
        if (lenisInstance) lenisInstance.start();
      }
    });

    // Close mobile menu on clicking overlay background
    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) {
        toggleBtn.classList.remove('open');
        mobileMenu.classList.remove('open');
        body.style.overflow = '';
        if (lenisInstance) lenisInstance.start();
      }
    });

    // Close mobile menu on clicking anchors (excluding dropdown headers)
    const mobileLinks = mobileMenu.querySelectorAll('.mobile-menu-link:not(.has-sub)');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        toggleBtn.classList.remove('open');
        mobileMenu.classList.remove('open');
        body.style.overflow = '';
        if (lenisInstance) lenisInstance.start();
      });
    });

    // Mobile submenu accordions
    const dropdownToggles = mobileMenu.querySelectorAll('.mobile-menu-item-dropdown > .mobile-menu-link');
    dropdownToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const parent = toggle.parentElement;
        const submenu = parent.querySelector('.mobile-submenu');
        
        const isActive = parent.classList.toggle('active');
        if (isActive) {
          submenu.style.maxHeight = submenu.scrollHeight + 'px';
        } else {
          submenu.style.maxHeight = '0';
        }

        // Close other sibling dropdowns
        const siblings = parent.parentElement.children;
        Array.from(siblings).forEach(sib => {
          if (sib !== parent && sib.classList.contains('mobile-menu-item-dropdown')) {
            sib.classList.remove('active');
            const sibSub = sib.querySelector('.mobile-submenu');
            if (sibSub) sibSub.style.maxHeight = '0';
          }
        });
      });
    });
  }
}

/* 5. Scroll Progress Bar */
function initScrollProgressBar() {
  const progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / windowHeight) * 100;
      progressBar.style.width = `${progress}%`;
    });
  }
}

/* 6. GSAP and ScrollTrigger Reveals & Counters */
function initGSAPAnimations() {
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Hero Floating leaves animations (CSS handles background, GSAP handles text)
    const heroTitle = document.querySelector('.hero-title-anim');
    if (heroTitle) {
      const splitText = heroTitle.textContent.trim().split(/\s+/);
      heroTitle.innerHTML = splitText.map(word => `<span class="hero-word" style="display:inline-block; opacity:0; transform:translateY(30px); margin-right: 0.25em;">${word}</span>`).join('');
      
      const tl = gsap.timeline({ delay: 1.8 }); // Wait for loader
      tl.to('.hero-word', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out'
      })
      .to('.hero-sub-anim', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out'
      }, '-=0.4')
      .to('.hero-btn-anim', {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power3.out'
      }, '-=0.4');
    }

    // Scroll reveals using high-performance, hardware-accelerated IntersectionObserver
    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active');
            
            // If it is a stagger container, animate its children sequentially
            if (entry.target.classList.contains('reveal-stagger')) {
              const items = entry.target.querySelectorAll('.reveal-item');
              items.forEach((item, index) => {
                setTimeout(() => {
                  item.classList.add('reveal-active');
                }, index * 120);
              });
            }
            
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      });
      
      document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => {
        revealObserver.observe(el);
      });
    } else {
      // Fallback
      document.querySelectorAll('.reveal, .reveal-stagger, .reveal-item').forEach(el => {
        el.classList.add('reveal-active');
      });
    }

    // Digital counters count-up
    const counters = document.querySelectorAll('.counter-number');
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'), 10) || 0;
      
      ScrollTrigger.create({
        trigger: counter,
        start: 'top 90%',
        onEnter: () => {
          let countObj = { val: 0 };
          gsap.to(countObj, {
            val: target,
            duration: 2.2,
            ease: 'power1.out',
            onUpdate: () => {
              counter.textContent = Math.floor(countObj.val) + (counter.getAttribute('data-suffix') || '');
            }
          });
        },
        once: true
      });
    });

    // Parallax hero background
    const parallaxBg = document.querySelector('.parallax-bg');
    if (parallaxBg) {
      gsap.to(parallaxBg, {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: parallaxBg.parentElement,
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
    }
  } else {
    // Fallback if GSAP fails to load
    document.querySelectorAll('.reveal').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    document.querySelectorAll('.reveal-stagger').forEach(container => {
      container.querySelectorAll('.reveal-item').forEach(item => {
        item.style.opacity = '1';
        item.style.transform = 'none';
      });
    });
    document.querySelectorAll('.counter-number').forEach(counter => {
      counter.textContent = counter.getAttribute('data-target') + (counter.getAttribute('data-suffix') || '');
    });
  }
}

/* 7. FAQs Accordion Trigger Logic */
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    if (trigger) {
      trigger.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close all other accordions
        faqItems.forEach(otherItem => {
          otherItem.classList.remove('active');
        });

        // Toggle clicked
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });
}

/* 8. Pure JS Keyboard-Supported Lightbox (Gallery Page) */
function initGalleryLightbox() {
  const galleryItems = document.querySelectorAll('.gallery-grid-item, .gallery-item-trigger');
  
  if (galleryItems.length > 0) {
    // Dynamically insert lightbox HTML structure into body if it doesn't exist
    let lightbox = document.getElementById('gallery-lightbox');
    if (!lightbox) {
      lightbox = document.createElement('div');
      lightbox.id = 'gallery-lightbox';
      lightbox.className = 'lightbox';
      lightbox.innerHTML = `
        <button class="lightbox-close" aria-label="Close Lightbox">
          <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
        <button class="lightbox-nav lightbox-prev" aria-label="Previous Image">
          <svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
        </button>
        <div class="lightbox-content-container">
          <div class="lightbox-visual-block">
            <!-- Dynamically populated visual block (gradient or image) -->
          </div>
          <p class="lightbox-caption"></p>
        </div>
        <button class="lightbox-nav lightbox-next" aria-label="Next Image">
          <svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
        </button>
      `;
      document.body.appendChild(lightbox);
    }

    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    const visualBlock = lightbox.querySelector('.lightbox-visual-block');
    const captionText = lightbox.querySelector('.lightbox-caption');
    
    let currentIndex = 0;
    
    // Store data for all active gallery items
    let activeElements = [];

    const getActiveElements = () => {
      // Re-query in case filtering is active
      const allGalleryItems = Array.from(document.querySelectorAll('.gallery-grid-item, .gallery-item-trigger'));
      return allGalleryItems.filter(item => {
        // If there's a filter, only include visible items
        const isHidden = window.getComputedStyle(item).display === 'none' || 
                         window.getComputedStyle(item.closest('.gallery-card-wrapper') || item).display === 'none';
        return !isHidden;
      });
    };

    const updateLightboxContent = (index) => {
      const currentElement = activeElements[index];
      if (!currentElement) return;

      // Extract image source and class gradient backgrounds
      const img = currentElement.querySelector('.visual-image');
      const fallback = currentElement.querySelector('.visual-fallback');
      const caption = currentElement.getAttribute('data-caption') || currentElement.querySelector('h4')?.textContent || 'AyurQ Premium Wellness';
      
      visualBlock.innerHTML = ''; // Clear previous content
      
      if (img && img.complete && img.naturalWidth !== 0) {
        // High quality image loaded successfully, show it in the lightbox
        const lightboxImg = document.createElement('img');
        lightboxImg.src = img.src;
        lightboxImg.className = 'lightbox-image';
        lightboxImg.alt = caption;
        visualBlock.appendChild(lightboxImg);
      } else {
        // Fallback to beautiful CSS gradient placeholder
        const gradientClass = fallback ? Array.from(fallback.classList).find(c => c.startsWith('gradient-')) : 'gradient-herb';
        const fallbackBlock = document.createElement('div');
        fallbackBlock.className = `visual-fallback ${gradientClass}`;
        fallbackBlock.style.width = '100%';
        fallbackBlock.style.height = '100%';
        fallbackBlock.innerHTML = fallback ? fallback.innerHTML : '';
        visualBlock.appendChild(fallbackBlock);
      }
      
      captionText.textContent = caption;
    };

    const openLightbox = (index) => {
      activeElements = getActiveElements();
      currentIndex = index;
      updateLightboxContent(currentIndex);
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
      if (lenisInstance) lenisInstance.stop();
    };

    const closeLightbox = () => {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      if (lenisInstance) lenisInstance.start();
    };

    const showNext = () => {
      if (activeElements.length === 0) return;
      currentIndex = (currentIndex + 1) % activeElements.length;
      updateLightboxContent(currentIndex);
    };

    const showPrev = () => {
      if (activeElements.length === 0) return;
      currentIndex = (currentIndex - 1 + activeElements.length) % activeElements.length;
      updateLightboxContent(currentIndex);
    };

    // Attach click listeners to gallery elements
    const attachClickListeners = () => {
      // Re-attach elements in case they are dynamically filtered
      const currentActive = getActiveElements();
      
      currentActive.forEach((item, index) => {
        // Remove existing listener to prevent duplicate triggers
        item.removeEventListener('click', item._lightboxClick);
        
        item._lightboxClick = (e) => {
          e.preventDefault();
          // Find index in current active array
          const activeIndex = getActiveElements().indexOf(item);
          openLightbox(activeIndex);
        };
        
        item.addEventListener('click', item._lightboxClick);
      });
    };

    // Initialize listeners
    attachClickListeners();

    // Event listeners
    closeBtn.addEventListener('click', closeLightbox);
    nextBtn.addEventListener('click', showNext);
    prevBtn.addEventListener('click', showPrev);

    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    });

    // Close on click outside content
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    // Expose layout listener to re-attach after category filters
    window.refreshLightboxListeners = attachClickListeners;
  }

  // Gallery filtering logic
  const filterButtons = document.querySelectorAll('.gallery-filter-btn');
  const galleryItemsWrapper = document.querySelectorAll('.gallery-card-wrapper');
  
  if (filterButtons.length > 0) {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Active button highlight toggling
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.getAttribute('data-filter');
        
        galleryItemsWrapper.forEach(item => {
          if (filter === 'all' || item.getAttribute('data-category') === filter) {
            item.style.display = 'block';
            setTimeout(() => {
              item.style.opacity = '1';
              item.style.transform = 'scale(1)';
            }, 50);
          } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.9)';
            setTimeout(() => {
              item.style.display = 'none';
            }, 300);
          }
        });
        
        // Let animations recalculate ScrollTriggers
        setTimeout(() => {
          if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
          if (window.refreshLightboxListeners) window.refreshLightboxListeners();
        }, 350);
      });
    });
  }
}

/* 9. Contact and Booking Form Handlers with premium custom modals */
function initFormValidation() {
  const forms = document.querySelectorAll('.ayurq-form');
  
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      let isValid = true;
      const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
      
      inputs.forEach(input => {
        const value = input.value.trim();
        const inputGroup = input.parentElement;
        
        // Basic check
        if (!value) {
          isValid = false;
          inputGroup.classList.add('error');
        } else {
          inputGroup.classList.remove('error');
        }
        
        // Email match check
        if (input.type === 'email' && value) {
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailPattern.test(value)) {
            isValid = false;
            inputGroup.classList.add('error');
          }
        }

        // Phone pattern check (10 digits basic match)
        if (input.type === 'tel' && value) {
          const phonePattern = /^\d{10}$/;
          if (!phonePattern.test(value.replace(/[\s\-\+\(\)]/g, ''))) {
            isValid = false;
            inputGroup.classList.add('error');
          }
        }
      });
      
      if (isValid) {
        // Gorgeous confirmation modal reveal
        let successModal = document.getElementById('booking-success-modal');
        if (!successModal) {
          successModal = document.createElement('div');
          successModal.id = 'booking-success-modal';
          successModal.className = 'lightbox success-modal';
          successModal.innerHTML = `
            <div class="glass-dark" style="padding: 50px 40px; border-radius: 20px; max-width: 500px; text-align: center; color: var(--cream);">
              <div style="width: 80px; height: 80px; border-radius: 50%; background-color: var(--orange); display: flex; align-items: center; justify-content: center; margin: 0 auto 30px auto; color: var(--white);">
                <svg viewBox="0 0 24 24" style="width: 45px; height: 45px; fill: currentColor;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              </div>
              <h3 class="cormorant" style="font-size: 2.2rem; color: var(--white); margin-bottom: 15px;">Appointment Requested</h3>
              <p style="font-family: var(--font-body); font-size: 1rem; opacity: 0.85; margin-bottom: 30px; line-height: 1.6;">
                Thank you for choosing AyurQ. Our premium consultation desk will reach out to you within the next 2 hours to confirm your consultation schedule.
              </p>
              <button class="btn btn-primary close-success-modal-btn" style="width: 100%;">Close Window</button>
            </div>
          `;
          document.body.appendChild(successModal);
        }
        
        const closeBtn = successModal.querySelector('.close-success-modal-btn');
        
        successModal.classList.add('open');
        document.body.style.overflow = 'hidden';
        if (lenisInstance) lenisInstance.stop();
        
        const closeModal = () => {
          successModal.classList.remove('open');
          document.body.style.overflow = '';
          if (lenisInstance) lenisInstance.start();
          form.reset();
        };

        closeBtn.addEventListener('click', closeModal);
        successModal.addEventListener('click', (e) => {
          if (e.target === successModal) closeModal();
        });
      }
    });
    
    // Clear errors on typing
    const textElements = form.querySelectorAll('input, select, textarea');
    textElements.forEach(element => {
      element.addEventListener('input', () => {
        element.parentElement.classList.remove('error');
      });
    });
  });
}
