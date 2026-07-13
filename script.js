/**
 * ════════════════════════════════════════════════════════════════════════════
 * Inspire TALENT HUB — ENTERPRISE JAVASCRIPT ARCHITECTURE
 * Version: 2.0.0
 * Architecture: Pure Vanilla JS, ES6+, Zero Dependencies
 * Features: WebGL Engine, Custom Cursor, Magnetic Physics, Scroll Observers
 * ════════════════════════════════════════════════════════════════════════════
 */

"use strict";

/* ───────────────────────────────────────────────────────────────────────────
   CORE UTILITIES & HELPERS
─────────────────────────────────────────────────────────────────────────── */
const DOM = {
    get: (selector, ctx = document) => ctx.querySelector(selector),
    getAll: (selector, ctx = document) => Array.from(ctx.querySelectorAll(selector)),
    css: (el, styles) => Object.assign(el.style, styles)
};

const MathUtils = {
    lerp: (start, end, factor) => start + (end - start) * factor,
    clamp: (val, min, max) => Math.min(Math.max(val, min), max),
    rand: (min, max) => Math.random() * (max - min) + min,
    mapRange: (val, inMin, inMax, outMin, outMax) => ((val - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
};

/* ───────────────────────────────────────────────────────────────────────────
   1. CINEMATIC LOADER ENGINE
─────────────────────────────────────────────────────────────────────────── */
(function initializeLoader() {
    const loader = DOM.get('#loader');
    if (!loader) return;

    // Lock scroll during load
    document.body.style.overflow = 'hidden';

    // Artificial delay to ensure WebGL context establishes and fonts render
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('fade-out');
            document.body.style.overflow = ''; // Unlock scroll
            
            // Trigger explicit hero reveal sequences
            setTimeout(() => {
                DOM.getAll('#hero .reveal').forEach(el => el.classList.add('visible'));
            }, 300);
        }, 1800); // 1.8s load time for premium pacing
    });
})();

