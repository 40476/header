(async function() {
    const GITHUB_USERNAME = '40476';
    const currentUrl = window.location.href;
    const isPrimary = window.location.hostname.includes('usr40k.dev');

    // Link resolution
    const baseHome = isPrimary ? 'https://usr40k.dev/' : 'https://40476.github.io/40476/';
    const baseGizmos = isPrimary ? 'https://gizmos.usr40k.dev/' : 'https://40476.github.io/web-gizmos/';

    // Detect locked layout
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
                // Enforce current line height to prevent vertical jitter
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

    // Create Shadow Host
    let host = document.getElementById('mega-nav-feature');
    if (!host) {
        host = document.createElement('div');
        host.id = 'mega-nav-feature';
        document.body.prepend(host);
    }
    const shadow = host.shadowRoot || host.attachShadow({ mode: 'open' });

    const styles = `
        :host {
            --nav-bg: #050505;
            --nav-text: #00ff00;
            --nav-link: #888;
            --nav-border: #222;
            --nav-card: #0a0a0a;
            --nav-meta: #555;
            --nav-heading: #fff;
            --nav-height: 50px;

            display: block;
            position: ${isLockedLayout ? 'absolute' : 'fixed'};
            top: 0;
            left: 0;
            width: 100%;
            z-index: 2147483647;
            font-family: ui-monospace, 'Cascadia Code', monospace;
            transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            pointer-events: none;
        }

        @media (prefers-color-scheme: light) {
            :host(:not(.theme-dark)) {
                --nav-bg: #f8f9fa; --nav-text: #008800; --nav-link: #555;
                --nav-border: #ccc; --nav-card: #ffffff; --nav-meta: #888; --nav-heading: #111;
            }
        }

        :host(.theme-light) {
            --nav-bg: #f8f9fa !important; --nav-text: #008800 !important; --nav-link: #555 !important;
            --nav-border: #ccc !important; --nav-card: #ffffff !important; --nav-meta: #888 !important; --nav-heading: #111 !important;
        }

        :host(.theme-dark) {
            --nav-bg: #050505 !important; --nav-text: #00ff00 !important; --nav-link: #888 !important;
            --nav-border: #222 !important; --nav-card: #0a0a0a !important; --nav-meta: #555 !important; --nav-heading: #fff !important;
        }

        :host(.nav-collapsed) { transform: translateY(-100%) !important; }

        #wrap {
            background: var(--nav-bg);
            color: var(--nav-text);
            border-bottom: 1px solid var(--nav-border);
            min-height: var(--nav-height);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            pointer-events: auto;
            width: 100%;
        }

        nav {
            display: flex;
            align-items: center;
            max-width: 1200px;
            width: 100%;
            height: var(--nav-height);
            position: relative;
            padding: 0 15px;
            box-sizing: border-box;
        }

        .nav-links { display: flex; align-items: center; height: 100%; width: 100%; }

        .item {
            color: var(--nav-link);
            text-decoration: none;
            font-size: 13px;
            padding: 0 15px;
            height: 100%;
            display: flex;
            align-items: center;
            transition: color 0.3s ease;
            cursor: pointer;
            white-space: nowrap;
            background: none;
            border: none;
            font-family: inherit;
            position: relative;
            box-sizing: border-box;
            vertical-align: middle;
        }

        .item:hover { color: var(--nav-text); }

        #mobile-toggle { display: none; }
        .mobile-label {
            display: none; font-size: 14px; color: var(--nav-text); padding: 0 15px;
            cursor: pointer; height: var(--nav-height); align-items: center; font-weight: bold;
        }

        #repo-check { display: none; }
        .mega-drop {
            visibility: hidden; opacity: 0; transform: translateY(-10px);
            position: absolute; top: var(--nav-height); left: 0; width: 100%;
            background: var(--nav-bg); border-bottom: 2px solid var(--nav-text);
            padding: 20px; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 15px; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            max-height: 80vh; overflow-y: auto; box-sizing: border-box; z-index: 10;
        }

        #repo-check:checked ~ .mega-drop { visibility: visible; opacity: 1; transform: translateY(0); }

        .repo-card {
            border: 1px solid var(--nav-border); padding: 12px; background: var(--nav-card);
            display: flex; flex-direction: column; justify-content: space-between; transition: border-color 0.2s;
            overflow: hidden;
        }
        .repo-card:hover { border-color: var(--nav-text); }
        .repo-card h3 { 
            margin: 0; font-size: 14px; color: var(--nav-heading); font-weight: bold; 
            cursor: pointer; width: fit-content; line-height: 1.4;
        }
        .repo-meta { font-size: 10px; color: var(--nav-meta); margin: 5px 0; display: flex; gap: 8px; align-items: center; }
        .badge-fork { color: #ffaa00; border: 1px solid #ffaa00; padding: 1px 4px; border-radius: 3px; font-size: 9px; }
        .repo-desc { font-size: 11px; color: var(--nav-meta); margin: 0; }
        .card-actions { text-align: right; margin-top: 10px; }
        .btn-sm { font-size: 10px; text-decoration: none; color: var(--nav-link); margin-left: 10px; }
        .btn-sm.primary { color: var(--nav-text); font-weight: bold; }

        #nav-unhide-btn {
            display: none; position: absolute; bottom: -24px; right: 20px;
            background: var(--nav-bg); color: var(--nav-text); padding: 4px 12px;
            cursor: pointer; border: 1px solid var(--nav-border); border-top: none;
            font-size: 11px; border-radius: 0 0 5px 5px; pointer-events: auto;
        }

        @media (max-width: 850px) {
            #wrap { position: absolute; top: 0; left: 0; }
            nav { flex-direction: column; height: auto; padding: 0; align-items: stretch; }
            .mobile-label { display: flex; border-bottom: 1px solid var(--nav-border); }
            .nav-links { display: none; flex-direction: column; height: auto; background: var(--nav-bg); }
            #mobile-toggle:checked ~ .nav-links { display: flex; }
            .item { width: 100%; height: 50px; border-bottom: 1px solid var(--nav-border); justify-content: flex-start; padding: 0 20px; }
            .mega-drop { position: relative; top: 0; grid-template-columns: 1fr; display: none; padding: 10px; transform: none; }
            #repo-check:checked ~ .mega-drop { display: grid; }
        }
    `;

    if (!isLockedLayout) {
        const styleTag = document.createElement('style');
        styleTag.textContent = `html { padding-top: 50px !important; transition: padding-top 0.4s ease; box-sizing: border-box; }`;
        document.head.appendChild(styleTag);
    }

    shadow.innerHTML = `
        <style>${styles}</style>
        <div id="wrap">
            <div id="nav-unhide-btn">▼ NAV</div>
            <nav>
                <input type="checkbox" id="mobile-toggle">
                <label for="mobile-toggle" class="mobile-label">☰ [ MENU ]</label>
                <div class="nav-links">
                    <a href="${baseHome}" class="item js-ascii">[ HOME ]</a>
                    <a href="${baseGizmos}" class="item js-ascii">[ GIZMOS ]</a>
                    <div style="display: contents;">
                        <input type="checkbox" id="repo-check">
                        <label for="repo-check" class="item js-ascii">/REPOSITORIES/ ▾</label>
                        <div class="mega-drop" id="repo-inject">
                            <p style="padding: 20px; color: var(--nav-meta);">Accessing GitHub API...</p>
                        </div>
                    </div>
                    <a href="https://matrix.to/#/@usr_40476:4d2.org" class="item js-ascii" target="_blank">@MATRIX</a>
                    <a href="${baseHome}?page=links_and_contact" class="item js-ascii">CONTACT</a>
                </div>
            </nav>
        </div>
    `;

    shadow.querySelectorAll('.js-ascii').forEach(el => createASCIIShift(el));

    const unhideBtn = shadow.getElementById('nav-unhide-btn');
    unhideBtn.onclick = () => {
        const isCollapsed = host.classList.toggle('nav-collapsed');
        unhideBtn.innerText = isCollapsed ? '▼ NAV' : '▲ HIDE';
        if (!isLockedLayout) document.documentElement.style.paddingTop = isCollapsed ? '0px' : '50px';
    };

    try {
        const r = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=20`);
        const data = await r.json();
        const container = shadow.getElementById('repo-inject');
        const repoItems = await Promise.all(data.map(async repo => {
            let finalLink = repo.homepage || repo.html_url;
            if (repo.description && repo.description.includes('!header')) {
                try {
                    const lReq = await fetch(`https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch}/header.json`);
                    if (lReq.ok) {
                        const headerData = await lReq.json();
                        if (headerData.rules?.autohideregex?.some(rx => new RegExp(rx).test(currentUrl))) {
                            host.classList.add('nav-collapsed');
                            unhideBtn.style.display = 'block';
                            if (!isLockedLayout) document.documentElement.style.paddingTop = '0px';
                        }
                        if (headerData.rules?.theme) {
                            // Remove both possible theme classes to ensure a clean override
                            host.classList.remove('theme-light', 'theme-dark');
                            
                            // Apply the theme from JSON
                            const newTheme = headerData.rules.theme === 'light' ? 'theme-light' : 'theme-dark';
                            host.classList.add(newTheme);
                        }
                    }
                } catch(e) {}
            }
            return `
                <div class="repo-card">
                    <div>
                        <h3 class="js-ascii-repo">${repo.fork ? '&#9282;' : '📂'} ${repo.name}</h3>
                        <div class="repo-meta">
                            ${repo.fork ? '<span class="badge-fork">FORK</span>' : ''}
                            <span>${repo.language || 'txt'}</span>
                            <span>${new Date(repo.updated_at).toLocaleDateString()}</span>
                        </div>
                        <p class="repo-desc">${repo.description ? repo.description.replace('!header', '').trim() : ''}</p>
                    </div>
                    <div class="card-actions">
                        <a href="${repo.html_url}" target="_blank" class="btn-sm">REPO</a>
                        <a href="${finalLink}" target="_blank" class="btn-sm primary">>> OPEN</a>
                    </div>
                </div>`;
        }));
        container.innerHTML = repoItems.join('');
        shadow.querySelectorAll('.js-ascii-repo').forEach(el => createASCIIShift(el));
    } catch(e) {
        shadow.getElementById('repo-inject').innerHTML = "<p style='padding:20px; color:red;'>Error connecting to GitHub.</p>";
    }

    document.addEventListener('click', (e) => {
        if (!host.contains(e.target)) {
            shadow.getElementById('repo-check').checked = false;
            shadow.getElementById('mobile-toggle').checked = false;
        }
    });
})();
