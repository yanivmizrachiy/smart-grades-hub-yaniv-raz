const API_BASE = "../data";

async function getJSON(p){ const r=await fetch(`${API_BASE}/${p}?t=${Date.now()}`); if(!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }
function byLayer(letter){ return s => (s.class||'').trim().startsWith(letter); }
function countLayer(students, letter){ return students.filter(byLayer(letter)).length; }
function el(tag, attrs={}, kids=[]){ const e=document.createElement(tag); Object.assign(e, attrs); for(const k of kids) e.appendChild(typeof k==='string'?document.createTextNode(k):k); return e; }

async function render(){
  try{
    const students = await getJSON("students.json").then(x=>x.students||[]);
    const set = (id, val) => { const n=document.getElementById(id); if(n) n.textContent = `${val} תלמידים`; };

    set("count-Z", countLayer(students,"ז"));
    set("count-H", countLayer(students,"ח"));
    set("count-T", countLayer(students,"ט"));

    const view = document.getElementById("view");
    if(!view) return;

    const hash = location.hash || "#/";
    view.innerHTML = "";

    if(hash === "#/" || hash === ""){
      view.appendChild(el("div",{},["בחר שכבה כדי להמשיך"]));
      return;
    }

    const m = hash.match(/^#\/layer\/([ZHT])(?:\/track\/(.+))?$/);
    if(!m){ view.appendChild(el("div",{},[el("a",{href:"#/","className":"back",textContent:"⬅ חזרה לדף הראשי"})])); return; }

    const L = m[1]; const track = m[2] ? decodeURIComponent(m[2]) : null;
    const letter = (L==="Z" ? "ז" : L==="H" ? "ח" : "ט");
    const layerStudents = students.filter(byLayer(letter));

    if(!track){
      const groups = {};
      for(const st of layerStudents){
        const tname = (st.track||"לא משויך");
        if(!groups[tname]) groups[tname] = { teacher: st.math_teacher||"", list: [] };
        groups[tname].list.push(st);
        if(!groups[tname].teacher && st.math_teacher) groups[tname].teacher = st.math_teacher;
      }
      view.appendChild(el("h2",{textContent:`שכבת ${letter}`}));
      for(const [tname,info] of Object.entries(groups)){
        const btn = el("a",{href:`#/layer/${L}/track/${encodeURIComponent(tname)}`, className:"btn", textContent:tname});
        const meta = el("div",{className:"count", textContent:`מורה: ${info.teacher||"—"} | תלמידים: ${info.list.length}`});
        view.appendChild(el("div",{className:"layer"},[btn, meta]));
      }
      view.appendChild(el("div",{},[ el("a",{href:"#/","className":"back",textContent:"⬅ חזרה"}) ]));
      return;
    }

    const list = layerStudents.filter(st => (st.track||"") === track);
    view.appendChild(el("h2",{textContent:`שכבת ${letter} — ${track}`}));

    const table = el("table",{},[
      el("thead",{},[ el("tr",{},[
        el("th",{textContent:"שם פרטי"}), el("th",{textContent:"שם משפחה"}),
        el("th",{textContent:"כיתה"}), el("th",{textContent:"הקבצה"}), el("th",{textContent:"מורה"})
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
    const v=document.getElementById("view"); if(v) v.innerHTML = `<div class="card">שגיאת טעינה: ${e}</div>`;
  }
}

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", ()=>{ render(); setInterval(render, 5000); });
