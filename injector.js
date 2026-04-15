(async function() {
    const GITHUB_USERNAME = '40476';
    const CACHE_KEY = `mega_nav_cache_${GITHUB_USERNAME}`;
    const CACHE_TTL = 5 * 60 * 1000; 
    
    const isPrimary = window.location.hostname.includes('usr40k.dev');
    const baseHome = isPrimary ? 'https://usr40k.dev/' : 'https://40476.github.io/40476/';
    const baseGizmos = isPrimary ? 'https://gizmos.usr40k.dev/' : 'https://40476.github.io/web-gizmos/';
    const currentUrl = window.location.href;

    // 1. CREATE SHADOW HOST
    // We ensure the host itself doesn't interfere with page layout
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
            
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            z-index: 2147483647;
            font-family: ui-monospace, 'Cascadia Code', monospace;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: none; /* Let clicks pass through the host container */
        }

        :host(.nav-hidden) { transform: translateY(-100%); }
        :host(.theme-light) {
            --nav-bg: #f8f9fa; --nav-text: #008800; --nav-link: #555;
            --nav-border: #ccc; --nav-card: #ffffff; --nav-meta: #888; --nav-heading: #111;
        }

        #wrap {
            background: var(--nav-bg);
            color: var(--nav-text);
            border-bottom: 1px solid var(--nav-border);
            height: var(--nav-height);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 20px;
            pointer-events: auto; /* Re-enable clicks for the actual nav */
            box-sizing: border-box;
            width: 100%;
        }

        nav {
            display: flex;
            gap: 5px;
            align-items: center;
            max-width: 1200px;
            width: 100%;
            height: 100%;
        }

        .item {
            color: var(--nav-link);
            text-decoration: none;
            font-size: 13px;
            padding: 0 12px;
            height: 100%;
            display: flex;
            align-items: center;
            transition: all 0.2s;
            cursor: pointer;
            white-space: nowrap;
            border: none;
            background: none;
            text-transform: uppercase;
        }

        .item:hover, .item.active {
            color: var(--nav-text);
            text-shadow: 0 0 8px var(--nav-text);
        }

        /* Dropdown Logic */
        .dropdown-trigger { height: 100%; display: flex; align-items: center; }
        #repo-toggle { display: none; }
        
        .mega-drop {
            position: absolute;
            top: var(--nav-height);
            left: 0;
            right: 0;
            margin: 0 auto;
            width: 95vw;
            max-width: 1160px;
            background: var(--nav-bg);
            border: 1px solid var(--nav-border);
            border-top: none;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            padding: 20px;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
            gap: 15px;
            opacity: 0;
            visibility: hidden;
            transition: all 0.2s ease;
            max-height: 80vh;
            overflow-y: auto;
            box-sizing: border-box;
        }

        #repo-toggle:checked ~ .mega-drop {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }

        /* Repo Cards */
        .card {
            background: var(--nav-card);
            border: 1px solid var(--nav-border);
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            box-sizing: border-box;
        }

        .card h3 { margin: 0; font-size: 13px; color: var(--nav-heading); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .meta { font-size: 9px; color: var(--nav-meta); display: flex; gap: 8px; }
        .desc { font-size: 11px; color: var(--nav-link); line-height: 1.3; margin: 0; height: 2.6em; overflow: hidden; }
        .card-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: auto; padding-top: 8px; border-top: 1px solid var(--nav-border); }
        
        .btn-sm { font-size: 10px; text-decoration: none; color: var(--nav-link); }
        .btn-sm.primary { color: var(--nav-text); font-weight: bold; }

        #unhide-tab {
            position: absolute;
            bottom: -25px;
            right: 20px;
            background: var(--nav-bg);
            border: 1px solid var(--nav-border);
            border-top: none;
            padding: 4px 12px;
            font-size: 10px;
            cursor: pointer;
            border-radius: 0 0 4px 4px;
            display: none;
            pointer-events: auto;
        }

        @media (max-width: 768px) {
            nav { overflow-x: auto; scrollbar-width: none; }
            nav::-webkit-scrollbar { display: none; }
            .mega-drop { width: 100vw; border-left: none; border-right: none; }
        }

        .skeleton { height: 80px; background: var(--nav-border); opacity: 0.3; animation: pulse 1.5s infinite; }
        @keyframes pulse { 50% { opacity: 0.1; } }
    `;

    shadow.innerHTML = `
        <style>${styles}</style>
        <div id="wrap">
            <nav>
                <a href="${baseHome}" class="item ${currentUrl === baseHome ? 'active' : ''}">[ HOME ]</a>
                <a href="${baseGizmos}" class="item ${currentUrl.includes('gizmos') ? 'active' : ''}">[ GIZMOS ]</a>
                
                <div class="dropdown-trigger">
                    <input type="checkbox" id="repo-toggle">
                    <label for="repo-toggle" class="item">/REPOSITORIES/ ▾</label>
                    <div class="mega-drop" id="repo-content">
                        <div class="skeleton"></div>
                        <div class="skeleton"></div>
                        <div class="skeleton"></div>
                        <div class="skeleton"></div>
                    </div>
                </div>

                <a href="https://matrix.to/#/@usr_40476:4d2.org" class="item" target="_blank">@MATRIX</a>
                <a href="${baseHome}?page=links_and_contact" class="item">CONTACT</a>
            </nav>
            <div id="unhide-tab">▼ NAV</div>
        </div>
    `;

    // 2. SMART SCROLL LOGIC
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll <= 0) {
            host.classList.remove('nav-hidden');
            return;
        }
        if (currentScroll > lastScroll && !host.classList.contains('nav-hidden') && currentScroll > 100) {
            host.classList.add('nav-hidden');
            shadow.getElementById('repo-toggle').checked = false;
        } else if (currentScroll < lastScroll && host.classList.contains('nav-hidden')) {
            host.classList.remove('nav-hidden');
        }
        lastScroll = currentScroll;
    }, { passive: true });

    shadow.getElementById('unhide-tab').onclick = () => host.classList.remove('nav-hidden');

    // 3. CACHE & FETCH LOGIC
    const renderRepos = (repos) => {
        const container = shadow.getElementById('repo-content');
        if (!container) return;
        container.innerHTML = repos.map(repo => `
            <div class="card">
                <h3>${repo.isFork ? '⎇' : '📂'} ${repo.name}</h3>
                <div class="meta">
                    <span>${repo.lang}</span>
                    <span>${repo.updated}</span>
                </div>
                <p class="desc">${repo.desc || 'No description provided.'}</p>
                <div class="card-actions">
                    <a href="${repo.githubUrl}" class="btn-sm" target="_blank">REPO</a>
                    <a href="${repo.liveUrl}" class="btn-sm primary" target="_blank">>> OPEN</a>
                </div>
            </div>
        `).join('');
    };

    const processRepos = async () => {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            try {
                const { data, ts } = JSON.parse(cached);
                renderRepos(data);
                if (Date.now() - ts < CACHE_TTL) return; 
            } catch(e) { localStorage.removeItem(CACHE_KEY); }
        }

        try {
            const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=16`);
            const rawRepos = await res.json();

            const processedData = await Promise.all(rawRepos.map(async (repo) => {
                let liveUrl = repo.homepage || repo.html_url;
                
                if (repo.description?.includes('!header')) {
                    try {
                        const hRes = await fetch(`https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch}/header.json`);
                        if (hRes.ok) {
                            const config = await hRes.json();
                            const targetLink = config.links?.dev || config.links?.github;
                            if (targetLink && currentUrl.startsWith(targetLink)) {
                                if (config.rules?.theme === 'light') host.classList.add('theme-light');
                                if (config.rules?.autohideregex?.some(rx => new RegExp(rx).test(currentUrl))) {
                                    host.classList.add('nav-hidden');
                                    shadow.getElementById('unhide-tab').style.display = 'block';
                                }
                            }
                            if (targetLink) liveUrl = targetLink;
                        }
                    } catch (e) {}
                }

                return {
                    name: repo.name,
                    isFork: repo.fork,
                    lang: repo.language || 'txt',
                    updated: new Date(repo.updated_at).toLocaleDateString(),
                    desc: (repo.description || '').replace('!header', '').trim(),
                    githubUrl: repo.html_url,
                    liveUrl: liveUrl
                };
            }));

            renderRepos(processedData);
            localStorage.setItem(CACHE_KEY, JSON.stringify({ data: processedData, ts: Date.now() }));
        } catch (err) {
            const container = shadow.getElementById('repo-content');
            if (container) container.innerHTML = `<p style="grid-column: 1/-1; color: red; font-size: 12px;">Failed to load repositories.</p>`;
        }
    };

    document.addEventListener('click', (e) => {
        const toggle = shadow.getElementById('repo-toggle');
        if (toggle && toggle.checked && !host.contains(e.target)) {
            toggle.checked = false;
        }
    });

    processRepos();
})();
