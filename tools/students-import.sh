#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail
REPO="yanivmizrachiy/smart-grades-hub-yaniv-raz"
DIR="$(git rev-parse --show-toplevel)"
RAW="$DIR/tools/students-raw.tsv"
OUT1="$DIR/data/students.json"
OUT2="$DIR/docs/data/students.json"

echo "📝 הדבק עכשיו את הטבלה (עמודות מופרדות בטאב) וסיים עם CTRL+D:"
cat > "$RAW"

# המרה ל-JSON בעזרת Python — עמיד לאותיות בעברית ולתווים בעייתיים
/usr/bin/env python << "PY"
import os, json, datetime
DIR=os.popen("git rev-parse --show-toplevel").read().strip()
raw_path=os.path.join(DIR,"tools","students-raw.tsv")
with open(raw_path,"r",encoding="utf-8",errors="ignore") as f:
    lines=[l.rstrip("\n") for l in f if l.strip()]

students=[]
for line in lines:
    parts=line.split("\t")
    if len(parts)<3: continue
    # דלג על שורת כותרות
    if ("שם משפחה" in parts[0]) or ("שם פרטי" in parts[1]) or ("כיתה" in parts[2]): 
        continue
    last=parts[0].strip()
    first=parts[1].strip()
    clazz=parts[2].strip()
    track=parts[3].strip() if len(parts)>3 else ""
    teacher=parts[4].strip() if len(parts)>4 else ""
    students.append({
        "last_name": last,
        "first_name": first,
        "class": clazz,
        "track": track,
        "teacher": teacher
    })

data={
    "version": 1,
    "updated_at": datetime.datetime.utcnow().isoformat()+"Z",
    "students": students
}

for rel in [("data","students.json"),("docs/data","students.json")]:
    p=os.path.join(DIR,*rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p,"w",encoding="utf-8") as w:
        json.dump(data,w,ensure_ascii=False,indent=2)

print(f"Wrote {len(students)} students")
PY

# קומיט/פוש/בנייה
git add "$OUT1" "$OUT2"
git commit -m "feat(data): import students from TSV (real data)" || true
git push origin main
gh api -X POST "repos/$REPO/pages/builds" >/dev/null || true
echo "⏳ מחכה 30 שניות לפריסה…"; sleep 30
URL="https://yanivmizrachiy.github.io/smart-grades-hub-yaniv-raz/"
CODE=$(curl -s -o /tmp/sgh.html -w "%{http_code}" "$URL"); echo "🌐 HTTP $CODE"
echo "🔗 $URL"