/* ───────────────────────────────────────────────────────────────────────────
   2. BULLETPROOF CUSTOM CURSOR SYSTEM
─────────────────────────────────────────────────────────────────────────── */
(function initializeCursor() {
    // Only initialize on devices with a fine pointer (mouse/trackpad)
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const dot = DOM.get('#cursorDot');
    const outline = DOM.get('#cursorOutline');
    if (!dot || !outline) return;

    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let pos = { x: mouse.x, y: mouse.y };
    let isVisible = false;

    // Track mouse movement
    window.addEventListener('mousemove', (e) => {
        if (!isVisible) {
            dot.style.opacity = 1;
            outline.style.opacity = 1;
            isVisible = true;
        }
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        
        // Dot follows instantly
        dot.style.transform = `translate(${mouse.x}px, ${mouse.y}px) translate(-50%, -50%)`;
    });

    // Render loop for smooth trailing outline
    const renderCursor = () => {
        pos.x = MathUtils.lerp(pos.x, mouse.x, 0.2); // 0.2 controls the "drag" lag
        pos.y = MathUtils.lerp(pos.y, mouse.y, 0.2);
        outline.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`;
        requestAnimationFrame(renderCursor);
    };
    requestAnimationFrame(renderCursor);

    // Hover State Management
    const bindHoverStates = () => {
        const interactables = DOM.getAll('a, button, input, textarea, summary, .hover-target, .comp-card, .flip-card');
        
        interactables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.classList.add('cursor-hover');
            });
            el.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-hover');
            });
        });
    };
    bindHoverStates();

    // Click State Management
    window.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
    window.addEventListener('mouseup', () => document.body.classList.remove('cursor-click'));
})();

/* ───────────────────────────────────────────────────────────────────────────
   3. MAGNETIC PHYSICS ENGINE (Buttons & Cards)
─────────────────────────────────────────────────────────────────────────── */
(function initializeMagnetics() {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    // Magnetic Buttons
    const magnets = DOM.getAll('.btn-magnetic-wrap');
    magnets.forEach(wrap => {
        const btn = wrap.querySelector('.btn, .btn-lux, .nav-cta');
        if (!btn) return;

        wrap.addEventListener('mousemove', (e) => {
            const rect = wrap.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            // Apply subtle translation (magnetic pull)
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });

        wrap.addEventListener('mouseleave', () => {
            // Snap back to center
            btn.style.transform = 'translate(0px, 0px)';
        });
    });

    // 3D Tilt Cards (Why Us & Stats)
    const tiltCards = DOM.getAll('.feature-item, .stat-item');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            
            // Calculate rotation percentages
            const rotX = -((e.clientY - cy) / (rect.height / 2)) * 4; // Max 4 deg
            const rotY = ((e.clientX - cx) / (rect.width / 2)) * 4;

            card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    });
})();

/* ───────────────────────────────────────────────────────────────────────────
   4. ADVANCED NAVIGATION CONTROLLER
─────────────────────────────────────────────────────────────────────────── */
(function initializeNavigation() {
    const navbar = DOM.get('#navbar');
    const hamburger = DOM.get('#navHamburger');
    const navLinks = DOM.get('#navLinks');
    
    if (!navbar) return;

    // Scroll state listener
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        
        // Add solid background if scrolled past threshold
        if (currentScrollY > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScrollY = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    // Mobile Menu Toggle logic
    if (hamburger && navLinks) {
        const toggleMenu = () => {
            const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
            
            // Toggle Accessibility States
            hamburger.setAttribute('aria-expanded', !isExpanded);
            hamburger.classList.toggle('open');
            navLinks.classList.toggle('open');
            
            // Lock body scroll to prevent background sliding
            document.body.style.overflow = isExpanded ? '' : 'hidden';
        };

        hamburger.addEventListener('click', toggleMenu);

        // Close menu when a link is clicked
        DOM.getAll('.nav-link', navLinks).forEach(link => {
            link.addEventListener('click', () => {
                if(navLinks.classList.contains('open')) toggleMenu();
            });
        });
    }
})();

/* ───────────────────────────────────────────────────────────────────────────
   5. HIGH-PERFORMANCE SCROLL REVEAL (Intersection Observer)
─────────────────────────────────────────────────────────────────────────── */
(function initializeScrollReveal() {
    const revealElements = DOM.getAll('.reveal');
    if (!revealElements.length) return;

    const observerOptions = {
        root: null,
        rootMargin: "0px 0px -12% 0px", // Trigger slightly before element enters view
        threshold: 0.1
    };
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                
                // Read optional data-delay attribute for staggered animations
                const delay = el.getAttribute('data-delay');
                if (delay) el.style.transitionDelay = `${delay}ms`;
                
                el.classList.add('visible');
                observer.unobserve(el); // Prevent re-triggering for performance
            }
        });
    }, observerOptions);
    
    revealElements.forEach(el => {
        // Exclude hero elements as they are managed by the cinematic loader
        if (!el.closest('#hero')) {
            revealObserver.observe(el);
        }
    });
})();

/* ───────────────────────────────────────────────────────────────────────────
   6. ACCESSIBLE TABBED INTERFACE
─────────────────────────────────────────────────────────────────────────── */
(function initializeTabs() {
    const tabBtns = DOM.getAll('.tab-btn');
    const tabPanels = DOM.getAll('.tab-panel');
    if (!tabBtns.length) return;

    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Reset all states
            tabBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            tabPanels.forEach(p => p.classList.remove('active'));
            
            // Activate clicked tab
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            
            // Show corresponding panel
            const targetId = btn.getAttribute('aria-controls') || btn.getAttribute('data-target');
            const targetPanel = DOM.get(`#${targetId}`);
            if (targetPanel) targetPanel.classList.add('active');
        });
        
        // Keyboard navigation (WCAG Compliance)
        btn.addEventListener('keydown', (e) => {
            let index = tabBtns.indexOf(e.target);
            if (e.key === 'ArrowRight') {
                index = (index + 1) % tabBtns.length;
                tabBtns[index].focus();
                tabBtns[index].click();
            } else if (e.key === 'ArrowLeft') {
                index = (index - 1 + tabBtns.length) % tabBtns.length;
                tabBtns[index].focus();
                tabBtns[index].click();
            }
        });
    });
})();

