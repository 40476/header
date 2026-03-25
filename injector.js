// injector.js
(async function() {
    const GITHUB_USERNAME = '40476';
    const isPrimary = window.location.hostname.includes('usr40k.dev');

    // Auto-select links based on where we are or what's preferred
    const baseHome = isPrimary ? 'https://usr40k.dev/' : 'https://40476.github.io/40476/';
    const baseGizmos = isPrimary ? 'https://gizmos.usr40k.dev/' : 'https://40476.github.io/web-gizmos/';

    const style = `
    #mega-nav-wrap { all: initial; font-family: ui-monospace, 'Cascadia Code', monospace; display: block; position: sticky; top: 0; width: 100%; z-index: 99999; background: #050505; color: #00ff00; border-bottom: 1px solid #222; }
    .nav-inner { display: flex; align-items: center; max-width: 1200px; margin: 0 auto; height: 50px; padding: 0 20px; }
    .nav-item { color: #888; text-decoration: none; padding: 10px 15px; font-size: 13px; transition: 0.2s; cursor: pointer; border: none; background: none; }
    .nav-item:hover { color: #00ff00; text-shadow: 0 0 5px #00ff00; }
    #repo-check { display: none; }
    .mega-drop {
        display: none; position: absolute; top: 50px; left: 0; width: 100%;
        background: #050505; border-bottom: 2px solid #00ff00; padding: 20px;
        box-sizing: border-box; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px;
        max-height: 80vh; overflow-y: auto;
    }
    #repo-check:checked ~ .mega-drop { display: grid; }
    .repo-card { border: 1px solid #222; padding: 10px; background: #0a0a0a; }
    .repo-card h3 { margin: 0; font-size: 14px; color: #fff; }
    .repo-meta { font-size: 10px; color: #555; margin: 5px 0; }
    `;

    const html = `
    <div id="mega-nav-wrap">
    <style>${style}</style>
    <nav class="nav-inner">
    <a class="nav-item" href="${baseHome}">[ HOME ]</a>
    <a class="nav-item" href="${baseGizmos}">[ GIZMOS ]</a>
    <div style="position: relative;">
    <input type="checkbox" id="repo-check">
    <label for="repo-check" class="nav-item">/REPOSITORIES/ ▾</label>
    <div class="mega-drop" id="repo-inject">
    <p>Accessing GitHub API...</p>
    </div>
    </div>
    <a class="nav-item" href="matrix:r/usr_40476:4d2.org">@MATRIX</a>
    <a class="nav-item" href="${baseHome}?page=links_and_contact">CONTACT</a>
    </nav>
    </div>
    `;

    document.body.insertAdjacentHTML('afterbegin', html);

    // Fetch Repos
    try {
        const r = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=15`);
        const data = await r.json();
        const container = document.getElementById('repo-inject');
        container.innerHTML = data.map(repo => `
        <div class="repo-card">
        <h3>${repo.fork ? '🍴' : '📂'} ${repo.name}</h3>
        <div class="repo-meta">UPDATED: ${new Date(repo.updated_at).toLocaleDateString()} | ${repo.language || 'N/A'}</div>
        <p style="font-size: 12px; color: #777;">${repo.description || ''}</p>
        <a href="${repo.html_url}" target="_blank" class="nav-item" style="padding:0; font-size:11px;">>> VIEW_SOURCE</a>
        </div>
        `).join('');
    } catch(e) {
        document.getElementById('repo-inject').innerHTML = "Failed to load repository manifest.";
    }
})();
