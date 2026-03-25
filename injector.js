(async function() {
    const GITHUB_USERNAME = '40476';
    const isPrimary = window.location.hostname.includes('usr40k.dev');

    // Link resolution based on environment
    const baseHome = isPrimary ? 'https://usr40k.dev/' : 'https://40476.github.io/40476/';
    const baseGizmos = isPrimary ? 'https://gizmos.usr40k.dev/' : 'https://40476.github.io/web-gizmos/';

    const style = `
    #mega-nav-wrap { all: initial; font-family: ui-monospace, 'Cascadia Code', monospace; display: block; position: sticky; top: 0; width: 100%; z-index: 99999; background: #050505; color: #00ff00; border-bottom: 1px solid #222; }
    .nav-inner { display: flex; align-items: center; max-width: 1200px; margin: 0 auto; height: 50px; padding: 0 15px; position: relative; }
    .nav-item { color: #888; text-decoration: none; padding: 10px 15px; font-size: 13px; transition: 0.2s; cursor: pointer; border: none; background: none; white-space: nowrap; }
    .nav-item:hover { color: #00ff00; text-shadow: 0 0 5px #00ff00; }
    
    #repo-check, #mobile-check { display: none; }
    
    /* Dropdown Styles */
    .mega-drop {
        display: none; position: absolute; top: 50px; left: 0; width: 100%;
        background: #050505; border-bottom: 2px solid #00ff00; padding: 20px;
        box-sizing: border-box; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px;
        max-height: 80vh; overflow-y: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.8);
    }
    #repo-check:checked ~ .mega-drop { display: grid; }
    
    .repo-card { border: 1px solid #222; padding: 12px; background: #0a0a0a; display: flex; flex-direction: column; justify-content: space-between; }
    .repo-card h3 { margin: 0; font-size: 14px; color: #fff; }
    .repo-meta { font-size: 10px; color: #555; margin: 5px 0; display: flex; gap: 8px; align-items: center; }
    .badge-fork { color: #ffaa00; border: 1px solid #ffaa00; padding: 1px 4px; border-radius: 3px; font-size: 9px; }

    /* Mobile Menu Toggle */
    .mobile-label { display: none; font-size: 20px; color: #00ff00; padding: 10px; cursor: pointer; }

    @media (max-width: 768px) {
        .mobile-label { display: block; }
        .nav-inner { height: auto; flex-direction: column; align-items: flex-start; display: none; padding-bottom: 10px; }
        #mobile-check:checked ~ .nav-inner { display: flex; }
        .nav-item { width: 100%; box-sizing: border-box; border-bottom: 1px solid #111; }
        .mega-drop { position: relative; top: 0; width: 100vw; margin-left: -15px; }
    }
    `;

    const html = `
    <div id="mega-nav-wrap">
        <style>${style}</style>
        <input type="checkbox" id="mobile-check">
        <label for="mobile-check" class="mobile-label">☰ [ MENU ]</label>
        <nav class="nav-inner">
            <a class="nav-item" href="${baseHome}">[ HOME ]</a>
            <a class="nav-item" href="${baseGizmos}">[ GIZMOS ]</a>
            <div style="display: contents;">
                <input type="checkbox" id="repo-check">
                <label for="repo-check" class="nav-item">/REPOSITORIES/ ▾</label>
                <div class="mega-drop" id="repo-inject">
                    <p style="padding: 20px; color: #444;">Accessing GitHub API...</p>
                </div>
            </div>
            <a class="nav-item" href="https://matrix.to/#/@usr_40476:4d2.org" target="_blank">@MATRIX</a>
            <a class="nav-item" href="${baseHome}?page=links_and_contact">CONTACT</a>
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
                        const lMap = {};
                        lText.split('\n').forEach(line => {
                            const [k, v] = line.split(':').map(s => s.trim());
                            if (k && v) lMap[k.toLowerCase()] = v;
                        });
                        if (isPrimary && lMap['dev']) finalLink = lMap['dev'];
                        else if (!isPrimary && lMap['github']) finalLink = lMap['github'];
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
                    <p style="font-size: 11px; color: #666;">${repo.description || ''}</p>
                </div>
                <a href="${finalLink}" target="_blank" class="nav-item" style="padding:5px 0 0 0; font-size:11px; text-align:right; display:block;">>> OPEN</a>
            </div>`;
        }));

        container.innerHTML = repoItems.join('');
    } catch(e) {
        document.getElementById('repo-inject').innerHTML = "<p style='padding:20px; color:red;'>Error connecting to GitHub.</p>";
    }
})();