/* ───────────────────────────────────────────────────────────────────────────
   7. ANIMATED DATA COUNTERS
─────────────────────────────────────────────────────────────────────────── */
(function initializeCounters() {
    const counters = DOM.getAll('.stat-number');
    if (!counters.length) return;

    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                // Clean data attribute: strip non-numeric characters for the target value
                const targetText = el.getAttribute('data-target') || el.innerText;
                const target = parseInt(targetText.replace(/\D/g, ''), 10);
                const suffix = el.getAttribute('data-suffix') || '';
                
                let current = 0;
                const duration = 2500; // 2.5 seconds
                let startTime = null;

                const step = (timestamp) => {
                    if (!startTime) startTime = timestamp;
                    const progress = MathUtils.clamp((timestamp - startTime) / duration, 0, 1);
                    
                    // Ease Out Expo
                    const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                    current = Math.floor(easeProgress * target);
                    
                    // Format output
                    el.innerText = current.toLocaleString('en-IN') + suffix;
                    
                    if (progress < 1) {
                        requestAnimationFrame(step);
                    } else {
                        el.innerText = target.toLocaleString('en-IN') + suffix; // Ensure final exact value
                    }
                };
                
                requestAnimationFrame(step);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => counterObserver.observe(c));
})();

/* ───────────────────────────────────────────────────────────────────────────
   8. FORM VALIDATION ENGINE
─────────────────────────────────────────────────────────────────────────── */
(function initializeForms() {
    const contactForm = DOM.get('#premiumContactForm') || DOM.get('#contactForm');
    if (!contactForm) return;

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const btn = contactForm.querySelector('button[type="submit"]');
        const inputs = DOM.getAll('input[required], textarea[required]', contactForm);
        let isValid = true;

        inputs.forEach(input => {
            // Reset visual errors
            input.style.borderColor = 'rgba(255,255,255,0.2)';
            
            if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = '#ef4444'; // Red error state
            } else if (input.type === 'email' && !validateEmail(input.value.trim())) {
                isValid = false;
                input.style.borderColor = '#ef4444';
            }
        });

        if (isValid) {
            // Simulate network request for premium feel
            const originalText = btn.innerText;
            btn.innerText = 'Transmitting...';
            btn.style.opacity = '0.7';
            btn.style.pointerEvents = 'none';
            
            setTimeout(() => {
                btn.innerText = 'Dispatch Successful';
                btn.style.backgroundColor = '#10b981'; // Success green
                btn.style.color = '#ffffff';
                contactForm.reset();
                
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.backgroundColor = ''; // Revert to CSS class
                    btn.style.color = '';
                    btn.style.opacity = '1';
                    btn.style.pointerEvents = 'all';
                }, 4000);
            }, 1500);
        }
    });
})();

