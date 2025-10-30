const API_BASE = "https://raw.githubusercontent.com/yanivmizrachiy/smart-grades-hub-yaniv-raz/main/data";
const POLL_MS = 5000;

async function fetchJSON(name){
  const r = await fetch(`${API_BASE}/${name}?t=${Date.now()}`);
  if(!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
function byLetter(letter){ return s => (s.class||"").trim().startsWith(letter); }
function el(tag, attrs={}, kids=[]){ const e=document.createElement(tag); Object.assign(e,attrs); for(const k of kids) e.appendChild(typeof k==="string"?document.createTextNode(k):k); return e; }

async function loadStudents(){ const s = await fetchJSON("students.json").catch(()=>({students:[]})); return s.students||[]; }
function refreshCounts(students){
  const z=students.filter(byLetter("ז")).length;
  const h=students.filter(byLetter("ח")).length;
  const t=students.filter(byLetter("ט")).length;
  const Z=document.getElementById("count-Z"); if(Z) Z.textContent=`${z} תלמידים`;
  const H=document.getElementById("count-H"); if(H) H.textContent=`${h} תלמידים`;
  const T=document.getElementById("count-T"); if(T) T.textContent=`${t} תלמידים`;
}

async function render(){
  try{
    const students = await loadStudents();
    refreshCounts(students);

    const view = document.getElementById("view"); if(!view) return;
    view.innerHTML = "";

    const m = location.hash.match(/^#\/layer\/(Z|H|T)(?:\/track\/(.+))?$/);
    if(!m){
      view.appendChild(el("div",{},[
        el("div",{className:"sub",textContent:"בחר שכבה כדי לצפות בהקבצות ובמורים."})
      ]));
      return;
    }

    const L = m[1]; const track = m[2] ? decodeURIComponent(m[2]) : null;
    const letter = (L==="Z"?"ז":L==="H"?"ח":"ט");
    const layerStudents = students.filter(byLetter(letter));

    if(!track){
      const groups={};
      for(const st of layerStudents){
        const tname=(st.track||"לא משויך");
        if(!groups[tname]) groups[tname]={ teacher: st.math_teacher||"", list: [] };
        groups[tname].list.push(st);
        if(!groups[tname].teacher && st.math_teacher) groups[tname].teacher = st.math_teacher;
      }
      view.appendChild(el("h2",{textContent:`שכבת ${letter}`}));
      for(const [tname,info] of Object.entries(groups)){
        const btn = el("a",{href:`#/layer/${L}/track/${encodeURIComponent(tname)}`,className:"btn",textContent:tname});
        const meta= el("div",{className:"count",textContent:`מורה: ${info.teacher||"—"} | תלמידים: ${info.list.length}`});
        view.appendChild(el("div",{className:"layer"},[btn,meta]));
      }
      view.appendChild(el("div",{},[el("a",{href:"#/","className":"back",textContent:"⬅ חזרה"})]));
      return;
    }

    const list = layerStudents.filter(st => (st.track||"")===track);
    view.appendChild(el("h2",{textContent:`שכבת ${letter} — ${track}`}));
    const table = el("table",{},[
      el("thead",{},[ el("tr",{},[
        el("th",{textContent:"שם פרטי"}),
        el("th",{textContent:"שם משפחה"}),
        el("th",{textContent:"כיתה"}),
        el("th",{textContent:"הקבצה"}),
        el("th",{textContent:"מורה"})
      ]) ]),
      el("tbody",{id:"rows"},[])
    ]);
    view.appendChild(table);
    const tbody = table.querySelector("#rows");
    for(const st of list){
      tbody.appendChild(el("tr",{},[
        el("td",{textContent:st.first_name||""}),
        el("td",{textContent:st.last_name||""}),
        el("td",{textContent:st.class||""}),
        el("td",{textContent:st.track||""}),
        el("td",{textContent:st.math_teacher||""})
      ]));
    }
    view.appendChild(el("div",{},[ el("a",{href:`#/layer/${L}`,"className":"back",textContent:"⬅ חזרה לשכבה"}) ]));
  }catch(e){
    const v=document.getElementById("view");
    if(v) v.innerHTML = `<div class="err">שגיאת טעינה: ${e}</div>`;
  }
}

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", ()=>{ render(); setInterval(render,POLL_MS); });
