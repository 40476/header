(async function() {
    const GITHUB_USERNAME = '40476';
    const currentUrl = window.location.href;
    const isPrimary = window.location.hostname.includes('usr40k.dev');

    // Link resolution based on environment
    const baseHome = isPrimary ? 'https://usr40k.dev/' : 'https://40476.github.io/40476/';
    const baseGizmos = isPrimary ? 'https://gizmos.usr40k.dev/' : 'https://40476.github.io/web-gizmos/';

    // Detect locked layout for positioning
    const isLockedLayout = window.getComputedStyle(document.body).overflow === 'hidden' || 
                           window.getComputedStyle(document.documentElement).overflow === 'hidden';

    // 1. CREATE SHADOW HOST
    let host = document.getElementById('mega-nav-feature');
    if (!host) {
        host = document.createElement('div');
        host.id = 'mega-nav-feature';
        document.body.prepend(host);
    }
    const shadow = host.shadowRoot || host.attachShadow({ mode: 'open' });

    const styles = `
        :host {
            /* Default: Dark Theme */
            --nav-bg: #050505;
            --nav-text: #00ff00;
            --nav-glow: rgba(0, 255, 0, 0.3);
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

        /* OS Auto-Theme Fallback */
        @media (prefers-color-scheme: light) {
            :host(:not(.theme-dark)) {
                --nav-bg: #f8f9fa;
                --nav-text: #008800;
                --nav-glow: rgba(0, 136, 0, 0.2);
                --nav-link: #555;
                --nav-border: #ccc;
                --nav-card: #ffffff;
                --nav-meta: #888;
                --nav-heading: #111;
            }
        }

        /* Explicit Light Theme Override */
        :host(.theme-light) {
            --nav-bg: #f8f9fa !important;
            --nav-text: #008800 !important;
            --nav-glow: rgba(0, 136, 0, 0.2) !important;
            --nav-link: #555 !important;
            --nav-border: #ccc !important;
            --nav-card: #ffffff !important;
            --nav-meta: #888 !important;
            --nav-heading: #111 !important;
        }

        /* Explicit Dark Theme Override */
        :host(.theme-dark) {
            --nav-bg: #050505 !important;
            --nav-text: #00ff00 !important;
            --nav-glow: rgba(0, 255, 0, 0.3) !important;
            --nav-link: #888 !important;
            --nav-border: #222 !important;
            --nav-card: #0a0a0a !important;
            --nav-meta: #555 !important;
            --nav-heading: #fff !important;
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
            padding: 0;
            pointer-events: auto;
            box-sizing: border-box;
            width: 100%;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
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

        .nav-links {
            display: flex;
            align-items: center;
            height: 100%;
            width: 100%;
        }

        .item {
            color: var(--nav-link);
            text-decoration: none;
            font-size: 13px;
            padding: 0 15px;
            height: 100%;
            display: flex;
            align-items: center;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
            white-space: nowrap;
            background: none;
            border: none;
            font-family: inherit;
            position: relative;
            overflow: hidden;
        }

        .item::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            width: 0;
            height: 2px;
            background: var(--nav-text);
            transition: all 0.3s ease;
            transform: translateX(-50%);
            box-shadow: 0 0 8px var(--nav-text);
        }

        .item:hover {
            color: var(--nav-text);
            text-shadow: 0 0 8px var(--nav-glow);
            background: rgba(255,255,255,0.03);
        }

        .item:hover::after {
            width: 100%;
        }

        /* Mobile Menu Toggle Animation */
        #mobile-toggle { display: none; }
        .mobile-label {
            display: none;
            font-size: 14px;
            color: var(--nav-text);
            padding: 0 15px;
            cursor: pointer;
            height: var(--nav-height);
            align-items: center;
            font-weight: bold;
            transition: background 0.2s;
        }
        .mobile-label:active { background: rgba(255,255,255,0.1); }

        #repo-check { display: none; }
        .mega-drop {
            visibility: hidden;
            opacity: 0;
            transform: translateY(-10px) scale(0.98);
            position: absolute;
            top: var(--nav-height);
            left: 0;
            width: 100%;
            background: var(--nav-bg);
            border-bottom: 2px solid var(--nav-text);
            padding: 20px;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.6);
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            max-height: 80vh;
            overflow-y: auto;
            box-sizing: border-box;
            z-index: 10;
        }

        #repo-check:checked ~ .mega-drop {
            visibility: visible;
            opacity: 1;
            transform: translateY(0) scale(1);
        }

        .repo-card {
            border: 1px solid var(--nav-border);
            padding: 12px;
            background: var(--nav-card);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .repo-card:hover {
            transform: translateY(-3px);
            border-color: var(--nav-text);
            box-shadow: 0 5px 15px rgba(0,0,0,0.4);
        }

        .repo-card h3 { margin: 0; font-size: 14px; color: var(--nav-heading); font-weight: bold; transition: color 0.2s; }
        .repo-card:hover h3 { color: var(--nav-text); }
        
        .repo-meta { font-size: 10px; color: var(--nav-meta); margin: 5px 0; display: flex; gap: 8px; align-items: center; }
        .badge-fork { color: #ffaa00; border: 1px solid #ffaa00; padding: 1px 4px; border-radius: 3px; font-size: 9px; }
        .repo-desc { font-size: 11px; color: var(--nav-meta); margin: 0; height: 3em; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
        
        .card-actions { text-align: right; margin-top: 10px; }
        .btn-sm { font-size: 10px; text-decoration: none; color: var(--nav-link); margin-left: 10px; display: inline-block; transition: color 0.2s; }
        .btn-sm:hover { color: var(--nav-text); }
        .btn-sm.primary { color: var(--nav-text); font-weight: bold; font-size: 11px; padding: 2px 6px; border: 1px solid transparent; }
        .btn-sm.primary:hover { border-color: var(--nav-text); border-radius: 3px; }

        #nav-unhide-btn {
            display: none;
            position: absolute;
            bottom: -24px;
            right: 20px;
            background: var(--nav-bg);
            color: var(--nav-text);
            padding: 4px 12px;
            cursor: pointer;
            border: 1px solid var(--nav-border);
            border-top: none;
            font-size: 11px;
            border-radius: 0 0 5px 5px;
            pointer-events: auto;
            transition: all 0.2s;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        #nav-unhide-btn:hover { background: var(--nav-text); color: var(--nav-bg); }

        @media (max-width: 850px) {
            #wrap {
                position: absolute;
                top: 0;
                left: 0;
            }
            nav {
                flex-direction: column;
                height: auto;
                padding: 0;
                align-items: stretch;
            }
            .mobile-label { 
                display: flex; 
                width: 100%; 
                justify-content: flex-start;
                box-sizing: border-box;
                border-bottom: 1px solid var(--nav-border);
            }
            .nav-links {
                display: none;
                flex-direction: column;
                height: auto;
                width: 100%;
                background: var(--nav-bg);
                align-items: stretch;
                animation: slideDown 0.3s ease forwards;
            }
            @keyframes slideDown {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            #mobile-toggle:checked ~ .nav-links { 
                display: flex; 
            }
            .item {
                width: 100%;
                height: 50px;
                padding: 0 20px;
                border-bottom: 1px solid var(--nav-border);
                justify-content: flex-start;
                box-sizing: border-box;
            }
            .item::after { display: none; }
            
            .mega-drop {
                position: relative;
                top: 0;
                bottom: auto;
                width: 100%;
                height: auto;
                max-height: calc(100vh - 350px);
                grid-template-columns: 1fr;
                box-shadow: none;
                border-top: none;
                border-bottom: 2px solid var(--nav-text);
                transform: none;
                opacity: 0;
                display: none;
                visibility: visible;
                overflow-y: auto;
                padding: 10px;
                transition: opacity 0.3s ease;
            }
            #repo-check:checked ~ .mega-drop { 
                display: grid; 
                opacity: 1;
            }
            #wrap { height: auto; min-height: var(--nav-height); }
        }
    `;

    // Push down content if not locked
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
                    <a href="${baseHome}" class="item">[ HOME ]</a>
                    <a href="${baseGizmos}" class="item">[ GIZMOS ]</a>
                    <div style="display: contents;">
                        <input type="checkbox" id="repo-check">
                        <label for="repo-check" class="item">/REPOSITORIES/ ▾</label>
                        <div class="mega-drop" id="repo-inject">
                            <p style="padding: 20px; color: var(--nav-meta);">Accessing GitHub API...</p>
                        </div>
                    </div>
                    <a href="https://matrix.to/#/@usr_40476:4d2.org" class="item" target="_blank">@MATRIX</a>
                    <a href="${baseHome}?page=links_and_contact" class="item">CONTACT</a>
                </div>
            </nav>
        </div>
    `;

    const unhideBtn = shadow.getElementById('nav-unhide-btn');
    unhideBtn.onclick = () => {
        const isCollapsed = host.classList.contains('nav-collapsed');
        if (isCollapsed) {
            host.classList.remove('nav-collapsed');
            unhideBtn.innerText = '▲ HIDE';
            if (!isLockedLayout) document.documentElement.style.paddingTop = '50px';
        } else {
            host.classList.add('nav-collapsed');
            unhideBtn.innerText = '▼ NAV';
            if (!isLockedLayout) document.documentElement.style.paddingTop = '0px';
        }
    };

    // Fetch and Process Logic
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
                        let headerData = await lReq.json();

                        // Extended Configs Logic
                        if (headerData.extendedConfigs && Array.isArray(headerData.extendedConfigs)) {
                            const shouldExtend = headerData.extendedConfigs.some(rx => {
                                try { return new RegExp(rx).test(currentUrl); } catch(e) { return false; }
                            });

                            if (shouldExtend) {
                                const urlWithoutQuery = currentUrl.split('?')[0];
                                const currentDir = urlWithoutQuery.endsWith('/') ? urlWithoutQuery : urlWithoutQuery.substring(0, urlWithoutQuery.lastIndexOf('/') + 1);
                                try {
                                    const extReq = await fetch(`${currentDir}header-extended.json`);
                                    if (extReq.ok) {
                                        const extData = await extReq.json();
                                        headerData = {
                                            ...headerData, ...extData,
                                            links: { ...(headerData.links || {}), ...(extData.links || {}) },
                                            rules: { ...(headerData.rules || {}), ...(extData.rules || {}) }
                                        };
                                    }
                                } catch(e) {}
                            }
                        }

                        // Link Resolution
                        if (headerData.links) {
                            if (isPrimary && headerData.links.dev) finalLink = headerData.links.dev;
                            else if (!isPrimary && headerData.links.github) finalLink = headerData.links.github;
                            else if (headerData.links.dev) finalLink = headerData.links.dev;
                            else if (headerData.links.github) finalLink = headerData.links.github;
                        }

                        // Rules Resolution (Theme & Autohide)
                        const isCurrentSite = finalLink && currentUrl.startsWith(finalLink);
                        if (headerData.rules) {
                            // Autohide
                            if (headerData.rules.autohideregex?.some(rx => new RegExp(rx).test(currentUrl))) {
                                host.classList.add('nav-collapsed');
                                unhideBtn.style.display = 'block';
                                unhideBtn.innerText = '▼ NAV';
                                if (!isLockedLayout) document.documentElement.style.paddingTop = '0px';
                            }
                            // Theme (only if current site match)
                            if (isCurrentSite && headerData.rules.theme) {
                                if (headerData.rules.theme === 'light') host.classList.add('theme-light');
                                else if (headerData.rules.theme === 'dark') host.classList.add('theme-dark');
                            }
                        }
                    }
                } catch(e) {}
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
                        <p class="repo-desc">${repo.description ? repo.description.replace('!header', '').trim() : ''}</p>
                    </div>
                    <div class="card-actions">
                        <a href="${repo.html_url}" target="_blank" class="btn-sm">REPO</a>
                        <a href="${finalLink}" target="_blank" class="btn-sm primary">>> OPEN</a>
                    </div>
                </div>`;
        }));

        container.innerHTML = repoItems.join('');
    } catch(e) {
        shadow.getElementById('repo-inject').innerHTML = "<p style='padding:20px; color:red;'>Error connecting to GitHub.</p>";
    }

    // Close dropdowns on click outside
    document.addEventListener('click', (e) => {
        const repoCheck = shadow.getElementById('repo-check');
        const mobileToggle = shadow.getElementById('mobile-toggle');
        if (!host.contains(e.target)) {
            if (repoCheck) repoCheck.checked = false;
            if (mobileToggle) mobileToggle.checked = false;
        }
    });

})();
