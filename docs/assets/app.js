const ST={students:[], teachers:null};
const els={
  z:document.getElementById("count-Z"),
  h:document.getElementById("count-H"),
  t:document.getElementById("count-T"),
  viewTitle:document.getElementById("view-title"),
  viewContent:document.getElementById("view-content")
};

function gradeKey(clazz){
  if(!(clazz && typeof clazz==="string")) return null;
  const c = clazz.trim()[0];
  if(c==="ז") return "Z";
  if(c==="ח") return "H";
  if(c==="ט") return "T";
  return null;
}

function counts(){
  const c={Z:0,H:0,T:0};
  ST.students.forEach(s=>{
    const g=gradeKey(s.class);
    if(g&&c[g]!=null) c[g]++;
  });
  els.z.textContent=c.Z;
  els.h.textContent=c.H;
  els.t.textContent=c.T;
}

function renderLayer(layer){
  const names={Z:"שכבת ז׳",H:"שכבת ח׳",T:"שכבת ט׳"};
  els.viewTitle.textContent = names[layer]||"";
  const wrap=document.createElement("div");

  const tracks = (ST.teachers && ST.teachers[layer]) ? ST.teachers[layer] : [];
  if(tracks.length){
    const list=document.createElement("div");
    list.style.display="grid"; list.style.gap="8px"; list.style.margin="10px 0 14px";
    tracks.forEach(t=>{
      const btn=document.createElement("button");
      btn.className="layer-btn";
      const teacherLabel = Array.isArray(t.teachers) ? t.teachers.join(" + ") : (t.teachers||"");
      const count = ST.students.filter(s=>gradeKey(s.class)===layer && (s.track||"")===t.track).length;
      btn.innerHTML=`<span>${t.track} — ${teacherLabel}</span><small class="count">${count}</small>`;
      btn.onclick=()=>renderTrack(layer,t.track,teacherLabel);
      list.appendChild(btn);
    });
    wrap.appendChild(list);
  }

  const rows = ST.students.filter(s=>gradeKey(s.class)===layer);
  const table=document.createElement("table");
  table.className="table";
  table.innerHTML = `
    <thead><tr>
      <th>שם משפחה</th><th>שם פרטי</th><th>כיתה</th><th>הקבצה</th><th>מורה</th>
    </tr></thead>
    <tbody>${rows.map(s=>`
      <tr><td>${s.last_name||""}</td><td>${s.first_name||""}</td><td>${s.class||""}</td><td>${s.track||""}</td><td>${s.teacher||""}</td></tr>
    `).join("")}</tbody>`;
  els.viewContent.replaceChildren(wrap, table);
}

function renderTrack(layer,track,teacherLabel){
  els.viewTitle.textContent = `${({Z:"שכבת ז׳",H:"שכבת ח׳",T:"שכבת ט׳"})[layer]} — ${track}`;
  const rows = ST.students.filter(s=>gradeKey(s.class)===layer && (s.track||"")===(track||""));
  const info=document.createElement("div");
  info.style.margin="6px 0 10px";
  info.innerHTML = `<span class="count" style="padding:6px 10px;border-radius:999px;background:rgba(255,255,255,.12)">${rows.length} תלמידים — ${teacherLabel||""}</span>`;
  const table=document.createElement("table");
  table.className="table";
  table.innerHTML = `
    <thead><tr>
      <th>שם משפחה</th><th>שם פרטי</th><th>כיתה</th><th>מורה</th>
    </tr></thead>
    <tbody>${rows.map(s=>`
      <tr><td>${s.last_name||""}</td><td>${s.first_name||""}</td><td>${s.class||""}</td><td>${s.teacher||""}</td></tr>
    `).join("")}</tbody>`;
  const wrap=document.createElement("div");
  wrap.appendChild(info); wrap.appendChild(table);
  els.viewContent.replaceChildren(wrap);
}

async function load(){
  try{
    const sj = await fetch("data/students.json?ts="+Date.now()).then(r=>r.ok?r.json():{students:[]});
    ST.students = Array.isArray(sj.students)? sj.students : [];
    try{
      ST.teachers = await fetch("data/teachers.json?ts="+Date.now()).then(r=>r.ok?r.json():null);
    }catch(_){ ST.teachers=null; }
    counts();
    const selected = localStorage.getItem("lastLayer");
    if(selected && ["Z","H","T"].includes(selected)){
      renderLayer(selected);
    }
  }catch(e){ console.error(e); }
}

function wire(){
  document.querySelectorAll(".layer-btn").forEach(b=>{
    b.addEventListener("click", ()=>{
      const layer=b.getAttribute("data-layer");
      localStorage.setItem("lastLayer", layer);
      renderLayer(layer);
    });
  });
}

document.addEventListener("DOMContentLoaded", ()=>{ wire(); load(); setInterval(load, 5000); });
