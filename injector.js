(async function() {
    const GITHUB_USERNAME = '40476';
    const isPrimary = window.location.hostname.includes('usr40k.dev');

    // Link resolution based on environment
    const baseHome = isPrimary ? 'https://usr40k.dev/' : 'https://40476.github.io/40476/';
    const baseGizmos = isPrimary ? 'https://gizmos.usr40k.dev/' : 'https://40476.github.io/web-gizmos/';

    // Detect if the page is using a locked layout (like Gizmos)
    const isLockedLayout = window.getComputedStyle(document.body).overflow === 'hidden' || 
                           window.getComputedStyle(document.documentElement).overflow === 'hidden';
    /**
     * ASCII ripple animation logic
     */
    const createASCIIShift = (el, opts = {}) => {
        const WAVE_THRESH = 3;
        const CHAR_MULT = 3;
        const ANIM_STEP = 40;
        const WAVE_BUF = 5;

        let origTxt = el.textContent;
        let origChars = origTxt.split("");
        let isAnim = false;
        let cursorPos = 0;
        let waves = [];
        let animId = null;
        let isHover = false;
        let origW = null;

        const cfg = {
            dur: 1400,
            chars: '.,·-─~+:;=*π""┐┌┘┴┬╗╔╝╚╬╠╣╩╦║░▒▓█▄▀▌▐■!?&#$@0123456789*',
            preserveSpaces: true,
            spread: 0.3,
            ...opts
        };

        const updateCursorPos = (e) => {
            const textNode = el.firstChild;
            if (!textNode || textNode.nodeType !== 3) return;
            const range = document.createRange();
            let closestIdx = 0;
            let closestDist = Infinity;

            for (let i = 0; i < textNode.length; i++) {
                range.setStart(textNode, i);
                range.setEnd(textNode, i + 1);
                const rect = range.getBoundingClientRect();
                if (!rect.width && !rect.height) continue;
                const dx = e.clientX - (rect.left + rect.width / 2);
                const dy = e.clientY - (rect.top + rect.height / 2);
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < closestDist) {
                    closestDist = dist;
                    closestIdx = i;
                }
            }
            cursorPos = closestIdx;
        };

        const startWave = () => {
            waves.push({ startPos: cursorPos, startTime: Date.now(), id: Math.random() });
            if (!isAnim) start();
        };

        const cleanupWaves = (t) => {
            waves = waves.filter((w) => t - w.startTime < cfg.dur);
        };

        const calcWaveEffect = (charIdx, t) => {
            let shouldAnim = false;
            let resultChar = origChars[charIdx];
            for (const w of waves) {
                const age = t - w.startTime;
                const prog = Math.min(age / cfg.dur, 1);
                const dist = Math.abs(charIdx - w.startPos);
                const maxDist = Math.max(w.startPos, origChars.length - w.startPos - 1);
                const rad = (prog * (maxDist + WAVE_BUF)) / cfg.spread;
                if (dist <= rad) {
                    shouldAnim = true;
                    const intens = Math.max(0, rad - dist);
                    if (intens <= WAVE_THRESH && intens > 0) {
                        const idx = (dist * CHAR_MULT + Math.floor(age / ANIM_STEP)) % cfg.chars.length;
                        resultChar = cfg.chars[idx];
                    }
                }
            }
            return { shouldAnim, char: resultChar };
        };

        const genScrambledTxt = (t) =>
            origChars.map((char, i) => {
                if (cfg.preserveSpaces && char === " ") return " ";
                const res = calcWaveEffect(i, t);
                return res.shouldAnim ? res.char : char;
            }).join("");

        const stop = () => {
            el.textContent = origTxt;
            if (origW !== null) { 
                el.style.width = ""; 
                el.style.display = "";
                el.style.lineHeight = "";
                origW = null; 
            }
            isAnim = false;
        };

        const start = () => {
            if (isAnim) return;
            if (origW === null) {
                const rect = el.getBoundingClientRect();
                origW = Math.ceil(rect.width);
                el.style.width = `${origW}px`;
                el.style.display = 'inline-block';
                el.style.verticalAlign = 'middle';
                el.style.lineHeight = `${rect.height}px`;
            }
            isAnim = true;
            const animate = () => {
                const t = Date.now();
                cleanupWaves(t);
                if (waves.length === 0) { stop(); return; }
                el.textContent = genScrambledTxt(t);
                animId = requestAnimationFrame(animate);
            };
            animId = requestAnimationFrame(animate);
        };

        el.addEventListener("mouseenter", (e) => { isHover = true; updateCursorPos(e); startWave(); });
        el.addEventListener("mousemove", (e) => { if (!isHover) return; const old = cursorPos; updateCursorPos(e); if (cursorPos !== old) startWave(); });
        el.addEventListener("mouseleave", () => { isHover = false; });
    };
    
    const style = `
    /* Default: Dark Theme */
    #mega-nav-wrap {
        --nav-bg: #050505;
        --nav-text: #00ff00;
        --nav-link: #888;
        --nav-border: #222;
        --nav-card: #0a0a0a;
        --nav-meta: #555;
        --nav-heading: #fff;
    }

    /* Light Theme Overrides */
    .theme-light #mega-nav-wrap,
    #mega-nav-wrap.theme-light,
    [data-theme="light"] #mega-nav-wrap {
        --nav-bg: #f8f9fa !important;
        --nav-text: #008800 !important;
        --nav-link: #555 !important;
        --nav-border: #ccc !important;
        --nav-card: #ffffff !important;
        --nav-meta: #888 !important;
        --nav-heading: #111 !important;
    }

    /* Explicit Dark Theme Overrides */
    .theme-dark #mega-nav-wrap,
    #mega-nav-wrap.theme-dark,
    [data-theme="dark"] #mega-nav-wrap {
        --nav-bg: #050505 !important;
        --nav-text: #00ff00 !important;
        --nav-link: #888 !important;
        --nav-border: #222 !important;
        --nav-card: #0a0a0a !important;
        --nav-meta: #555 !important;
        --nav-heading: #fff !important;
    }

    /* Optional: OS Auto-Theme Fallback */
    @media (prefers-color-scheme: light) {
        #mega-nav-wrap:not(.theme-dark),
        :not(.theme-dark) > #mega-nav-wrap {
            --nav-bg: #f8f9fa;
            --nav-text: #008800;
            --nav-link: #555;
            --nav-border: #ccc;
            --nav-card: #ffffff;
            --nav-meta: #888;
            --nav-heading: #111;
        }
    }

    /* FORCE RESET ON LABELS TO BLOCK APP CSS BLEED */
    #mega-nav-wrap label {
        margin: 0 !important;
        text-transform: none !important;
        letter-spacing: normal !important;
        font-weight: normal !important;
    }

    #mega-nav-wrap { 
        all: initial; 
        font-family: ui-monospace, 'Cascadia Code', monospace; 
        display: block; 
        /* CHANGED TO FIXED: This takes it out of the app body's flexbox flow */
        position: ${isLockedLayout ? 'absolute' : 'fixed'}; 
        top: 0; 
        left: 0;
        width: 100%; 
        z-index: 9999999; 
        background: var(--nav-bg) !important; 
        color: var(--nav-text) !important; 
        border-bottom: 1px solid var(--nav-border) !important;
        box-sizing: border-box !important;
        transition: transform 0.3s ease, background-color 0.3s ease, color 0.3s ease !important;
    }

    /* Autohide Slide-up Class */
    #mega-nav-wrap.nav-collapsed {
        transform: translateY(-100%) !important;
    }

    #mega-nav-wrap * { box-sizing: border-box !important; }
    
    #mega-nav-wrap .nav-inner { 
        display: flex !important; 
        align-items: center !important; 
        max-width: 1200px !important; 
        margin: 0 auto !important; 
        height: 50px !important; 
        padding: 0 15px !important; 
        position: relative !important;
        background: transparent !important;
        width: auto !important;
        border: none !important;
        flex-direction: row !important;
        transform: none !important;
    }
    
    #mega-nav-wrap .mega-nav-item { 
        color: var(--nav-link) !important; 
        text-decoration: none !important; 
        padding: 10px 15px !important; 
        font-size: 13px !important; 
        transition: color 0.2s ease, text-shadow 0.2s ease !important; 
        cursor: pointer !important; 
        border: none !important; 
        background: none !important; 
        white-space: nowrap !important;
        display: inline-block !important;
        width: auto !important;
        line-height: normal !important;
        text-transform: none !important;
    }
    
    #mega-nav-wrap .mega-nav-item:hover { 
        color: var(--nav-text) !important; 
        text-shadow: 0 0 5px var(--nav-text) !important; 
    }
    
    #repo-check, #mobile-check { display: none !important; }
    
    /* Animated Dropdown Styles */
    #mega-nav-wrap .mega-drop {
        visibility: hidden;
        opacity: 0;
        transform: translateY(-10px);
        position: absolute; top: 50px; left: 0; width: 100%;
        background: var(--nav-bg) !important; 
        border-bottom: 2px solid var(--nav-text) !important; 
        padding: 20px !important;
        box-sizing: border-box !important; 
        display: grid; 
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px;
        max-height: 80vh; overflow-y: auto; 
        box-shadow: 0 10px 30px rgba(0,0,0,0.8);
        transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s ease !important;
        pointer-events: none;
    }
    
    #mega-nav-wrap #repo-check:checked ~ .mega-drop { 
        visibility: visible !important; 
        opacity: 1 !important; 
        transform: translateY(0) !important;
        pointer-events: auto !important;
    }
    
    #mega-nav-wrap .repo-card { 
        border: 1px solid var(--nav-border) !important; 
        padding: 12px !important; 
        background: var(--nav-card) !important; 
        display: flex !important; 
        flex-direction: column !important; 
        justify-content: space-between !important; 
        transition: background-color 0.3s ease; 
    }
    #mega-nav-wrap .repo-card h3 { margin: 0 !important; font-size: 14px !important; color: var(--nav-heading) !important; font-family: inherit !important; font-weight: bold !important;}
    #mega-nav-wrap .repo-meta { font-size: 10px !important; color: var(--nav-meta) !important; margin: 5px 0 !important; display: flex !important; gap: 8px !important; align-items: center !important; }
    #mega-nav-wrap .badge-fork { color: #ffaa00 !important; border: 1px solid #ffaa00 !important; padding: 1px 4px !important; border-radius: 3px !important; font-size: 9px !important; }

    #mega-nav-wrap .mobile-label { display: none; font-size: 20px; color: var(--nav-text) !important; padding: 10px; cursor: pointer; }

    #nav-unhide-btn {
        display: none; 
        position: absolute; 
        bottom: -24px;
        right: 20px; 
        background: var(--nav-bg); 
        color: var(--nav-text); 
        padding: 4px 12px; 
        cursor: pointer; 
        z-index: 10000000; 
        border: 1px solid var(--nav-border); 
        border-top: none;
        font-family: ui-monospace, 'Cascadia Code', monospace; 
        font-size: 11px;
        border-radius: 0 0 5px 5px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        transition: background-color 0.3s ease, color 0.3s ease;
    }

    /* PUSH HTML DOWN INSTEAD OF OVERWRITING BODY PADDING */
    ${!isLockedLayout ? 'html { padding-top: 50px !important; box-sizing: border-box; }' : ''}

    @media (max-width: 768px) {
        #mega-nav-wrap .mobile-label { display: block !important; }
        #mega-nav-wrap .nav-inner { height: auto !important; flex-direction: column !important; align-items: flex-start !important; display: none !important; padding-bottom: 10px !important; }
        #mega-nav-wrap #mobile-check:checked ~ .nav-inner { display: flex !important; }
        #mega-nav-wrap .mega-nav-item { width: 100% !important; box-sizing: border-box !important; border-bottom: 1px solid var(--nav-border) !important; }
        
        #mega-nav-wrap .mega-drop { 
            position: relative !important; 
            top: 0 !important; 
            width: 100% !important; 
            margin-left: 0 !important; 
            display: none !important; 
        }
        #mega-nav-wrap #repo-check:checked ~ .mega-drop { 
            display: grid !important; 
        }
    }
    `;

    const html = `
    <style>${style}</style>
    <div id="mega-nav-wrap">
        <div id="nav-unhide-btn">▼ NAV</div>
        <input type="checkbox" id="mobile-check">
        <label for="mobile-check" class="mobile-label">☰ [ MENU ]</label>
        <nav class="nav-inner">
            <a class="mega-nav-item" href="${baseHome}">[ HOME ]</a>
            <a class="mega-nav-item" href="${baseGizmos}">[ GIZMOS ]</a>
            <div style="display: contents;">
                <input type="checkbox" id="repo-check">
                <label for="repo-check" class="mega-nav-item">/REPOSITORIES/ ▾</label>
                <div class="mega-drop" id="repo-inject">
                    <p style="padding: 20px; color: var(--nav-meta);">Accessing GitHub API...</p>
                </div>
            </div>
            <a class="mega-nav-item" href="https://matrix.to/#/@usr_40476:4d2.org" target="_blank">@MATRIX</a>
            <a class="mega-nav-item" href="${baseHome}?page=links_and_contact">CONTACT</a>
        </nav>
    </div>
    `;

    document.body.querySelectorAll('.mega-nav-item').forEach(el => createASCIIShift(el));
    
    document.body.insertAdjacentHTML('afterbegin', html);
    
    
    const navWrap = document.getElementById('mega-nav-wrap');
    const unhideBtn = document.getElementById('nav-unhide-btn');
    const currentUrl = window.location.href;

    unhideBtn.addEventListener('click', () => {
        const isCollapsed = navWrap.classList.contains('nav-collapsed');
        if (isCollapsed) {
            navWrap.classList.remove('nav-collapsed');
            unhideBtn.innerText = '▲ HIDE';
        } else {
            navWrap.classList.add('nav-collapsed');
            unhideBtn.innerText = '▼ NAV';
        }
    });

    try {
        const r = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=15`);
        const data = await r.json();
        const container = document.getElementById('repo-inject');
        
        const repoItems = await Promise.all(data.map(async repo => {
            let finalLink = repo.homepage || repo.html_url;

            if (repo.description && repo.description.includes('!header')) {
                try {
                    const lReq = await fetch(`https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch}/header.json`);
                    if (lReq.ok) {
                        let headerData = await lReq.json(); 
                        
                        if (headerData.extendedConfigs && Array.isArray(headerData.extendedConfigs)) {
                            const shouldExtend = headerData.extendedConfigs.some(rx => {
                                try { return new RegExp(rx).test(currentUrl); } catch(e) { return false; }
                            });

                            if (shouldExtend) {
                                const urlWithoutQuery = currentUrl.split('?')[0];
                                const currentDir = urlWithoutQuery.endsWith('/') 
                                    ? urlWithoutQuery 
                                    : urlWithoutQuery.substring(0, urlWithoutQuery.lastIndexOf('/') + 1);
                                
                                try {
                                    const extReq = await fetch(`${currentDir}header-extended.json`);
                                    if (extReq.ok) {
                                        const extData = await extReq.json();
                                        headerData = {
                                            ...headerData,
                                            ...extData,
                                            links: { ...(headerData.links || {}), ...(extData.links || {}) },
                                            rules: { ...(headerData.rules || {}), ...(extData.rules || {}) }
                                        };
                                    }
                                } catch(e) {
                                    console.warn('Could not fetch or parse header-extended.json:', e);
                                }
                            }
                        }

                        if (headerData.links) {
                            if (isPrimary && headerData.links.dev) {
                                finalLink = headerData.links.dev; 
                            } else if (!isPrimary && headerData.links.github) {
                                finalLink = headerData.links.github; 
                            } else if (headerData.links.dev) {
                                finalLink = headerData.links.dev; 
                            } else if (headerData.links.github) {
                                finalLink = headerData.links.github; 
                            }
                        }

                        if (headerData.rules) {
                            if (headerData.rules.autohideregex && Array.isArray(headerData.rules.autohideregex)) {
                                const shouldHide = headerData.rules.autohideregex.some(rx => {
                                    try { return new RegExp(rx).test(currentUrl); } catch(e) { return false; }
                                });
                                
                                if (shouldHide) {
                                    navWrap.classList.add('nav-collapsed');
                                    unhideBtn.style.display = 'block';
                                    unhideBtn.innerText = '▼ NAV'; 
                                }
                            }

                            if (headerData.rules.theme && finalLink && currentUrl.startsWith(finalLink)) {
                                if (headerData.rules.theme === 'light') {
                                    document.documentElement.classList.add('theme-light');
                                    navWrap.classList.add('theme-light');
                                    document.documentElement.classList.remove('theme-dark');
                                    navWrap.classList.remove('theme-dark');
                                } else if (headerData.rules.theme === 'dark') {
                                    document.documentElement.classList.add('theme-dark');
                                    navWrap.classList.add('theme-dark');
                                    document.documentElement.classList.remove('theme-light');
                                    navWrap.classList.remove('theme-light');
                                } else if (headerData.rules.theme === 'auto') {
                                    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
                                        document.documentElement.classList.add('theme-light');
                                        navWrap.classList.add('theme-light');
                                        document.documentElement.classList.remove('theme-dark');
                                        navWrap.classList.remove('theme-dark');
                                    }
                                }
                            }
                        }
                    }
                } catch(e) { console.error('Error parsing header.json for', repo.name, e); }
            }

            return `
            <div class="repo-card">
                <div>
                    <h3>${repo.fork ? '&#9282;' : '📂'} ${repo.name}</h3>
                    <div class="repo-meta">
                        ${repo.fork ? '<span class="badge-fork">FORK</span>' : ''}
                        <span>${repo.language || 'txt'}</span>
                        <span>${new Date(repo.updated_at).toLocaleDateString()}</span>
                    </div>
                    <p style="font-size: 11px; color: var(--nav-meta); margin: 0; font-family: inherit;">${repo.description ? repo.description.replace('!header', '').trim() : ''}</p>
                </div>
                <div style="text-align: right; margin-top: 10px;">
                    <a href="${repo.html_url}" target="_blank" class="mega-nav-item" style="padding:0 !important; font-size:10px !important; margin-right: 10px !important; display: inline-block !important;">REPO</a>
                    <a href="${finalLink}" target="_blank" class="mega-nav-item" style="padding:0 !important; font-size:11px !important; color: var(--nav-text) !important; font-weight: bold !important; display: inline-block !important;">>> OPEN</a>
                </div>
            </div>`;
        }));

        container.innerHTML = repoItems.join('');
    } catch(e) {
        document.getElementById('repo-inject').innerHTML = "<p style='padding:20px; color:red;'>Error connecting to GitHub.</p>";
    }
})();
