(async function() {
    const GITHUB_USERNAME = '40476';
    const isPrimary = window.location.hostname.includes('usr40k.dev');

    // Link resolution based on environment
    const baseHome = isPrimary ? 'https://usr40k.dev/' : 'https://40476.github.io/40476/';
    const baseGizmos = isPrimary ? 'https://gizmos.usr40k.dev/' : 'https://40476.github.io/web-gizmos/';

    // Detect if the page is using a locked layout (like Gizmos)
    const isLockedLayout = window.getComputedStyle(document.body).overflow === 'hidden' || 
                          window.getComputedStyle(document.documentElement).overflow === 'hidden';

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

    /* Light Theme Overrides 
       (Catches if the class is on the HTML/BODY, or the nav wrapper itself) */
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

    #mega-nav-wrap { 
        all: initial; 
        font-family: ui-monospace, 'Cascadia Code', monospace; 
        display: block; 
        position: ${isLockedLayout ? 'absolute' : 'sticky'}; 
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

    /* The pull-down tab for when nav is autohidden */
    #nav-unhide-btn {
        display: none; 
        position: fixed; 
        top: 0; 
        right: 20px; 
        background: var(--nav-bg); 
        color: var(--nav-text); 
        padding: 5px 15px; 
        cursor: pointer; 
        z-index: 9999998; /* Just under the nav wrapper */
        border: 1px solid var(--nav-border); 
        border-top: none;
        font-family: ui-monospace, 'Cascadia Code', monospace; 
        font-size: 11px;
        border-radius: 0 0 5px 5px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        transition: background-color 0.3s ease, color 0.3s ease;
    }

    ${!isLockedLayout ? 'body { padding-top: 0 !important; }' : ''}

    @media (max-width: 768px) {
        #mega-nav-wrap .mobile-label { display: block !important; }
        #mega-nav-wrap .nav-inner { height: auto !important; flex-direction: column !important; align-items: flex-start !important; display: none !important; padding-bottom: 10px !important; }
        #mega-nav-wrap #mobile-check:checked ~ .nav-inner { display: flex !important; }
        #mega-nav-wrap .mega-nav-item { width: 100% !important; box-sizing: border-box !important; border-bottom: 1px solid var(--nav-border) !important; }
        #mega-nav-wrap .mega-drop { position: relative !important; top: 0 !important; width: 100% !important; margin-left: 0 !important; }
    }
    `;

    const html = `
    <style>${style}</style>
    <div id="nav-unhide-btn">▼ NAV</div>
    <div id="mega-nav-wrap">
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

    document.body.insertAdjacentHTML('afterbegin', html);

    const navWrap = document.getElementById('mega-nav-wrap');
    const unhideBtn = document.getElementById('nav-unhide-btn');
    const currentUrl = window.location.href;

    // Handle reopening the nav
    unhideBtn.addEventListener('click', () => {
        navWrap.classList.remove('nav-collapsed');
        unhideBtn.style.display = 'none';
    });

    // Fetch Repos with Fork Detection and header.json logic
    try {
        const r = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=15`);
        const data = await r.json();
        const container = document.getElementById('repo-inject');
        
        const repoItems = await Promise.all(data.map(async repo => {
            // Default the finalLink to the repo URL (or the repo's homepage if you set one in GitHub)
            let finalLink = repo.homepage || repo.html_url;

            // !header Logic
            if (repo.description && repo.description.includes('!header')) {
                try {
                    const lReq = await fetch(`https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch}/header.json`);
                    if (lReq.ok) {
                        const headerData = await lReq.json();
                        
                        // Parse JSON Elements: Dynamic Links
                        if (headerData.links) {
                            if (isGithubEnv && headerData.links.github) {
                                finalLink = headerData.links.github;
                            } else if (!isGithubEnv && headerData.links.dev) {
                                finalLink = headerData.links.dev;
                            } else if (headerData.links.dev) {
                                finalLink = headerData.links.dev; // Fallback to dev if github link is missing
                            } else if (headerData.links.github) {
                                finalLink = headerData.links.github; // Fallback to github if dev link is missing
                            }
                        }

                        // Parse JSON Elements: Rules
                        if (headerData.rules) {
                            if (headerData.rules.autohideregex && Array.isArray(headerData.rules.autohideregex)) {
                                const shouldHide = headerData.rules.autohideregex.some(rx => {
                                    try { return new RegExp(rx).test(currentUrl); } catch(e) { return false; }
                                });
                                
                                if (shouldHide) {
                                    navWrap.classList.add('nav-collapsed');
                                    unhideBtn.style.display = 'block';
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
                    <h3>${repo.fork ? '🍴' : '📂'} ${repo.name}</h3>
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
