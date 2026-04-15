(async function() {
    const GITHUB_USERNAME = '40476';
    const CACHE_KEY = `mega_nav_cache_${GITHUB_USERNAME}`;
    const CACHE_TTL = 5 * 60 * 1000; // 1 hour
    
    const isPrimary = window.location.hostname.includes('usr40k.dev');
    const baseHome = isPrimary ? 'https://usr40k.dev/' : 'https://40476.github.io/40476/';
    const baseGizmos = isPrimary ? 'https://gizmos.usr40k.dev/' : 'https://40476.github.io/web-gizmos/';
    const currentUrl = window.location.href;

    // 1. CREATE SHADOW HOST
    const host = document.createElement('div');
    host.id = 'mega-nav-feature';
    document.documentElement.appendChild(host);
    const shadow = host.attachShadow({ mode: 'open' });

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
        }

        nav {
            display: flex;
            gap: 10px;
            align-items: center;
            max-width: 1200px;
            width: 100%;
        }

        .item {
            color: var(--nav-link);
            text-decoration: none;
            font-size: 13px;
            padding: 8px 12px;
            transition: all 0.2s;
            cursor: pointer;
            white-space: nowrap;
            border: none;
            background: none;
        }

        .item:hover, .item.active {
            color: var(--nav-text);
            text-shadow: 0 0 8px var(--nav-text);
        }

        /* Dropdown Logic */
        .dropdown-trigger { position: relative; display: flex; align-items: center; }
        #repo-toggle { display: none; }
        .mega-drop {
            position: absolute;
            top: var(--nav-height);
            left: 50%;
            transform: translateX(-50%) translateY(10px);
            width: 90vw;
            max-width: 1000px;
            background: var(--nav-bg);
            border: 1px solid var(--nav-border);
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            padding: 20px;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 15px;
            opacity: 0;
            visibility: hidden;
            transition: all 0.2s ease;
            max-height: 80vh;
            overflow-y: auto;
        }

        #repo-toggle:checked ~ .mega-drop {
            opacity: 1;
            visibility: visible;
            transform: translateX(-50%) translateY(0);
        }

        /* Repo Cards */
        .card {
            background: var(--nav-card);
            border: 1px solid var(--nav-border);
            padding: 15px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .card h3 { margin: 0; font-size: 14px; color: var(--nav-heading); }
        .meta { font-size: 10px; color: var(--nav-meta); display: flex; gap: 10px; }
        .desc { font-size: 11px; color: var(--nav-link); line-height: 1.4; }
        .card-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: auto; padding-top: 10px;}
        
        .btn-sm { font-size: 10px; text-decoration: none; color: var(--nav-link); }
        .btn-sm.primary { color: var(--nav-text); font-weight: bold; }

        /* Scroll Unhide Indicator */
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
        }

        @media (max-width: 768px) {
            nav { overflow-x: auto; padding-bottom: 5px; }
            .mega-drop { width: 100vw; left: 0; transform: translateY(10px); }
            #repo-toggle:checked ~ .mega-drop { transform: translateY(0); }
        }

        /* Skeleton Animation */
        .skeleton { height: 100px; background: var(--nav-border); opacity: 0.5; animation: pulse 1.5s infinite; }
        @keyframes pulse { 50% { opacity: 0.2; } }
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
        container.innerHTML = repos.map(repo => `
            <div class="card">
                <h3>${repo.isFork ? '⎇' : '📂'} ${repo.name}</h3>
                <div class="meta">
                    <span>${repo.lang}</span>
                    <span>${repo.updated}</span>
                </div>
                <p class="desc">${repo.desc}</p>
                <div class="card-actions">
                    <a href="${repo.githubUrl}" class="btn-sm" target="_blank">REPO</a>
                    <a href="${repo.liveUrl}" class="btn-sm primary" target="_blank">>> OPEN</a>
                </div>
            </div>
        `).join('');
    };

    const processRepos = async () => {
        // Try Cache First
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const { data, ts } = JSON.parse(cached);
            renderRepos(data);
            if (Date.now() - ts < CACHE_TTL) return; // Cache is fresh
        }

        try {
            const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=15`);
            const rawRepos = await res.json();

            // Parallel fetching of headers
            const processedData = await Promise.all(rawRepos.map(async (repo) => {
                let liveUrl = repo.homepage || repo.html_url;
                
                // Check for !header flag
                if (repo.description?.includes('!header')) {
                    try {
                        const hRes = await fetch(`https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch}/header.json`);
                        if (hRes.ok) {
                            const config = await hRes.json();
                            // Apply custom theme/autohide rules if we are currently ON this repo's page
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
                    } catch (e) { /* silent fail for individual headers */ }
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
            console.error("MegaNav fetch failed", err);
        }
    };

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!host.contains(e.target)) shadow.getElementById('repo-toggle').checked = false;
    });

    processRepos();
})();