/* ───────────────────────────────────────────────────────────────────────────
   9. WEBGL FLUID SKY ENGINE (Monochromatic Watercolor Shader)
─────────────────────────────────────────────────────────────────────────── */
(function initializeWebGLSky() {
    const canvas = DOM.get('#skyCanvas');
    if (!canvas) return;

    // Setup WebGL Context
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false }) || canvas.getContext('experimental-webgl');
    if (!gl) {
        // Fallback for older browsers
        canvas.style.backgroundColor = '#03060d';
        return;
    }

    // 1. Vertex Shader (Passes coordinates)
    const vsSource = `
        attribute vec2 position;
        void main() { 
            gl_Position = vec4(position, 0.0, 1.0); 
        }
    `;

    // 2. Fragment Shader (The core visual engine)
    const fsSource = `
        precision highp float;
        uniform vec2 u_resolution;
        uniform float u_time;

        // Hash function for randomization
        vec2 hash(vec2 p) {
            p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
            return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
        }

        // Simplex Noise algorithm
        float noise(vec2 p) {
            const float K1 = 0.366025404;
            const float K2 = 0.211324865;
            vec2 i = floor(p + (p.x + p.y) * K1);
            vec2 a = p - i + (i.x + i.y) * K2;
            vec2 o = (a.x > a.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec2 b = a - o + K2;
            vec2 c = a - 1.0 + 2.0 * K2;
            vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
            vec3 n = h * h * h * h * vec3(dot(a, hash(i + 0.0)), dot(b, hash(i + o)), dot(c, hash(i + 1.0)));
            return dot(n, vec3(70.0));
        }

        // Fractal Brownian Motion (Generates the fluid texture)
        float fbm(vec2 uv) {
            float f = 0.0;
            vec2 p = uv;
            float w = 0.5;
            for(int i = 0; i < 4; i++) {
                f += w * noise(p);
                p *= 2.0;
                w *= 0.5;
            }
            return f;
        }

        void main() {
            vec2 uv = gl_FragCoord.xy / u_resolution.xy;
            vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
            
            // Slow, majestic time modulation
            float t = u_time * 0.06;

            // Compute fluid displacement
            vec2 flow = vec2(fbm(p * 1.5 + vec2(t, t * 0.5)), fbm(p * 1.2 - vec2(t * 0.3, t)));
            float dCenter = length(p);
            float aCenter = atan(p.y, p.x);
            flow += vec2(sin(aCenter + t), cos(aCenter + t)) * exp(-dCenter * 1.5) * 1.5;

            // Apply texture strokes
            vec2 brush_uv = p * 3.5 + flow * 2.0;
            float strokeVal = fbm(brush_uv * vec2(2.5, 1.0));
            strokeVal += fbm(brush_uv * 8.0) * 0.2; 

            // Deep Luxury Palette Definition
            vec3 navy = vec3(0.01, 0.02, 0.05);
            vec3 midnight = vec3(0.04, 0.08, 0.18);
            vec3 skyBlue = vec3(0.08, 0.15, 0.35);

            // Interpolate colors based on displacement map
            float colorMix = smoothstep(0.1, 0.9, strokeVal + flow.x * 0.2);
            vec3 skyColor = mix(navy, midnight, smoothstep(0.0, 0.5, colorMix));
            skyColor = mix(skyColor, skyBlue, smoothstep(0.4, 1.0, colorMix));

            // Generate abstract mountainous horizon
            float mntNoise = fbm(vec2(uv.x * 5.0, 0.0)) * 0.15;
            float height1 = 0.28 + 0.08 * sin(uv.x * 6.0) + mntNoise;
            float height2 = 0.15 + 0.12 * cos(uv.x * 4.0 + 2.0) + fbm(vec2(uv.x * 8.0, 0.0)) * 0.1;

            float mntStroke = fbm(p * vec2(1.5, 6.0)); 
            vec3 mntColor1 = mix(vec3(0.005, 0.01, 0.03), vec3(0.02, 0.04, 0.1), mntStroke);
            vec3 mntColor2 = mix(vec3(0.001, 0.005, 0.01), vec3(0.01, 0.02, 0.05), mntStroke);

            // Composite landscape layers
            vec3 finalColor = skyColor;
            float edge1 = smoothstep(height1, height1 - 0.06, uv.y + mntStroke * 0.03);
            finalColor = mix(finalColor, mntColor1, edge1);

            float edge2 = smoothstep(height2, height2 - 0.04, uv.y + mntStroke * 0.04);
            finalColor = mix(finalColor, mntColor2, edge2);

            // Apply cinematic vignette
            float vignette = length(uv - vec2(0.5));
            finalColor *= smoothstep(1.3, 0.2, vignette);
            
            // Master dimming to ensure foreground text remains legible
            finalColor *= 0.85;

            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;

    // 3. Shader Compiler Utility
    function createShader(type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        // Log compilation errors
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('WebGL Shader Error: ', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    // 4. Program Linkage
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('WebGL Program Link Error: ', gl.getProgramInfoLog(program));
        return;
    }

    // 5. Buffer Geometry (Full Screen Quad)
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1.0, -1.0,   1.0, -1.0,  -1.0,  1.0,
        -1.0,  1.0,   1.0, -1.0,   1.0,  1.0
    ]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // 6. Uniform Bindings
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const timeLocation = gl.getUniformLocation(program, "u_time");

    // 7. Resize Handler (Debounced)
    let resizeTimeout;
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resize, 150);
    }, { passive: true });
    resize(); // Initial call

    // 8. Core Render Loop
    function render(time) {
        gl.useProgram(program);
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        gl.uniform1f(timeLocation, time * 0.001); // Convert to seconds
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(render);
    }
    
    // Accessibility check: Do not animate if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        canvas.style.display = 'none';
        document.body.style.backgroundColor = '#03060d';
    } else {
        requestAnimationFrame(render);
    }
})();

console.log('%c✦ Inspire Talent Hub Engine Initialized', 'color: #c9a84c; font-size: 14px; font-weight: bold;');


// ── INDEX NAVIGATION SCRIPT ──────────────────────────────────
(function initIndexNav() {
  const nav = document.getElementById('index-mainNav');
  const hamburger = document.getElementById('index-hamburger');
  const navLinks = document.getElementById('index-navLinks');

  // Toggle background blur on scroll
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // Open/Close mobile menu
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('.index-nav__link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
})();
// ── INDEX FOOTER WEBGL ANIMATION ──────────────────────────────────
(function initFooterSky() {
  const canvases = document.querySelectorAll('.webgl-sky');
  if (canvases.length === 0) return;

  canvases.forEach(canvas => {
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      canvas.style.background = '#07090E'; // Fallback to theme color
      return;
    }

    const vsSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;

      vec2 hash(vec2 p) {
          p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
          return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
      }

      float noise(vec2 p) {
          const float K1 = 0.366025404;
          const float K2 = 0.211324865;
          vec2 i = floor(p + (p.x + p.y) * K1);
          vec2 a = p - i + (i.x + i.y) * K2;
          vec2 o = (a.x > a.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec2 b = a - o + K2;
          vec2 c = a - 1.0 + 2.0 * K2;
          vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
          vec3 n = h * h * h * h * vec3(dot(a, hash(i + 0.0)), dot(b, hash(i + o)), dot(c, hash(i + 1.0)));
          return dot(n, vec3(70.0));
      }

      float fbm(vec2 uv) {
          float f = 0.0;
          vec2 p = uv;
          float w = 0.5;
          for(int i = 0; i < 4; i++) {
              f += w * noise(p);
              p *= 2.0;
              w *= 0.5;
          }
          return f;
      }

      void main() {
          vec2 uv = gl_FragCoord.xy / u_resolution.xy;
          vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
          
          float t = u_time * 0.05; // Slightly slower animation for a premium feel

          vec2 flow = vec2(fbm(p * 1.5 + vec2(t, t * 0.5)), fbm(p * 1.2 - vec2(t * 0.3, t)));
          float dCenter = length(p);
          float aCenter = atan(p.y, p.x);
          flow += vec2(sin(aCenter + t), cos(aCenter + t)) * exp(-dCenter * 1.5) * 1.5;

          vec2 brush_uv = p * 3.5 + flow * 2.0;
          float strokeVal = fbm(brush_uv * vec2(2.5, 1.0));
          strokeVal += fbm(brush_uv * 8.0) * 0.2;

          // Themed dark colors for Inspire Talent Hub
          vec3 bgDeep = vec3(0.03, 0.04, 0.05);
          vec3 darkNavy = vec3(0.05, 0.06, 0.09);
          vec3 accentBlue = vec3(0.08, 0.1, 0.15);
          vec3 paleHighlight = vec3(0.12, 0.15, 0.2);

          float colorMix = smoothstep(0.1, 0.9, strokeVal + flow.x * 0.2);
          vec3 skyColor = mix(bgDeep, darkNavy, smoothstep(0.0, 0.4, colorMix));
          skyColor = mix(skyColor, accentBlue, smoothstep(0.3, 0.7, colorMix));
          skyColor = mix(skyColor, paleHighlight, smoothstep(0.6, 1.0, colorMix));

          float vignette = length(uv - vec2(0.5));
          skyColor *= smoothstep(1.2, 0.3, vignette);
          skyColor *= 0.9; // Overall darkening

          gl_FragColor = vec4(skyColor, 1.0);
      }
    `;

    function createShader(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1.0, -1.0,  1.0, -1.0, -1.0,  1.0,
      -1.0,  1.0,  1.0, -1.0,  1.0,  1.0
    ]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const timeLocation = gl.getUniformLocation(program, "u_time");

    function resize() {
      const parent = canvas.parentElement;
      canvas.width = parent.offsetWidth || window.innerWidth;
      canvas.height = parent.offsetHeight || window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas.parentElement || document.body);
    resize();

    function render(time) {
      gl.useProgram(program);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, time * 0.001);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  });
})();

