/**
 * L'ANATOMIE &bull; HAUTE JOAILLERIE (PEJ DAY 4)
 * Core Interactive Logic & Visual Effects
 *
 * Implements:
 * 1. Interactive Pulse Ripple Canvas (Page 6: "Smooth ripple effect, To show the working of a Pulse")
 * 2. Textured Rippled Glass with Running Water (Page 2: "warm, golden-brown background of textured, rippled glass with water running down it")
 * 3. Color Dissolve & Frame Transitions on Scroll (Page 1 & 6: "The colors beautifully dissolve and transition into different frames")
 * 4. 3D Floating Jewellery Parallax & Levitation (Page 7: "floating on the screen, without any background frames, shown in different angles")
 * 5. Seamless Transfer to Dedicated Product Page in Same Color (Page 8)
 * 6. Shopping Bag Drawer & Modals
 */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. ANATOMICAL PRODUCT CATALOG (Page 7 & Page 8)
  // =========================================================================
  const PRODUCTS = {
    'ruby': {
      id: 'ruby',
      ref: 'REF. AR-02 &bull; ARTERIAL SUITE',
      name: 'The Arterial Ruby Suite',
      system: 'Arteries &bull; Oxygenated Life Force',
      theme: 'oxblood',
      bgColor: '#450407',
      tagline: 'Forged for the pulsating rhythm of the healer’s hand.',
      description: 'Hand-sculpted in 950 platinum and 18K rose gold set with unheated Burmese pigeon-blood rubies and D-Flawless diamonds, calibrated flush for delicate surgical composure.',
      specs: {
        'Gemstone': '4.85 TCW Pigeon-Blood Burmese Rubies',
        'Diamonds': '1.40 TCW D-Flawless',
        'Precious Metals': '950 Platinum & 18K Rose Gold',
        'Calibration': 'Flush Surgical Post &bull; Zero Snag'
      },
      angles: [
        { label: 'Front Pair', src: 'assets/images/ruby-angle-front-pair.png' },
        { label: '45° Tilt', src: 'assets/images/ruby-angle-tilt.png' },
        { label: 'Profile Clasp', src: 'assets/images/ruby-angle-profile.png' },
        { label: 'Master Macro', src: 'assets/images/ruby-earrings-oxblood.jpg' }
      ],
      defaultAngle: 0,
      price: '$28,500'
    },
    'sapphire': {
      id: 'sapphire',
      ref: 'REF. CS-03 &bull; VENOUS SUITE',
      name: 'The Cerebral Sapphire Signet',
      system: 'Veins &bull; Neurological Architecture',
      theme: 'prussian',
      bgColor: '#091a2b',
      tagline: 'Precision cerebral composure etched into royal Ceylon sapphire.',
      description: 'Unheated royal Ceylon sapphire cradled in cold-forged 950 platinum with hand-carved Caduceus rhythm detailing and contoured comfort shank.',
      specs: {
        'Gemstone': '5.20ct Royal Ceylon Sapphire',
        'Emblem': 'Hand-Carved Caduceus Band',
        'Precious Metals': 'Cold-Forged 950 Iridium-Platinum',
        'Finish': 'Antimicrobial Non-Reactive Finish'
      },
      angles: [
        { label: 'Crown Facet', src: 'assets/images/ring-sapphire-cerebral.jpg' },
        { label: 'Signet Band', src: 'assets/images/royal-sapphire.jpg' },
        { label: 'Model Styling', src: 'assets/images/model-physician-vogue.png' }
      ],
      defaultAngle: 0,
      price: '$34,000'
    },
    'pearl': {
      id: 'pearl',
      ref: 'REF. PD-04 &bull; SKELETAL SUITE',
      name: 'The Physician Pearl Drop',
      system: 'Bones &bull; Skeletal Foundation & Clarity',
      theme: 'bone',
      bgColor: '#f4efe6',
      tagline: 'Permanent elegance worn by the devoted physician.',
      description: 'Luminous South Sea Akoya natural pearl paired with articulated D-Flawless diamonds in hypoallergenic 950 platinum, weighted for effortless grace.',
      specs: {
        'Pearl': '11.5mm South Sea Natural Akoya',
        'Diamonds': '0.95ct Round Brilliant (D/IF)',
        'Precious Metals': '950 Cold-Forged Platinum',
        'Calibration': 'Zero-Torque Surgical Post'
      },
      angles: [
        { label: 'Editorial View', src: 'assets/images/model-physician-vogue.png' },
        { label: 'Macro Luster', src: 'assets/images/piece-pearl-bone.jpg' },
        { label: 'Diamond Facets', src: 'assets/images/diamond-facets.jpg' }
      ],
      defaultAngle: 0,
      price: '$22,800'
    },
    'gold': {
      id: 'gold',
      ref: 'REF. NV-01 &bull; NEURAL SUITE',
      name: 'The Synaptic Cadence Band',
      system: 'Nerves &bull; Champagne Amber Bio-Electricity',
      theme: 'gold',
      bgColor: '#2b1d0c',
      tagline: 'The electrical pulse of human touch made physical.',
      description: '18K antique bronze gold sculpted with fluid synaptic wave channeling and interior comfort contours calibrated for delicate tactile feedback.',
      specs: {
        'Precious Metals': '18K Antique Bronze Gold',
        'Inlay': 'Synaptic Cavity Channels',
        'Ergonomics': 'Tactile Precision Contour',
        'Finish': 'Hypoallergenic Surgical Gold'
      },
      angles: [
        { label: 'Nerve Wave', src: 'assets/images/hero-surgeon-gold.jpg' },
        { label: 'Liquid Gold', src: 'assets/images/texture-gold-liquid.jpg' },
        { label: 'Physician Atelier', src: 'assets/images/model-physician-vogue.png' }
      ],
      defaultAngle: 0,
      price: '$18,200'
    }
  };

  // =========================================================================
  // 2. INTERACTIVE PULSE RIPPLE EFFECT (Page 6 Specification)
  // "when a user hovers their cursor on any page or frame, and click,
  //  a very slight ripple effect should appear. Smooth ripple effect,
  //  To show the working of a Pulse."
  // =========================================================================
  const pulseCanvas = document.getElementById('pulse-canvas');
  const pulseCtx = pulseCanvas.getContext('2d');
  let ripples = [];

  function resizePulseCanvas() {
    pulseCanvas.width = window.innerWidth;
    pulseCanvas.height = window.innerHeight;
  }
  resizePulseCanvas();
  window.addEventListener('resize', resizePulseCanvas);

  // Current Frame Color for Pulse Ripple
  let currentPulseRgb = '230, 197, 117'; // default gold

  function triggerPulseRipple(x, y, customRgb = null) {
    const rgb = customRgb || currentPulseRgb;
    // Primary arterial pulse wave
    ripples.push({
      x,
      y,
      radius: 4,
      maxRadius: Math.min(window.innerWidth, window.innerHeight) * 0.35,
      alpha: 0.75,
      speed: 3.2,
      rgb,
      lineWidth: 2
    });

    // Secondary wave for organic heartbeat cadence (lub-dub) after 150ms
    setTimeout(() => {
      ripples.push({
        x,
        y,
        radius: 4,
        maxRadius: Math.min(window.innerWidth, window.innerHeight) * 0.28,
        alpha: 0.55,
        speed: 2.6,
        rgb,
        lineWidth: 1.4
      });
    }, 150);
  }

  // Global click event to trigger pulse ripple
  window.addEventListener('click', (e) => {
    triggerPulseRipple(e.clientX, e.clientY);
  });

  // Animation Loop for Pulse Ripples
  function animatePulseRipples() {
    pulseCtx.clearRect(0, 0, pulseCanvas.width, pulseCanvas.height);

    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      r.radius += r.speed;
      r.alpha *= 0.955; // smooth exponential decay

      if (r.alpha < 0.015 || r.radius > r.maxRadius) {
        ripples.splice(i, 1);
        continue;
      }

      pulseCtx.save();
      pulseCtx.beginPath();
      pulseCtx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      pulseCtx.strokeStyle = `rgba(${r.rgb}, ${r.alpha})`;
      pulseCtx.lineWidth = r.lineWidth;
      pulseCtx.shadowColor = `rgba(${r.rgb}, 0.6)`;
      pulseCtx.shadowBlur = 8;
      pulseCtx.stroke();
      pulseCtx.restore();
    }

    requestAnimationFrame(animatePulseRipples);
  }
  requestAnimationFrame(animatePulseRipples);

  // Custom Cursor Tracking & Hover Feedback
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');

  window.addEventListener('mousemove', (e) => {
    cursorDot.style.left = `${e.clientX}px`;
    cursorDot.style.top = `${e.clientY}px`;

    cursorRing.style.left = `${e.clientX}px`;
    cursorRing.style.top = `${e.clientY}px`;
  });

  const hoverTargets = document.querySelectorAll('a, button, .floating-jewel-item, .pulse-click-chip, .collection-card');
  hoverTargets.forEach((target) => {
    target.addEventListener('mouseenter', () => cursorRing.classList.add('active'));
    target.addEventListener('mouseleave', () => cursorRing.classList.remove('active'));
  });

  // =========================================================================
  // 3. TEXTURED RIPPLED GLASS WITH RUNNING WATER (Page 2 & 3 Specification)
  // "warm, golden-brown background of textured, rippled glass
  //  with water running down it"
  // =========================================================================
  const glassCanvas = document.getElementById('heroWaterCanvas');
  const heroBg = document.getElementById('heroFlutedBg');

  // Subtle 3D Glass Depth Parallax on mousemove
  if (heroBg) {
    window.addEventListener('mousemove', (e) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 14;
      const ny = (e.clientY / window.innerHeight - 0.5) * 10;
      heroBg.style.transform = `scale(1.03) translate(${-nx}px, ${-ny}px)`;
    });
  }

  if (glassCanvas) {
    const glassCtx = glassCanvas.getContext('2d');
    let gw, gh;

    function resizeGlassCanvas() {
      gw = glassCanvas.width = window.innerWidth;
      gh = glassCanvas.height = window.innerHeight;
    }
    resizeGlassCanvas();
    window.addEventListener('resize', resizeGlassCanvas);

    // Glistening water rivulets & organic droplets
    const streamCount = 36;
    const streams = [];

    for (let i = 0; i < streamCount; i++) {
      streams.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        length: 40 + Math.random() * 120,
        speed: 0.8 + Math.random() * 1.8,
        width: 1.0 + Math.random() * 1.8,
        opacity: 0.18 + Math.random() * 0.35,
        dropletRadius: 1.4 + Math.random() * 1.6
      });
    }

    // Micro condensation moisture specks on glass
    const condensationSpecks = [];
    for (let i = 0; i < 45; i++) {
      condensationSpecks.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: 0.8 + Math.random() * 1.4,
        opacity: 0.12 + Math.random() * 0.22
      });
    }

    function animateRunningWater() {
      glassCtx.clearRect(0, 0, gw, gh);

      // Render static moisture specks catching golden light
      condensationSpecks.forEach((b) => {
        glassCtx.beginPath();
        glassCtx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        glassCtx.fillStyle = `rgba(255, 235, 190, ${b.opacity})`;
        glassCtx.fill();
      });

      // Render flowing rivulets with leading droplets
      streams.forEach((s) => {
        s.y += s.speed;
        if (s.y - s.length > gh) {
          s.y = -s.length;
          s.x = Math.random() * gw;
          s.speed = 0.8 + Math.random() * 1.8;
        }

        // Elegant water trail
        const trailGrad = glassCtx.createLinearGradient(s.x, s.y - s.length, s.x, s.y);
        trailGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        trailGrad.addColorStop(0.7, `rgba(255, 240, 205, ${s.opacity * 0.45})`);
        trailGrad.addColorStop(1, `rgba(255, 255, 255, ${s.opacity * 0.9})`);

        glassCtx.strokeStyle = trailGrad;
        glassCtx.lineWidth = s.width;
        glassCtx.lineCap = 'round';

        glassCtx.beginPath();
        glassCtx.moveTo(s.x, s.y - s.length);
        glassCtx.lineTo(s.x, s.y);
        glassCtx.stroke();

        // Glistening leading droplet
        glassCtx.beginPath();
        glassCtx.arc(s.x, s.y, s.dropletRadius, 0, Math.PI * 2);
        glassCtx.fillStyle = `rgba(255, 245, 220, ${s.opacity})`;
        glassCtx.shadowColor = 'rgba(255, 220, 150, 0.4)';
        glassCtx.shadowBlur = 4;
        glassCtx.fill();
        glassCtx.shadowBlur = 0;
      });

      requestAnimationFrame(animateRunningWater);
    }
    requestAnimationFrame(animateRunningWater);
  }

  // =========================================================================
  // 4. COLOR DISSOLVE & FRAME SCROLL NAVIGATION (Page 1 & Page 6)
  // "As you scroll down the Website, The colors beautifully dissolve
  //  and transition into different frames. For eg. Scrolling down the
  //  First frame of one color to another frame changes into second color.
  //  Frame 1 of yellow goes Red as you scroll down to frame 2."
  // =========================================================================
  const frames = [
    { id: 'frame-nerves', theme: 'gold', rgb: '230, 197, 117', bg: [18, 9, 2], glow: [229, 195, 120] },
    { id: 'frame-arteries', theme: 'oxblood', rgb: '232, 54, 79', bg: [59, 3, 6], glow: [230, 57, 80] },
    { id: 'frame-veins', theme: 'prussian', rgb: '81, 152, 224', bg: [7, 21, 36], glow: [74, 148, 224] },
    { id: 'frame-bones', theme: 'bone', rgb: '157, 133, 103', bg: [245, 240, 230], glow: [142, 116, 84] }
  ];

  const siteHeader = document.getElementById('siteHeader');
  const frameNavItems = document.querySelectorAll('.frame-nav-item');

  function lerpRgb(rgb1, rgb2, t) {
    const [r1, g1, b1] = rgb1.split(',').map(Number);
    const [r2, g2, b2] = rgb2.split(',').map(Number);
    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);
    return `${r}, ${g}, ${b}`;
  }

  function updateActiveFrameOnScroll() {
    const scrollCenter = window.scrollY + window.innerHeight * 0.5;

    const el0 = document.getElementById('frame-nerves');
    const el1 = document.getElementById('frame-arteries');
    const el2 = document.getElementById('frame-veins');
    const el3 = document.getElementById('frame-bones');

    if (!el0 || !el1 || !el2 || !el3) return;

    const y0 = el0.offsetTop + el0.offsetHeight / 2;
    const y1 = el1.offsetTop + el1.offsetHeight / 2;
    const y2 = el2.offsetTop + el2.offsetHeight / 2;
    const y3 = el3.offsetTop + el3.offsetHeight / 2;

    let currentIdx = 0;
    let currBg = frames[0].bg;
    let currGlow = frames[0].glow;
    let currPulse = frames[0].rgb;

    if (scrollCenter <= y0) {
      currentIdx = 0;
      currBg = frames[0].bg;
      currGlow = frames[0].glow;
      currPulse = frames[0].rgb;
      document.body.className = 'theme-gold';
    } else if (scrollCenter > y0 && scrollCenter < y1) {
      // Transition 1: Hero to Red (Gold -> Oxblood)
      const t = Math.max(0, Math.min(1, (scrollCenter - y0) / (y1 - y0)));
      currentIdx = t < 0.5 ? 0 : 1;
      currBg = [
        Math.round(frames[0].bg[0] + (frames[1].bg[0] - frames[0].bg[0]) * t),
        Math.round(frames[0].bg[1] + (frames[1].bg[1] - frames[0].bg[1]) * t),
        Math.round(frames[0].bg[2] + (frames[1].bg[2] - frames[0].bg[2]) * t)
      ];
      currGlow = [
        Math.round(frames[0].glow[0] + (frames[1].glow[0] - frames[0].glow[0]) * t),
        Math.round(frames[0].glow[1] + (frames[1].glow[1] - frames[0].glow[1]) * t),
        Math.round(frames[0].glow[2] + (frames[1].glow[2] - frames[0].glow[2]) * t)
      ];
      currPulse = lerpRgb(frames[0].rgb, frames[1].rgb, t);
      document.body.className = t < 0.5 ? 'theme-gold' : 'theme-oxblood';
    } else if (scrollCenter >= y1 && scrollCenter < y2) {
      // Transition 2: Red to Blue (Oxblood -> Prussian Sapphire)
      const t = Math.max(0, Math.min(1, (scrollCenter - y1) / (y2 - y1)));
      currentIdx = t < 0.5 ? 1 : 2;
      currBg = [
        Math.round(frames[1].bg[0] + (frames[2].bg[0] - frames[1].bg[0]) * t),
        Math.round(frames[1].bg[1] + (frames[2].bg[1] - frames[1].bg[1]) * t),
        Math.round(frames[1].bg[2] + (frames[2].bg[2] - frames[1].bg[2]) * t)
      ];
      currGlow = [
        Math.round(frames[1].glow[0] + (frames[2].glow[0] - frames[1].glow[0]) * t),
        Math.round(frames[1].glow[1] + (frames[2].glow[1] - frames[1].glow[1]) * t),
        Math.round(frames[1].glow[2] + (frames[2].glow[2] - frames[1].glow[2]) * t)
      ];
      currPulse = lerpRgb(frames[1].rgb, frames[2].rgb, t);
      document.body.className = t < 0.5 ? 'theme-oxblood' : 'theme-prussian';
    } else if (scrollCenter >= y2 && scrollCenter < y3) {
      // Transition 3: Blue to White (Prussian Sapphire -> Bone Alabaster)
      const t = Math.max(0, Math.min(1, (scrollCenter - y2) / (y3 - y2)));
      currentIdx = t < 0.5 ? 2 : 3;
      currBg = [
        Math.round(frames[2].bg[0] + (frames[3].bg[0] - frames[2].bg[0]) * t),
        Math.round(frames[2].bg[1] + (frames[3].bg[1] - frames[2].bg[1]) * t),
        Math.round(frames[2].bg[2] + (frames[3].bg[2] - frames[2].bg[2]) * t)
      ];
      currGlow = [
        Math.round(frames[2].glow[0] + (frames[3].glow[0] - frames[2].glow[0]) * t),
        Math.round(frames[2].glow[1] + (frames[3].glow[1] - frames[2].glow[1]) * t),
        Math.round(frames[2].glow[2] + (frames[3].glow[2] - frames[2].glow[2]) * t)
      ];
      currPulse = lerpRgb(frames[2].rgb, frames[3].rgb, t);
      document.body.className = t < 0.5 ? 'theme-prussian' : 'theme-bone';
    } else {
      currentIdx = 3;
      currBg = frames[3].bg;
      currGlow = frames[3].glow;
      currPulse = frames[3].rgb;
      document.body.className = 'theme-bone';
    }

    // Apply live scroll background & ambient glow in real time
    const hexBg = '#' + currBg.map(x => x.toString(16).padStart(2, '0')).join('');
    document.body.style.backgroundColor = hexBg;
    document.body.style.setProperty('--current-bg', hexBg);
    document.body.style.setProperty('--ambient-glow', `rgba(${currGlow.join(',')}, 0.16)`);
    currentPulseRgb = currPulse;

    // Dissolve hero rippled glass backdrop on scroll
    const heroBackdrop = document.querySelector('.hero-stage-backdrop');
    if (heroBackdrop) {
      const fadeLimit = window.innerHeight * 0.75;
      const hOpacity = Math.max(0, Math.min(1, 1 - window.scrollY / fadeLimit));
      heroBackdrop.style.opacity = hOpacity;
    }

    // Header scrolled blur state
    if (window.scrollY > 40) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }

    // Update Side Nav Indicator
    frameNavItems.forEach((btn, idx) => {
      if (idx === currentIdx) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveFrameOnScroll, { passive: true });
  updateActiveFrameOnScroll();

  // Side Nav Click Scroll
  frameNavItems.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-frame-id');
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // =========================================================================
  // 5. 3D FLOATING JEWELLERY INTERACTIVE PARALLAX (Page 7 Specification)
  // "floating on the screen, without any background frames,
  //  shown in different angles"
  // =========================================================================
  const floatingStages = document.querySelectorAll('.jewellery-floating-canvas');

  floatingStages.forEach((stage) => {
    const jewels = stage.querySelectorAll('.floating-jewel-item');

    stage.addEventListener('mousemove', (e) => {
      const rect = stage.getBoundingClientRect();
      const xNorm = (e.clientX - rect.left) / rect.width - 0.5;
      const yNorm = (e.clientY - rect.top) / rect.height - 0.5;

      jewels.forEach((jewel, i) => {
        const depth = (i + 1) * 22;
        const rotateFactor = (i % 2 === 0 ? 1 : -1) * 14;
        const transX = xNorm * depth;
        const transY = yNorm * depth;
        const rotX = -yNorm * rotateFactor;
        const rotY = xNorm * rotateFactor;

        jewel.style.transform = `translate3d(${transX}px, ${transY}px, 0) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.04)`;
      });
    });

    stage.addEventListener('mouseleave', () => {
      jewels.forEach((jewel) => {
        jewel.style.transform = '';
      });
    });
  });

  // =========================================================================
  // 6. PAGE 8: TRANSFER TO DEDICATED PRODUCT SHOWCASE PAGE
  // "When the customer clicks on it, it will transfer them to a different
  //  page where the jewellery is completely shown on the same colored
  //  screen from before."
  // =========================================================================
  const productOverlay = document.getElementById('productShowcaseOverlay');
  const backBtn = document.getElementById('backToFramesBtn');
  const showcaseBrandMark = document.getElementById('showcaseBrandMark');
  const showcaseHeroImg = document.getElementById('showcaseHeroImg');
  const showcaseAnglesBar = document.getElementById('showcaseAnglesBar');
  const dossierRef = document.getElementById('dossierRef');
  const dossierTitle = document.getElementById('dossierTitle');
  const dossierTagline = document.getElementById('dossierTagline');
  const dossierNarrative = document.getElementById('dossierNarrative');
  const dossierSpecs = document.getElementById('dossierSpecs');
  const addToBagBtn = document.getElementById('addToBagBtn');

  let currentProductId = null;

  function openProductShowcase(productId) {
    const prod = PRODUCTS[productId];
    if (!prod) return;

    currentProductId = productId;

    // Apply exact same background theme from before
    productOverlay.setAttribute('data-theme', prod.theme);
    productOverlay.style.background = `radial-gradient(circle at 50% 50%, ${prod.bgColor} 0%, #150204 100%)`;
    if (prod.theme === 'bone') {
      productOverlay.style.background = 'radial-gradient(circle at 50% 45%, #fcfaf6 0%, #f4efe6 65%, #e2dad0 100%)';
    } else if (prod.theme === 'prussian') {
      productOverlay.style.background = 'radial-gradient(circle at 50% 50%, #102942 0%, #091a2b 70%, #030a12 100%)';
    } else if (prod.theme === 'gold') {
      productOverlay.style.background = 'radial-gradient(circle at 50% 45%, #5a3e1b 0%, #2b1d0c 70%, #170e05 100%)';
    }

    // Populate Data
    showcaseBrandMark.innerHTML = `L'ANATOMIE &bull; ${prod.system}`;
    dossierRef.innerHTML = prod.ref;
    dossierTitle.textContent = prod.name;
    dossierTagline.textContent = prod.tagline;
    dossierNarrative.textContent = prod.description;

    // Specs
    dossierSpecs.innerHTML = '';
    for (const [k, v] of Object.entries(prod.specs)) {
      const item = document.createElement('div');
      item.className = 'spec-item';
      item.innerHTML = `
        <span class="spec-key">${k}</span>
        <span class="spec-val">${v}</span>
      `;
      dossierSpecs.appendChild(item);
    }

    // Setup Angle Switcher
    showcaseAnglesBar.innerHTML = '';
    prod.angles.forEach((angle, idx) => {
      const btn = document.createElement('button');
      btn.className = `angle-thumb-btn ${idx === prod.defaultAngle ? 'active' : ''}`;
      btn.setAttribute('aria-label', angle.label);
      btn.innerHTML = `<img src="${angle.src}" alt="${angle.label}"/>`;

      btn.addEventListener('click', () => {
        showcaseAnglesBar.querySelectorAll('.angle-thumb-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Smooth image switch
        showcaseHeroImg.style.opacity = '0';
        showcaseHeroImg.style.transform = 'scale(0.92)';
        setTimeout(() => {
          showcaseHeroImg.src = angle.src;
          showcaseHeroImg.style.opacity = '1';
          showcaseHeroImg.style.transform = 'scale(1)';
        }, 200);
      });

      showcaseAnglesBar.appendChild(btn);
    });

    // Default angle display
    showcaseHeroImg.src = prod.angles[prod.defaultAngle].src;

    // Reveal overlay
    productOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Update URL hash for natural back navigation
    window.location.hash = `showcase-${prod.id}`;
  }

  function closeProductShowcase() {
    productOverlay.classList.remove('active');
    document.body.style.overflow = '';
    if (window.location.hash.startsWith('#showcase')) {
      history.pushState(null, null, ' ');
    }
  }

  backBtn.addEventListener('click', closeProductShowcase);

  // Bind clicks on all floating jewelry items and prompt buttons
  document.querySelectorAll('[data-product-trigger]').forEach((el) => {
    el.addEventListener('click', (e) => {
      const prodId = el.getAttribute('data-product-trigger');
      triggerPulseRipple(e.clientX, e.clientY);
      setTimeout(() => {
        openProductShowcase(prodId);
      }, 150);
    });
  });

  // Handle URL hash on initial page load (e.g. direct deep link #showcase-ruby)
  if (window.location.hash.startsWith('#showcase-')) {
    const targetProd = window.location.hash.replace('#showcase-', '');
    if (PRODUCTS[targetProd]) {
      setTimeout(() => openProductShowcase(targetProd), 300);
    }
  }

  // =========================================================================
  // 7. SHOPPING BAG STATE & DRAWER (Top Right Bag Option)
  // =========================================================================
  const cartBtn = document.getElementById('cartBtn');
  const cartDrawerOverlay = document.getElementById('cartDrawerOverlay');
  const cartCloseBtn = document.getElementById('cartCloseBtn');
  const cartItemsList = document.getElementById('cartItemsList');
  const bagCount = document.getElementById('bagCount');
  const cartSubtotal = document.getElementById('cartSubtotal');

  let cart = JSON.parse(localStorage.getItem('pej_cart') || '[]');

  function updateBagUI() {
    bagCount.textContent = cart.length;
    if (cart.length > 0) {
      bagCount.classList.add('has-items');
    } else {
      bagCount.classList.remove('has-items');
    }

    if (cart.length === 0) {
      cartItemsList.innerHTML = `<p class="cart-empty-message">Your Anatomical Bag is currently empty.</p>`;
      cartSubtotal.textContent = '$0';
      return;
    }

    cartItemsList.innerHTML = '';
    let total = 0;
    cart.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = 'cart-item-row';
      row.innerHTML = `
        <img class="cart-item-img" src="${item.img}" alt="${item.name}"/>
        <div class="cart-item-details">
          <span class="cart-item-name">${item.name}</span>
          <span class="cart-item-meta">${item.ref} &bull; ${item.clasp}</span>
          <button class="cart-item-remove" data-cart-remove="${idx}">Remove Piece</button>
        </div>
      `;
      cartItemsList.appendChild(row);
      // calculate rough numeric price
      const numericPrice = parseInt(item.price.replace(/[^0-9]/g, '')) || 0;
      total += numericPrice;
    });

    cartSubtotal.textContent = `$${total.toLocaleString()}`;

    // Remove handlers
    cartItemsList.querySelectorAll('[data-cart-remove]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const removeIdx = parseInt(btn.getAttribute('data-cart-remove'));
        cart.splice(removeIdx, 1);
        localStorage.setItem('pej_cart', JSON.stringify(cart));
        updateBagUI();
      });
    });
  }
  updateBagUI();

  // Add to Bag Button
  addToBagBtn.addEventListener('click', (e) => {
    if (!currentProductId) return;
    const prod = PRODUCTS[currentProductId];
    const activeClaspBtn = document.querySelector('.clasp-btn.active');
    const selectedClasp = activeClaspBtn ? activeClaspBtn.textContent.trim() : 'Standard Fit';

    cart.push({
      id: prod.id,
      name: prod.name,
      ref: prod.ref.split('&bull;')[0].trim(),
      clasp: selectedClasp,
      price: prod.price,
      img: prod.angles[0].src
    });

    localStorage.setItem('pej_cart', JSON.stringify(cart));
    updateBagUI();

    // Pulse feedback on button
    triggerPulseRipple(e.clientX, e.clientY);
    addToBagBtn.textContent = 'ACQUIRED TO BAG';
    addToBagBtn.style.background = '#28a745';
    addToBagBtn.style.color = '#ffffff';

    setTimeout(() => {
      addToBagBtn.textContent = 'ACQUIRE &bull; ADD TO BAG';
      addToBagBtn.style.background = '';
      addToBagBtn.style.color = '';
      closeProductShowcase();
      cartDrawerOverlay.classList.add('active');
    }, 600);
  });

  // Clasp selection
  document.querySelectorAll('.clasp-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.clasp-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  cartBtn.addEventListener('click', () => cartDrawerOverlay.classList.add('active'));
  cartCloseBtn.addEventListener('click', () => cartDrawerOverlay.classList.remove('active'));
  cartDrawerOverlay.addEventListener('click', (e) => {
    if (e.target === cartDrawerOverlay) cartDrawerOverlay.classList.remove('active');
  });

  // =========================================================================
  // 8. COLLECTION & ABOUT MODALS (Header Links)
  // =========================================================================
  const collectionBtn = document.getElementById('navCollectionBtn');
  const collectionModal = document.getElementById('collectionModal');
  const collectionClose = document.getElementById('collectionCloseBtn');

  const aboutBtn = document.getElementById('navAboutBtn');
  const aboutModal = document.getElementById('aboutModal');
  const aboutClose = document.getElementById('aboutCloseBtn');

  if (collectionBtn && collectionModal) {
    collectionBtn.addEventListener('click', (e) => {
      e.preventDefault();
      collectionModal.classList.add('active');
    });
    collectionClose.addEventListener('click', () => collectionModal.classList.remove('active'));
    collectionModal.addEventListener('click', (e) => {
      if (e.target === collectionModal) collectionModal.classList.remove('active');
    });

    // Chapter Cards inside collection modal scroll to frame
    collectionModal.querySelectorAll('[data-scroll-to]').forEach((card) => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const frameId = card.getAttribute('data-scroll-to');
        collectionModal.classList.remove('active');
        const target = document.getElementById(frameId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  if (aboutBtn && aboutModal) {
    aboutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      aboutModal.classList.add('active');
    });
    aboutClose.addEventListener('click', () => aboutModal.classList.remove('active'));
    aboutModal.addEventListener('click', (e) => {
      if (e.target === aboutModal) aboutModal.classList.remove('active');
    });
  }

  // Smooth scroll indicator click
  const heroScroll = document.getElementById('heroScrollCue') || document.getElementById('heroScrollIndicator');
  if (heroScroll) {
    heroScroll.addEventListener('click', (e) => {
      e.preventDefault();
      const frameArteries = document.getElementById('frame-arteries');
      if (frameArteries) {
        frameArteries.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
});
