["https://header.usr40k.dev/injector.js","https://40476.github.io/header/injector.js"].reduce((p,u)=>p.catch(()=>fetch(u,{method:'HEAD'}).then(r=>r.ok?import(u):Promise.reject())),Promise.reject());
