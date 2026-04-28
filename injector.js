(async function() {
    /**
     * EXTENSION SYSTEM
     * We define the registration function immediately so that other scripts
     * can call it even if the nav hasn't finished loading yet.
     */
    let navReady = false;
    let pendingExtensions = null;

    window.registerNavExtensions = function(config) {
        if (navReady) {
            applyExtensions(config);
        } else {
            pendingExtensions = config;
        }
    };

    if (!document.body) {
        await new Promise(resolve => {
            window.addEventListener('DOMContentLoaded', resolve);
        });
    }
    
    const GITHUB_USERNAME = '40476';
    const isPrimary = window.location.hostname.includes('usr40k.dev');
    const baseHome = isPrimary ? 'https://usr40k.dev/' : 'https://40476.github.io/40476/';
    const baseGizmos = isPrimary ? 'https://gizmos.usr40k.dev/' : 'https://40476.github.io/web-gizmos/';

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
            chars: '.,·-─~+:;=*""!?&#$@0123456789*',
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
    #mega-nav-wrap {
        --nav-bg: #050505;
        --nav-text: #00ff00;
        --nav-link: #888;
        --nav-border: #222;
        --nav-card: #0a0a0a;
        --nav-meta: #555;
        --nav-heading: #fff;
        --nav-input-bg: #111;
    }

    .theme-light #mega-nav-wrap, [data-theme="light"] #mega-nav-wrap {
        --nav-bg: #f8f9fa !important;
        --nav-text: #008800 !important;
        --nav-link: #555 !important;
        --nav-border: #ccc !important;
        --nav-card: #ffffff !important;
        --nav-meta: #888 !important;
        --nav-heading: #111 !important;
        --nav-input-bg: #eee !important;
    }

    #mega-nav-wrap { 
        all: initial; 
        font-family: ui-monospace, 'Cascadia Code', monospace; 
        display: block; 
        position: ${isLockedLayout ? 'absolute' : 'fixed'}; 
        top: 0; left: 0; width: 100%; 
        z-index: 9999999; 
        background: var(--nav-bg) !important; 
        color: var(--nav-text) !important; 
        border-bottom: 1px solid var(--nav-border) !important;
        box-sizing: border-box !important;
        transition: transform 0.3s ease, background-color 0.3s ease !important;
    }

    #mega-nav-wrap.nav-collapsed { transform: translateY(-100%) !important; }
    #mega-nav-wrap * { box-sizing: border-box !important; }
    
    #mega-nav-wrap .nav-inner { 
        display: flex !important; 
        align-items: center !important; 
        max-width: 1400px !important; 
        margin: 0 auto !important; 
        height: 50px !important; 
        padding: 0 15px !important; 
        position: relative !important;
    }

    #nav-extension-zone {
        flex: 1 !important;
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        gap: 15px !important;
        padding: 0 20px !important;
    }

    .nav-search-box {
        background: var(--nav-input-bg) !important;
        border: 1px solid var(--nav-border) !important;
        color: var(--nav-text) !important;
        padding: 4px 10px !important;
        font-family: inherit !important;
        font-size: 12px !important;
        outline: none !important;
        width: 100% !important;
        max-width: 300px !important;
        border-radius: 2px !important;
    }

    .nav-search-box:focus { border-color: var(--nav-text) !important; box-shadow: 0 0 5px var(--nav-text); }

    .nav-ext-btn {
        background: var(--nav-card) !important;
        border: 1px solid var(--nav-border) !important;
        color: var(--nav-link) !important;
        font-size: 11px !important;
        padding: 4px 10px !important;
        cursor: pointer !important;
        text-transform: uppercase !important;
        transition: all 0.2s ease !important;
    }

    .nav-ext-btn:hover { border-color: var(--nav-text) !important; color: var(--nav-text) !important; }

    #mega-nav-wrap .mega-nav-item { 
        color: var(--nav-link) !important; 
        text-decoration: none !important; 
        padding: 10px 12px !important; 
        font-size: 13px !important; 
        cursor: pointer !important; 
        white-space: nowrap !important;
    }
    
    #mega-nav-wrap .mega-nav-item:hover { color: var(--nav-text) !important; text-shadow: 0 0 5px var(--nav-text) !important; }
    
    #mega-nav-wrap .mega-drop {
        visibility: hidden; opacity: 0; transform: translateY(-10px);
        position: absolute; top: 50px; left: 0; width: 100%;
        background: var(--nav-bg) !important; 
        border-bottom: 2px solid var(--nav-text) !important; 
        padding: 20px !important;
        display: grid; 
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px;
        max-height: 80vh; overflow-y: auto; 
        box-shadow: 0 10px 30px rgba(0,0,0,0.8);
        transition: all 0.3s ease !important;
        pointer-events: none;
    }
    
    #mega-nav-wrap #repo-check:checked ~ .mega-drop { visibility: visible; opacity: 1; transform: translateY(0); pointer-events: auto; }
    
    #mega-nav-wrap .repo-card { 
        border: 1px solid var(--nav-border) !important; padding: 12px !important; 
        background: var(--nav-card) !important; display: flex !important; 
        flex-direction: column !important; justify-content: space-between !important; 
    }

    #nav-unhide-btn {
        display: none; position: absolute; bottom: -22px; right: 5px; 
        background: var(--nav-bg); color: var(--nav-text); padding: 4px 12px; 
        cursor: pointer; z-index: 10000000; border: 1px solid var(--nav-border); 
        border-top: none; font-size: 11px; border-radius: 0 0 5px 5px;
    }

    #repo-check, #mobile-check { display: none !important; }

    ${!isLockedLayout ? 'html { padding-top: 50px !important; }' : ''}
    `;

    const html = `
    <style>${style}</style>
    <div id="mega-nav-wrap">
        <div id="nav-unhide-btn">▼</div>
        <input type="checkbox" id="mobile-check">
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

            <div id="nav-extension-zone"></div>

            <a class="mega-nav-item" href="https://matrix.to/#/@usr_40476:4d2.org" target="_blank">@MATRIX</a>
        </nav>
    </div>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', html);

    const extZone = document.getElementById('nav-extension-zone');
    const navWrap = document.getElementById('mega-nav-wrap');
    const unhideBtn = document.getElementById('nav-unhide-btn');

    /**
     * Internal function to build the extension UI elements
     */
    function applyExtensions(config) {
        if (!config) return;
        extZone.innerHTML = ''; // Clear existing extensions

        // Search
        if (config.search) {
            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.className = 'nav-search-box';
            searchInput.placeholder = config.search.placeholder || 'SEARCH...';
            
            searchInput.addEventListener('input', (e) => {
                if (typeof config.search.onInput === 'function') config.search.onInput(e.target.value);
            });

            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && typeof config.search.onEnter === 'function') config.search.onEnter(e.target.value);
            });

            extZone.appendChild(searchInput);
        }

        // Buttons
        if (config.buttons && Array.isArray(config.buttons)) {
            config.buttons.forEach(btnCfg => {
                const btn = document.createElement('button');
                btn.className = 'nav-ext-btn';
                btn.textContent = btnCfg.label || 'BTN';
                btn.addEventListener('click', () => {
                    if (typeof btnCfg.onClick === 'function') btnCfg.onClick();
                });
                extZone.appendChild(btn);
            });
        }
    }

    // Mark system as ready and process any calls that happened early
    navReady = true;
    if (pendingExtensions) {
        applyExtensions(pendingExtensions);
    }

    // UI Listeners
    document.body.querySelectorAll('.mega-nav-item').forEach(el => createASCIIShift(el));

    unhideBtn.addEventListener('click', () => {
        const isCollapsed = navWrap.classList.contains('nav-collapsed');
        navWrap.classList.toggle('nav-collapsed');
        unhideBtn.innerText = isCollapsed ? '▲' : '▼';
    });

    // GitHub Repo Logic
    try {
        const r = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=15`);
        const data = await r.json();
        const container = document.getElementById('repo-inject');
        
        const repoItems = await Promise.all(data.map(async repo => {
            let finalLink = repo.homepage || repo.html_url;
            return `
            <div class="repo-card">
                <div>
                    <h3>${repo.fork ? '&#9282;' : '📂'} ${repo.name}</h3>
                    <div class="repo-meta">
                        ${repo.fork ? '<span style="color:#ffaa00;border:1px solid #ffaa00;padding:1px 4px;font-size:9px">FORK</span>' : ''}
                        <span>${repo.language || 'txt'}</span>
                    </div>
                </div>
                <div style="text-align: right; margin-top: 10px;">
                    <a href="${finalLink}" target="_blank" class="mega-nav-item" style="color:var(--nav-text)!important; font-weight:bold!important;">>> OPEN</a>
                </div>
            </div>`;
        }));

        container.innerHTML = repoItems.join('');
        document.body.querySelectorAll('.repo-card h3').forEach(el => createASCIIShift(el));
    } catch(e) {
        document.getElementById('repo-inject').innerHTML = "<p style='color:red;'>Error connecting to GitHub.</p>";
    }
})();
