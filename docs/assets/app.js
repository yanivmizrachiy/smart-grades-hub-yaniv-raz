const API={data:'./data',status:'./.status'},POLL=3000,$=s=>document.querySelector(s);
async function j(u){const r=await fetch(u+`?t=${Date.now()}`);if(!r.ok)throw new Error(r.status);return r.json();}
function L(c){if(/^ז/.test(c))return'Z';if(/^ח/.test(c))return'H';if(/^ט/.test(c))return'T';return'';}
function label(L){return L==='Z'?'שכבת ז׳':L==='H'?'שכבת ח׳':L==='T'?'שכבת ט׳':'';}
function norm(t=''){t=t.trim().replace(/['`]/g,'׳').replace(/\s*-\s*/g,'-');if(/^א[׳']?\s*1$/.test(t))return'א׳-1';if(/^א[׳']?$/.test(t))return'א׳';if(/^מקדמת/.test(t))return'מקדמת';if(/^מדעית/.test(t))return'מדעית';return t||'ללא הקבצה';}
let ST={students:[]}, PROG={percent:0,stage:''};

function progress(p){const pct=Math.max(0,Math.min(100,Number((p||{}).percent||0)));const bar=$('#progressfill'),txt=$('#progresstext');if(bar)bar.style.width=pct+'%';if(txt)txt.textContent=`התקדמות: ${pct}% — ${(p||{}).stage||''}`;}
function counts(){const c={Z:0,H:0,T:0};for(const s of ST.students){const l=L(s.class||'');if(l)c[l]++;}['Z','H','T'].forEach(k=>{const el=$('#cnt'+k);if(el)el.textContent=`👥 ${c[k]} תלמידים`;});}
function crumbs(p){const el=$('#crumbs');if(!el)return;const a=[`<a href="#/">דף הבית</a>`];if(p.layer)a.push(`<a href="#/layer/${p.layer}">${label(p.layer)}</a>`);if(p.track)a.push(`<span>הקבצה ${p.track}</span>`);el.innerHTML=a.join(' › ');}

function route(){const seg=(location.hash||'#/').replace(/^#/,'').split('/').filter(Boolean);
  if(seg.length===0){$('#view').innerHTML='';crumbs({});counts();return;}
  if(seg[0]==='layer'){const Lr=seg[1];if(seg[2]==='track'&&seg[3])return renderTrack(Lr,decodeURIComponent(seg[3]));return renderLayer(Lr);}
  $('#view').innerHTML='';crumbs({});counts();
}
function renderLayer(Lr){crumbs({layer:Lr});const v=$('#view');const arr=ST.students.filter(s=>L(s.class||'')===Lr);const by=new Map();
  for(const s of arr){const t=norm(s.track||'');if(!by.has(t))by.set(t,[]);by.get(t).push(s);}
  const cards=[...by.entries()].map(([t,a])=>{const teachers=[...new Set(a.map(x=>x.math_teacher).filter(Boolean))];
    return `<a class="bigbtn" href="#/layer/${Lr}/track/${encodeURIComponent(t)}">הקבצה ${t}<span class="muted">מורה: ${teachers.join(', ')||'—'} · 👥 ${a.length}</span></a>`}).join('');
  v.innerHTML=`<div class="card"><div class="view-title">${label(Lr)}</div><div class="grid2">${cards||'<span class="muted">אין תלמידים</span>'}</div></div>`;
}
function renderTrack(Lr,t){crumbs({layer:Lr,track:t});const v=$('#view');const arr=ST.students.filter(s=>L(s.class||'')===Lr&&norm(s.track||'')===t);
  const rows=arr.map(s=>`<tr><td>${(s.first_name||'')+' '+(s.last_name||'')}</td><td>${s.class||''}</td><td>${s.track||''}</td><td>${s.math_teacher||''}</td><td>${(s.notes||[]).map(n=>`${n.date||''} — ${n.text||''}`).join('<br>')||'—'}</td></tr>`).join('');
  v.innerHTML=`<div class="card"><div class="view-title">${label(Lr)} — הקבצה ${t}</div><table><thead><tr><th>תלמיד</th><th>כיתה</th><th>הקבצה</th><th>מורה</th><th>הערות</th></tr></thead><tbody>${rows||'<tr><td colspan="5">אין תלמידים</td></tr>'}</tbody></table></div>`;
}

async function load(){
  try{
    const sj=await j(`${API.data}/students.json`).catch(()=>({students:[]}));
    const pj=await j(`${API.status}/progress.json`).catch(()=>({percent:0,stage:''}));
    ST.students=Array.isArray(sj.students)?sj.students:[]; PROG=pj; progress(PROG); counts(); route();
  }catch(e){console.error(e);}
}
addEventListener('DOMContentLoaded',()=>{route();load();setInterval(load,3000);});
addEventListener('hashchange',route);
