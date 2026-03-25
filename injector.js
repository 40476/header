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
    #mega-nav-wrap { 
        all: initial; 
        font-family: ui-monospace, 'Cascadia Code', monospace; 
        display: block; 
        position: ${isLockedLayout ? 'absolute' : 'sticky'}; 
        top: 0; 
        left: 0;
        width: 100%; 
        z-index: 9999999; 
        background: #050505 !important; 
        color: #00ff00 !important; 
        border-bottom: 1px solid #222 !important;
        box-sizing: border-box !important;
    }
    #mega-nav-wrap * { box-sizing: border-box !important; }
    
    /* Specific selectors to override global CSS from other pages */
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
        color: #888 !important; 
        text-decoration: none !important; 
        padding: 10px 15px !important; 
        font-size: 13px !important; 
        transition: 0.2s !important; 
        cursor: pointer !important; 
        border: none !important; 
        background: none !important; 
        white-space: nowrap !important;
        display: inline-block !important;
        width: auto !important;
        line-height: normal !important;
        text-transform: none !important;
    }
    #mega-nav-wrap .mega-nav-item:hover { color: #00ff00 !important; text-shadow: 0 0 5px #00ff00 !important; }
    
    #repo-check, #mobile-check { display: none !important; }
    
    /* Dropdown Styles */
    #mega-nav-wrap .mega-drop {
        display: none; position: absolute; top: 50px; left: 0; width: 100%;
        background: #050505 !important; border-bottom: 2px solid #00ff00 !important; padding: 20px !important;
        box-sizing: border-box !important; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px;
        max-height: 80vh; overflow-y: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.8);
    }
    #mega-nav-wrap #repo-check:checked ~ .mega-drop { display: grid !important; }
    
    #mega-nav-wrap .repo-card { border: 1px solid #222 !important; padding: 12px !important; background: #0a0a0a !important; display: flex !important; flex-direction: column !important; justify-content: space-between !important; }
    #mega-nav-wrap .repo-card h3 { margin: 0 !important; font-size: 14px !important; color: #fff !important; font-family: inherit !important; font-weight: bold !important;}
    #mega-nav-wrap .repo-meta { font-size: 10px !important; color: #555 !important; margin: 5px 0 !important; display: flex !important; gap: 8px !important; align-items: center !important; }
    #mega-nav-wrap .badge-fork { color: #ffaa00 !important; border: 1px solid #ffaa00 !important; padding: 1px 4px !important; border-radius: 3px !important; font-size: 9px !important; }

    /* Mobile Menu Toggle */
    #mega-nav-wrap .mobile-label { display: none; font-size: 20px; color: #00ff00 !important; padding: 10px; cursor: pointer; }

    /* Shift main content down if not a locked layout */
    ${!isLockedLayout ? 'body { padding-top: 0 !important; }' : ''}

    @media (max-width: 768px) {
        #mega-nav-wrap .mobile-label { display: block !important; }
        #mega-nav-wrap .nav-inner { height: auto !important; flex-direction: column !important; align-items: flex-start !important; display: none !important; padding-bottom: 10px !important; }
        #mega-nav-wrap #mobile-check:checked ~ .nav-inner { display: flex !important; }
        #mega-nav-wrap .mega-nav-item { width: 100% !important; box-sizing: border-box !important; border-bottom: 1px solid #111 !important; }
        #mega-nav-wrap .mega-drop { position: relative !important; top: 0 !important; width: 100% !important; margin-left: 0 !important; }
    }
    `;

    const html = `
    <div id="mega-nav-wrap">
        <style>${style}</style>
        <input type="checkbox" id="mobile-check">
        <label for="mobile-check" class="mobile-label">☰ [ MENU ]</label>
        <nav class="nav-inner">
            <a class="mega-nav-item" href="${baseHome}">[ HOME ]</a>
            <a class="mega-nav-item" href="${baseGizmos}">[ GIZMOS ]</a>
            <div style="display: contents;">
                <input type="checkbox" id="repo-check">
                <label for="repo-check" class="mega-nav-item">/REPOSITORIES/ ▾</label>
                <div class="mega-drop" id="repo-inject">
                    <p style="padding: 20px; color: #444;">Accessing GitHub API...</p>
                </div>
            </div>
            <a class="mega-nav-item" href="https://matrix.to/#/@usr_40476:4d2.org" target="_blank">@MATRIX</a>
            <a class="mega-nav-item" href="${baseHome}?page=links_and_contact">CONTACT</a>
        </nav>
    </div>
    `;

    document.body.insertAdjacentHTML('afterbegin', html);

    // Fetch Repos with Fork Detection and !link logic
    try {
        const r = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=15`);
        const data = await r.json();
        const container = document.getElementById('repo-inject');
        
        const repoItems = await Promise.all(data.map(async repo => {
            let finalLink = repo.html_url;

            // !link Logic
            if (repo.description && repo.description.includes('!link')) {
                try {
                    const lReq = await fetch(`https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch}/.links`);
                    if (lReq.ok) {
                        const lText = await lReq.text();
                        const lines = lText.split('\n').map(s => s.trim()).filter(s => s.length > 0);
                        const lMap = {};
                        
                        lines.forEach(line => {
                            if (line.includes(':') && !line.startsWith('http')) {
                                const [k, v] = line.split(':').map(s => s.trim());
                                if (k && v) lMap[k.toLowerCase()] = v;
                            } else {
                                // Fallback for simple list of URLs in .links
                                if (line.includes('usr40k.dev')) lMap['dev'] = line;
                                else if (line.includes('github.io')) lMap['github'] = line;
                            }
                        });

                        // Choose based on current environment
                        if (isPrimary && lMap['dev']) {
                            finalLink = lMap['dev'];
                        } else if (!isPrimary && lMap['github']) {
                            finalLink = lMap['github'];
                        } else if (lMap['dev'] || lMap['github']) {
                            // Absolute fallback if one is missing
                            finalLink = lMap['dev'] || lMap['github'];
                        }
                    }
                } catch(e) {}
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
                    <p style="font-size: 11px; color: #666; margin: 0; font-family: inherit;">${repo.description || ''}</p>
                </div>
                <div style="text-align: right; margin-top: 10px;">
                    <a href="${repo.html_url}" target="_blank" class="mega-nav-item" style="padding:0 !important; font-size:10px !important; color: #444 !important; margin-right: 10px !important; display: inline-block !important;">REPO</a>
                    <a href="${finalLink}" target="_blank" class="mega-nav-item" style="padding:0 !important; font-size:11px !important; color: #00ff00 !important; font-weight: bold !important; display: inline-block !important;">>> OPEN</a>
                </div>
            </div>`;
        }));

        container.innerHTML = repoItems.join('');
    } catch(e) {
        document.getElementById('repo-inject').innerHTML = "<p style='padding:20px; color:red;'>Error connecting to GitHub.</p>";
    }
})();
