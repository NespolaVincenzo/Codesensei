import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════ DATA ═══════════════════

const LANGUAGES = [
  { id: "python", name: "Python", icon: "🐍", color: "#3572A5", desc: "Polyvalent, IA, data science" },
  { id: "javascript", name: "JavaScript", icon: "⚡", color: "#F7DF1E", desc: "Web, fullstack, dynamique" },
  { id: "typescript", name: "TypeScript", icon: "🔷", color: "#3178C6", desc: "JS typé, robuste, scalable" },
  { id: "c", name: "C", icon: "⚙️", color: "#555555", desc: "Bas niveau, systèmes, performance" },
  { id: "cpp", name: "C++", icon: "🔧", color: "#00599C", desc: "Systèmes, jeux, haute perf" },
  { id: "csharp", name: "C#", icon: "💜", color: "#68217A", desc: "Unity, .NET, enterprise" },
  { id: "java", name: "Java", icon: "☕", color: "#B07219", desc: "Enterprise, Android, robuste" },
  { id: "lua", name: "Lua/Luau", icon: "🌙", color: "#000080", desc: "Roblox, scripting, léger" },
  { id: "html_css", name: "HTML/CSS", icon: "🎨", color: "#E34F26", desc: "Structure et style du web" },
  { id: "sql", name: "SQL", icon: "🗃️", color: "#336791", desc: "Bases de données, requêtes" },
  { id: "rust", name: "Rust", icon: "🦀", color: "#DEA584", desc: "Sécurité mémoire, systèmes" },
  { id: "go", name: "Go", icon: "🐹", color: "#00ADD8", desc: "Concurrence, cloud, simple" },
  { id: "kotlin", name: "Kotlin", icon: "🟣", color: "#7F52FF", desc: "Android moderne, concis" },
];
const LEVELS = ["Débutant", "Intermédiaire", "Avancé"];
const COURSE = {};
const pyJs = {
  python: [
    { ch:1,title:"Variables et types",topics:["int, float, str, bool","Affectation et nommage","Conversion de types","Input utilisateur"]},
    { ch:2,title:"Conditions",topics:["if / elif / else","Opérateurs de comparaison","Opérateurs logiques","Conditions imbriquées"]},
    { ch:3,title:"Boucles",topics:["for et range()","while","break et continue","Boucles imbriquées"]},
    { ch:4,title:"Fonctions",topics:["Définir une fonction","Paramètres et retour","Portée des variables","Fonctions lambda"]},
    { ch:5,title:"Structures de données",topics:["Listes","Dictionnaires","Tuples et sets","Compréhensions de listes"]},
    { ch:6,title:"POO",topics:["Classes et objets","Héritage","Encapsulation","Méthodes spéciales"]},
  ],
  javascript: [
    { ch:1,title:"Bases JS",topics:["Variables let/const/var","Types primitifs","Opérateurs","Console et alert"]},
    { ch:2,title:"Fonctions",topics:["Déclaration","Arrow functions","Callbacks","Closures"]},
    { ch:3,title:"DOM",topics:["Sélecteurs","Événements","Manipulation du DOM","Formulaires"]},
    { ch:4,title:"Asynchrone",topics:["Callbacks","Promises","async/await","Fetch API"]},
    { ch:5,title:"Objets & Classes",topics:["Objets littéraux","Prototypes","Classes ES6","Modules"]},
    { ch:6,title:"JS Moderne",topics:["Destructuring","Spread/Rest","Map/Set","Iterators"]},
  ],
};
Object.assign(COURSE, pyJs);
LANGUAGES.forEach(l => {
  if (!COURSE[l.id]) COURSE[l.id] = [
    { ch:1,title:"Introduction",topics:["Syntaxe de base","Variables et types","Entrée/Sortie","Premiers programmes"]},
    { ch:2,title:"Contrôle de flux",topics:["Conditions","Boucles","Switch/Match","Gestion d'erreurs"]},
    { ch:3,title:"Fonctions",topics:["Déclaration","Paramètres","Retour de valeurs","Récursion"]},
    { ch:4,title:"Structures de données",topics:["Tableaux/Listes","Dictionnaires/Maps","Ensembles","Chaînes"]},
    { ch:5,title:"POO / Modules",topics:["Classes","Héritage","Interfaces","Organisation du code"]},
    { ch:6,title:"Concepts avancés",topics:["Gestion mémoire","Concurrence","Patterns courants","Projet final"]},
  ];
});

// ═══════════════════ STORAGE ═══════════════════

const store = {
  async get(k, fb) { try { const r = await window.storage.get(k); return r ? JSON.parse(r.value) : fb; } catch { return fb; } },
  async set(k, v) { try { await window.storage.set(k, JSON.stringify(v)); } catch {} },
};

// ═══════════════════ SYNTAX HIGHLIGHTING ═══════════════════

const SYN = {
  python:{kw:["def","class","if","elif","else","for","while","return","import","from","as","try","except","finally","with","yield","raise","pass","break","continue","and","or","not","in","is","lambda","global","assert","del","True","False","None","async","await","print"],ty:["int","float","str","bool","list","dict","tuple","set","bytes","range","type","object"],cm:"#"},
  javascript:{kw:["const","let","var","function","return","if","else","for","while","do","switch","case","break","continue","new","this","class","extends","import","export","from","default","try","catch","finally","throw","async","await","typeof","instanceof","of","in","true","false","null","undefined","console","log"],ty:["Array","Object","String","Number","Boolean","Map","Set","Promise","Date","Error"],cm:"//"},
  typescript:{kw:["const","let","var","function","return","if","else","for","while","do","switch","case","break","continue","new","this","class","extends","import","export","from","default","try","catch","finally","throw","async","await","interface","type","enum","implements","abstract","private","public","protected","readonly","static","as","true","false","null","undefined","console","log"],ty:["string","number","boolean","void","never","any","unknown","Array","Object","Map","Set","Promise"],cm:"//"},
  c:{kw:["if","else","for","while","do","switch","case","break","continue","return","struct","typedef","enum","sizeof","static","extern","const","goto","default","include","define","NULL","printf","scanf","malloc","free"],ty:["int","float","double","char","void","long","short","unsigned","size_t"],cm:"//"},
  cpp:{kw:["if","else","for","while","do","switch","case","break","continue","return","class","struct","public","private","protected","virtual","override","new","delete","try","catch","throw","namespace","using","template","const","static","auto","nullptr","true","false","include","cout","cin","endl","std"],ty:["int","float","double","char","void","bool","string","vector","map","set","pair","size_t"],cm:"//"},
  csharp:{kw:["if","else","for","foreach","while","do","switch","case","break","continue","return","class","struct","interface","enum","public","private","protected","static","virtual","override","abstract","sealed","new","this","base","using","namespace","try","catch","finally","throw","async","await","var","true","false","null","void","Console","WriteLine"],ty:["int","float","double","string","bool","char","long","decimal","object","List","Dictionary","Array"],cm:"//"},
  java:{kw:["if","else","for","while","do","switch","case","break","continue","return","class","interface","extends","implements","public","private","protected","static","final","abstract","new","this","super","try","catch","finally","throw","import","package","instanceof","true","false","null","void","System","out","println"],ty:["int","float","double","String","boolean","char","long","Integer","List","Map","ArrayList","HashMap","Object"],cm:"//"},
  lua:{kw:["and","break","do","else","elseif","end","false","for","function","if","in","local","nil","not","or","repeat","return","then","true","until","while","print","require","pairs","ipairs","type","tostring","tonumber","pcall","error","self","game","workspace","script","Instance","task"],ty:["string","number","boolean","table","nil","Vector3","CFrame","Color3","UDim2","Enum"],cm:"--"},
  html_css:{kw:["html","head","body","div","span","p","a","img","h1","h2","h3","ul","ol","li","table","form","input","button","link","meta","script","style","class","id","display","flex","grid","margin","padding","border","color","background","font","position","width","height"],ty:["px","em","rem","vh","vw","auto","none","block","inline","relative","absolute","fixed"],cm:"<!--"},
  sql:{kw:["SELECT","FROM","WHERE","INSERT","INTO","VALUES","UPDATE","SET","DELETE","CREATE","TABLE","ALTER","DROP","JOIN","INNER","LEFT","RIGHT","ON","AND","OR","NOT","IN","LIKE","ORDER","BY","GROUP","HAVING","LIMIT","AS","DISTINCT","COUNT","SUM","AVG","MAX","MIN","NULL","IS","select","from","where","insert","into","values","update","set","delete","create","table","join","on","and","or","not","in","like","order","by","group","having","limit","as","null","is"],ty:["INT","VARCHAR","TEXT","BOOLEAN","DATE","FLOAT","DECIMAL","int","varchar","text","boolean","date","float"],cm:"--"},
  rust:{kw:["fn","let","mut","if","else","for","while","loop","match","return","break","continue","struct","enum","impl","trait","pub","use","mod","crate","self","super","where","as","in","ref","move","async","await","unsafe","type","const","static","true","false","println"],ty:["i32","i64","u32","u64","f32","f64","bool","char","str","String","Vec","Option","Result","Box","HashMap","usize"],cm:"//"},
  go:{kw:["func","return","if","else","for","range","switch","case","break","continue","default","var","const","type","struct","interface","package","import","go","defer","select","chan","map","make","new","append","len","nil","true","false","fmt","Println"],ty:["int","int32","int64","float32","float64","string","bool","byte","rune","error","any"],cm:"//"},
  kotlin:{kw:["fun","val","var","if","else","when","for","while","do","return","break","continue","class","object","interface","data","sealed","enum","abstract","open","override","private","public","protected","import","package","try","catch","finally","throw","is","as","in","null","true","false","println","suspend"],ty:["Int","Long","Float","Double","String","Boolean","Char","Unit","Any","List","Map","Set","Array","Pair"],cm:"//"},
};

function tokenize(code, lid) {
  const r = SYN[lid] || SYN.javascript; const tks = []; let i = 0;
  while (i < code.length) {
    if (r.cm && code.startsWith(r.cm, i)) { const e = code.indexOf("\n", i); tks.push({ t:"comment", x:code.slice(i, e===-1?code.length:e) }); i = e===-1?code.length:e; continue; }
    if (code[i]==='"'||code[i]==="'"||code[i]==="`") {
      if (code[i]==="'"&&i>0&&/\w/.test(code[i-1])&&i+1<code.length&&/\w/.test(code[i+1])) { tks.push({t:"plain",x:"'"}); i++; continue; }
      const q=code[i]; let j=i+1; while(j<code.length&&(code[j]!==q||code[j-1]==="\\")){ if(code[j]==="\n"&&q!=="`")break; j++; } if(j<code.length&&code[j]===q)j++;
      tks.push({t:"string",x:code.slice(i,j)}); i=j; continue;
    }
    if (/\d/.test(code[i])&&(i===0||!/\w/.test(code[i-1]))) { let j=i; while(j<code.length&&/[\d.xXbBeE_]/.test(code[j]))j++; tks.push({t:"number",x:code.slice(i,j)}); i=j; continue; }
    if (/[a-zA-Z_$]/.test(code[i])) { let j=i; while(j<code.length&&/[\w$]/.test(code[j]))j++; const w=code.slice(i,j); tks.push({t:r.kw.includes(w)?"keyword":r.ty.includes(w)?"type":(j<code.length&&code[j]==="(")?"func":"id",x:w}); i=j; continue; }
    if ("+-*/%=<>!&|^~?:".includes(code[i])) { let j=i; while(j<code.length&&"+-*/%=<>!&|^~?:".includes(code[j]))j++; tks.push({t:"op",x:code.slice(i,j)}); i=j; continue; }
    if ("(){}[]".includes(code[i])) { tks.push({t:"bracket",x:code[i]}); i++; continue; }
    tks.push({t:"plain",x:code[i]}); i++;
  }
  return tks;
}
const TC={keyword:"#ff7b72",type:"#79c0ff",string:"#a5d6ff",number:"#79c0ff",comment:"#8b949e",func:"#d2a8ff",op:"#ff7b72",bracket:"#e6e6e6",id:"#c9d1d9",plain:"#c9d1d9"};

// ═══════════════════ LINTING ═══════════════════

function lintCode(code, lid) {
  const d=[], lines=code.split("\n"), stack=[], pairs={"(":")","{":"}","[":"]"}, close={")":"(","}":"{","]":"["};
  let inStr=false, strCh="";
  lines.forEach((ln,li)=>{
    if(ln.length>120) d.push({l:li,s:"warn",m:`Ligne trop longue (${ln.length})`});
    for(let c=0;c<ln.length;c++){
      const ch=ln[c];
      if((ch==='"'||ch==="'"||ch==="`")&&(c===0||ln[c-1]!=="\\")){
        if(ch==="'"&&!inStr&&c>0&&/\w/.test(ln[c-1])&&c+1<ln.length&&/\w/.test(ln[c+1]))continue;
        if(!inStr){inStr=true;strCh=ch;}else if(ch===strCh){inStr=false;strCh="";}continue;
      }
      if(inStr)continue;
      if(pairs[ch])stack.push({ch,l:li});
      if(close[ch]){const top=stack.pop();if(!top||top.ch!==close[ch])d.push({l:li,s:"error",m:`'${ch}' sans correspondance`});}
    }
    if(inStr&&strCh!=="`"){inStr=false;strCh="";}
  });
  stack.forEach(s=>d.push({l:s.l,s:"error",m:`'${s.ch}' jamais fermé`}));
  if(lid==="python") lines.forEach((ln,i)=>{ if(/\bprint\s+[^(]/.test(ln)&&!ln.trim().startsWith("#"))d.push({l:i,s:"error",m:"print() nécessite des parenthèses"}); });
  if(lid==="javascript"||lid==="typescript") lines.forEach((ln,i)=>{ if(/\bvar\s/.test(ln))d.push({l:i,s:"warn",m:"Préférez let/const"}); if(/[^=!<>]==[^=]/.test(ln))d.push({l:i,s:"warn",m:"Utilisez ==="}); });
  if(lid==="lua") lines.forEach((ln,i)=>{ if(/!=/.test(ln)&&!/~=/.test(ln)&&!ln.trim().startsWith("--"))d.push({l:i,s:"error",m:"En Lua: ~= et non !="}); });
  return d;
}

// ═══════════════════ EXECUTION ═══════════════════

async function executeCode(code, lid, callAI) {
  if(lid==="javascript"){
    const out=[];
    const mc={log:(...a)=>out.push(a.map(x=>typeof x==="object"?JSON.stringify(x,null,2):String(x)).join(" ")),error:(...a)=>out.push("❌ "+a.map(String).join(" ")),warn:(...a)=>out.push("⚠️ "+a.map(String).join(" ")),info:(...a)=>out.push("ℹ️ "+a.map(String).join(" "))};
    try{const fn=new Function("console","alert","prompt","document","window","fetch","XMLHttpRequest",`"use strict";\n${code}`);const r=fn(mc,()=>{},()=>"",undefined,undefined,undefined,undefined);if(r!==undefined)out.push("→ "+(typeof r==="object"?JSON.stringify(r,null,2):String(r)));if(out.length===0)out.push("(Aucune sortie — ajoutez console.log())");return{ok:true,out:out.join("\n")};}catch(e){return{ok:false,out:`❌ ${e.name}: ${e.message}`};}
  }
  const prompt=`Tu es un terminal ${lid}. Exécute ce code et montre EXACTEMENT la sortie. Pas de backticks, pas d'explication, juste la sortie brute.\n\`\`\`${lid}\n${code}\n\`\`\``;
  const reply=await callAI([{role:"user",content:prompt}],"Réponds UNIQUEMENT avec la sortie exacte du terminal.");
  const clean=reply.replace(/```[\s\S]*?```/g,"").replace(/^(SORTIE:|OUTPUT:)\s*/gm,"").trim();
  return{ok:!/error|erreur|exception/i.test(clean),out:clean||"(Aucune sortie)"};
}

// ═══════════════════ CODE EDITOR ═══════════════════

const mono="'JetBrains Mono','Fira Code',monospace";

function CodeEditor({value,onChange,langId,disabled,onRun,onSend,isRunning}){
  const taRef=useRef(null),hlRef=useRef(null),gutRef=useRef(null);
  const[diags,setDiags]=useState([]);
  const[showCons,setShowCons]=useState(false);
  const[consOut,setConsOut]=useState("");
  const[consOk,setConsOk]=useState(true);

  useEffect(()=>{const t=setTimeout(()=>setDiags(value.trim()?lintCode(value,langId):[]),400);return()=>clearTimeout(t);},[value,langId]);
  useEffect(()=>{if(taRef.current){taRef.current.style.height="auto";taRef.current.style.height=taRef.current.scrollHeight+"px";}},[value]);

  const tokens=tokenize(value||"",langId),lines=value.split("\n");
  const errL=new Set(diags.filter(d=>d.s==="error").map(d=>d.l)),warnL=new Set(diags.filter(d=>d.s==="warn").map(d=>d.l));
  const errs=diags.filter(d=>d.s==="error"),warns=diags.filter(d=>d.s==="warn");

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column"}}>
      <div style={ed.wrap}>
        <div style={ed.header}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:12,color:"#8b949e"}}>📝</span><span style={{fontSize:11,color:"#58a6ff",background:"#58a6ff15",padding:"2px 8px",borderRadius:4}}>{langId?.toUpperCase()}</span></div>
          <div style={{display:"flex",gap:6}}>
            {errs.length>0&&<span style={{fontSize:11,color:"#f85149",background:"#f8514915",padding:"2px 8px",borderRadius:4}}>● {errs.length}</span>}
            {warns.length>0&&<span style={{fontSize:11,color:"#d29922",background:"#d2992215",padding:"2px 8px",borderRadius:4}}>▲ {warns.length}</span>}
            {errs.length===0&&warns.length===0&&value.trim()&&<span style={{fontSize:11,color:"#3fb950",background:"#3fb95015",padding:"2px 8px",borderRadius:4}}>✓</span>}
          </div>
        </div>
        <div style={ed.codeArea}>
          <div ref={gutRef} style={ed.gutter}>{lines.map((_,i)=><div key={i} style={{...ed.lineNum,color:errL.has(i)?"#f85149":warnL.has(i)?"#d29922":"#484f58"}}>{i+1}</div>)}</div>
          <div style={ed.body} onScroll={e=>{if(gutRef.current)gutRef.current.scrollTop=e.target.scrollTop;}}>
            <pre ref={hlRef} style={ed.hl}>{tokens.map((t,i)=><span key={i} style={{color:TC[t.t]||"#c9d1d9"}}>{t.x}</span>)}<span>{"\n "}</span></pre>
            <textarea ref={taRef} value={value} onChange={e=>onChange(e.target.value)} spellCheck={false} disabled={disabled} placeholder="Écris ton code ici..." style={ed.ta}
              onKeyDown={e=>{
                if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();onSend();return;}
                if(e.key==="Tab"){e.preventDefault();const s=e.target.selectionStart,end=e.target.selectionEnd,v=e.target.value;if(e.shiftKey){const ls=v.lastIndexOf("\n",s-1)+1;if(v.startsWith("  ",ls)){onChange(v.slice(0,ls)+v.slice(ls+2));setTimeout(()=>{e.target.selectionStart=e.target.selectionEnd=Math.max(s-2,ls);},0);}}else{onChange(v.slice(0,s)+"  "+v.slice(end));setTimeout(()=>{e.target.selectionStart=e.target.selectionEnd=s+2;},0);}}
                if(e.key==="Enter"&&!e.ctrlKey&&!e.metaKey){e.preventDefault();const s=e.target.selectionStart,v=e.target.value,ls=v.lastIndexOf("\n",s-1)+1,cl=v.slice(ls,s),indent=cl.match(/^(\s*)/)[1],extra=["{","(",":",  "then","do"].some(c=>cl.trimEnd().endsWith(c))?"  ":"";onChange(v.slice(0,s)+"\n"+indent+extra+v.slice(s));setTimeout(()=>{e.target.selectionStart=e.target.selectionEnd=s+1+indent.length+extra.length;},0);}
                if("({[\"'`".includes(e.key)){const pr={"(":")","{":"}","[":"]",'"':'"',"'":"'","`":"`"};if(pr[e.key]){e.preventDefault();const s=e.target.selectionStart,end=e.target.selectionEnd,v=e.target.value;if(s!==end){onChange(v.slice(0,s)+e.key+v.slice(s,end)+pr[e.key]+v.slice(end));setTimeout(()=>{e.target.selectionStart=s+1;e.target.selectionEnd=end+1;},0);}else{onChange(v.slice(0,s)+e.key+pr[e.key]+v.slice(s));setTimeout(()=>{e.target.selectionStart=e.target.selectionEnd=s+1;},0);}}}
              }}/>
          </div>
        </div>
        {diags.length>0&&<div style={ed.diag}>{diags.slice(0,4).map((d,i)=><div key={i} style={{display:"flex",gap:8,fontSize:12,padding:"2px 0"}}><span style={{color:d.s==="error"?"#f85149":"#d29922"}}>{d.s==="error"?"●":"▲"}</span><span style={{color:"#6e7681"}}>L{d.l+1}</span><span style={{color:d.s==="error"?"#f85149":"#d29922"}}>{d.m}</span></div>)}</div>}
        <div style={ed.actBar}>
          <div style={{display:"flex",gap:8}}>
            <button onClick={async()=>{setShowCons(true);setConsOut("⏳...");setConsOk(true);const r=await onRun(value);setConsOut(r.out);setConsOk(r.ok);}} disabled={disabled||isRunning||!value.trim()} style={{...ed.runBtn,opacity:disabled||isRunning||!value.trim()?0.4:1}}>{isRunning?"⏳":"▶"} Exécuter</button>
            <button onClick={onSend} disabled={disabled||!value.trim()} style={{...ed.sendBtn,opacity:disabled||!value.trim()?0.4:1}}>📤 Envoyer au prof</button>
          </div>
          <span style={{fontSize:11,color:"#484f58"}}>Ctrl+↵ envoyer</span>
        </div>
      </div>
      {showCons&&<div style={ed.cons}><div style={ed.consH}><span style={{fontSize:12,fontWeight:600,color:"#e6e6e6"}}>⌨️ Console</span><div style={{display:"flex",gap:8}}><button onClick={()=>setConsOut("")} style={ed.consX}>Effacer</button><button onClick={()=>setShowCons(false)} style={ed.consX}>✕</button></div></div><pre style={{...ed.consO,color:consOk?"#3fb950":"#f85149"}}>{consOut}</pre></div>}
    </div>
  );
}
const ed={
  wrap:{borderRadius:10,border:"1px solid #30363d",background:"#0d1117",overflow:"hidden"},
  header:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 14px",borderBottom:"1px solid #21262d",background:"#161b22"},
  codeArea:{display:"flex",maxHeight:400,overflow:"hidden"},
  gutter:{padding:"10px 0",minWidth:44,textAlign:"right",userSelect:"none",borderRight:"1px solid #21262d",background:"#0d1117",overflowY:"hidden",flexShrink:0},
  lineNum:{fontSize:12,lineHeight:"20px",paddingRight:10,paddingLeft:4,fontFamily:mono},
  body:{flex:1,position:"relative",overflowY:"auto",overflowX:"hidden"},
  hl:{position:"absolute",top:0,left:0,right:0,margin:0,padding:"10px 12px",fontSize:13,lineHeight:"20px",fontFamily:mono,whiteSpace:"pre-wrap",wordBreak:"break-all",pointerEvents:"none",background:"transparent",border:"none",boxSizing:"border-box"},
  ta:{position:"relative",display:"block",width:"100%",minHeight:100,margin:0,padding:"10px 12px",fontSize:13,lineHeight:"20px",fontFamily:mono,background:"transparent",color:"transparent",caretColor:"#e6e6e6",border:"none",outline:"none",resize:"none",tabSize:2,WebkitTextFillColor:"transparent",whiteSpace:"pre-wrap",wordBreak:"break-all",overflowY:"hidden",boxSizing:"border-box"},
  diag:{padding:"6px 14px",borderTop:"1px solid #21262d",background:"#161b22",maxHeight:70,overflowY:"auto"},
  actBar:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 14px",borderTop:"1px solid #21262d",background:"#0d1117"},
  runBtn:{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:6,border:"1px solid #238636",background:"#238636",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"'Satoshi',sans-serif"},
  sendBtn:{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:6,border:"1px solid #58a6ff",background:"#58a6ff22",color:"#58a6ff",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"'Satoshi',sans-serif"},
  cons:{borderRadius:10,border:"1px solid #30363d",background:"#0d1117",overflow:"hidden",marginTop:6},
  consH:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 14px",borderBottom:"1px solid #21262d",background:"#161b22"},
  consX:{background:"none",border:"none",color:"#8b949e",cursor:"pointer",fontSize:12},
  consO:{margin:0,padding:"10px 14px",fontSize:13,lineHeight:1.6,fontFamily:mono,whiteSpace:"pre-wrap",maxHeight:140,overflowY:"auto"},
};

// ═══════════════════ SHARED COMPONENTS ═══════════════════

function CodeBlock({code,lang}){
  const[cp,setCp]=useState(false);const tks=tokenize(code,lang||"javascript");
  return(<div style={{position:"relative",margin:"12px 0"}}><pre style={{background:"#0d1117",padding:16,borderRadius:8,fontSize:13,lineHeight:1.6,overflowX:"auto",fontFamily:mono,margin:0,border:"1px solid #21262d"}}><code>{tks.map((t,i)=><span key={i} style={{color:TC[t.t]||"#c9d1d9"}}>{t.x}</span>)}</code></pre><button onClick={()=>{navigator.clipboard.writeText(code);setCp(true);setTimeout(()=>setCp(false),1500);}} style={{position:"absolute",top:8,right:8,background:cp?"#238636":"#30363d",color:"#c9d1d9",border:"none",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:12}}>{cp?"✓":"Copier"}</button></div>);
}
function parseAI(t){const p=[];const re=/```(\w*)\n([\s\S]*?)```/g;let l=0,m;while((m=re.exec(t))!==null){if(m.index>l)p.push({t:"text",c:t.slice(l,m.index)});p.push({t:"code",lang:m[1],c:m[2].trim()});l=m.index+m[0].length;}if(l<t.length)p.push({t:"text",c:t.slice(l)});return p;}
function AIMsg({content}){return(<div>{parseAI(content).map((p,i)=>p.t==="code"?<CodeBlock key={i} code={p.c} lang={p.lang}/>:<p key={i} style={{margin:"8px 0",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{p.c}</p>)}</div>);}

// ═══════════════════ MAIN APP ═══════════════════

export default function CodeSensei(){
  const[view,setView]=useState("home");
  const[lang,setLang]=useState(null);
  const[level,setLevel]=useState(0);
  const[progress,setProgress]=useState({});
  const[msgs,setMsgs]=useState([]);
  const[input,setInput]=useState("");
  const[loading,setLoading]=useState(false);
  const[chapter,setChapter]=useState(null);
  const[topic,setTopic]=useState(null);
  const[chapterIdx,setChapterIdx]=useState(0);
  const[topicIdx,setTopicIdx]=useState(0);
  const[lessonStep,setLessonStep]=useState(0);
  const TOTAL_STEPS=4; // Each topic has 4 steps
  const[sideOpen,setSideOpen]=useState(true);
  const[mode,setMode]=useState("text");
  const[running,setRunning]=useState(false);
  const[ready,setReady]=useState(false);
  // NEW: conversation history
  const[convos,setConvos]=useState([]);
  const[activeConvoId,setActiveConvoId]=useState(null);
  // NEW: quiz state
  const[quizData,setQuizData]=useState(null);
  const[quizAnswers,setQuizAnswers]=useState({});
  const[quizResult,setQuizResult]=useState(null);
  // NEW: dashboard stats
  const[stats,setStats]=useState({totalMessages:0,totalExercises:0,quizzesPassed:0,streak:0,lastDate:null});

  const endRef=useRef(null),inRef=useRef(null);

  // Load
  useEffect(()=>{(async()=>{
    const[p,l,lv,c,aid,s,st]=await Promise.all([store.get("progress",{}),store.get("lang",null),store.get("level",0),store.get("convos",[]),store.get("activeConvoId",null),store.get("stats",{totalMessages:0,totalExercises:0,quizzesPassed:0,streak:0,lastDate:null}),1]);
    setProgress(p);if(l)setLang(l);setLevel(lv);setConvos(c);setStats(s);
    if(aid&&c.length>0){const conv=c.find(x=>x.id===aid);if(conv){setActiveConvoId(aid);setMsgs(conv.messages);setChapter(conv.chapter);setTopic(conv.topic);if(l)setView("chat");}}
    else if(l)setView("course");
    setReady(true);
  })();},[]);

  // Save helpers
  const save=(k,v)=>{store.set(k,v);};
  useEffect(()=>{if(ready)save("progress",progress);},[progress,ready]);
  useEffect(()=>{if(ready&&lang)save("lang",lang);},[lang,ready]);
  useEffect(()=>{if(ready)save("level",level);},[level,ready]);
  useEffect(()=>{if(ready)save("stats",stats);},[stats,ready]);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  // Save conversations
  const saveConvos=(newConvos,newActiveId)=>{
    setConvos(newConvos);setActiveConvoId(newActiveId);
    save("convos",newConvos);save("activeConvoId",newActiveId);
  };
  const updateCurrentConvo=(newMsgs)=>{
    if(!activeConvoId)return;
    const updated=convos.map(c=>c.id===activeConvoId?{...c,messages:newMsgs,updatedAt:Date.now()}:c);
    saveConvos(updated,activeConvoId);
  };

  const getProg=(lid)=>{const p=progress[lid];if(!p)return{done:0,total:0,pct:0};const total=COURSE[lid]?.reduce((s,ch)=>s+ch.topics.length,0)||1;const done=Object.values(p).filter(Boolean).length;return{done,total,pct:Math.round((done/total)*100)};};
  const markDone=(lid,ch,ti)=>{setProgress(prev=>({...prev,[lid]:{...(prev[lid]||{}),[`${ch}-${ti}`]:true}}));};

  // Check if chapter is complete
  const isChapterDone=(lid,chObj)=>{if(!progress[lid])return false;return chObj.topics.every((_,ti)=>progress[lid][`${chObj.ch}-${ti}`]);};

  const callAI=useCallback(async(messages,sys)=>{
    setLoading(true);
    try{const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:sys,messages})});const d=await res.json();return d.content?.map(b=>b.text||"").join("")||"Erreur.";}
    catch{return"Erreur de connexion.";}finally{setLoading(false);}
  },[]);
  const callSilent=useCallback(async(messages,sys)=>{
    try{const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:sys,messages})});const d=await res.json();return d.content?.map(b=>b.text||"").join("")||"Erreur.";}catch{return"Erreur.";}
  },[]);

  const getSys=useCallback(()=>{
    const lg=LANGUAGES.find(l=>l.id===lang);const lv=LEVELS[level];
    const stepInstructions = [
      "ÉTAPE 1/4 — EXPLICATION: Explique le concept avec une analogie simple de la vie courante. Sois court (5-8 lignes max). Termine par: \"Tu as compris le principe ? Des questions ?\"",
      "ÉTAPE 2/4 — EXEMPLE: Montre UN exemple de code court et commenté (max 10 lignes de code). Explique brièvement ce que fait chaque ligne clé. Termine par: \"À ton avis, que va afficher ce code ?\" ou une question similaire.",
      "ÉTAPE 3/4 — PRATIQUE: Propose un mini-exercice simple et précis. Donne l'énoncé clairement. Exemple: \"Écris un code qui fait X\". Attends la réponse de l'élève.",
      "ÉTAPE 4/4 — VALIDATION: Corrige l'exercice de l'élève (ou sa réponse). Si c'est bon, félicite. Si c'est faux, explique l'erreur et donne la solution. Termine par: \"Bravo, tu maîtrises ce point ! Tu peux passer au suivant.\" et ajoute [LECON_TERMINEE] à la fin de ton message.",
    ];
    const currentStep = topic ? stepInstructions[Math.min(lessonStep, 3)] : "";
    return `Tu es CodeSensei, prof de ${lg?.name||"programmation"} pour un élève niveau ${lv}. Parle TOUJOURS en français.

${topic ? `SUJET: "${topic}" (${chapter})
${currentStep}

RÈGLES:
- Sois CONCIS. Pas de pavé. Max 10 lignes de texte (hors code).
- UN concept par message, pas plus.
- Adapte au niveau ${lv}.
- Si l'élève pose une question hors-sujet, réponds brièvement puis ramène-le au sujet.` : "Chat libre — réponds aux questions de l'élève. Sois concis et pratique."}`;
  },[lang,level,chapter,topic,lessonStep]);

  const handleRun=useCallback(async(code)=>{setRunning(true);try{return await executeCode(code,lang,callSilent);}finally{setRunning(false);}},[lang,callSilent]);

  // Update streak
  const updateStreak=()=>{
    const today=new Date().toDateString();
    setStats(prev=>{
      if(prev.lastDate===today)return{...prev,totalMessages:prev.totalMessages+1};
      const yesterday=new Date(Date.now()-86400000).toDateString();
      const newStreak=prev.lastDate===yesterday?prev.streak+1:1;
      return{...prev,totalMessages:prev.totalMessages+1,streak:newStreak,lastDate:today};
    });
  };

  const sendChat=async()=>{
    if(!input.trim()||loading)return;
    const raw=input.trim();
    const userMsg=mode==="code"?`Voici mon code:\n\`\`\`${lang||""}\n${raw}\n\`\`\`\nVérifie et donne un retour.`:raw;
    const displayMsg=mode==="code"?`\`\`\`${lang||""}\n${raw}\n\`\`\``:raw;
    setInput("");
    const newMsgs=[...msgs,{role:"user",content:displayMsg}];
    setMsgs(newMsgs);updateStreak();
    // Advance step when student responds during a lesson
    const nextStep=Math.min(lessonStep+1,TOTAL_STEPS-1);
    if(topic)setLessonStep(nextStep);
    const apiMsgs=[...msgs.map(m=>({role:m.role,content:m.content})),{role:"user",content:userMsg}];
    const reply=await callAI(apiMsgs,getSys());
    // Clean the marker from displayed message
    const cleanReply=reply.replace("[LECON_TERMINEE]","").trim();
    const isComplete=reply.includes("[LECON_TERMINEE]");
    const finalMsgs=[...newMsgs,{role:"assistant",content:cleanReply}];
    setMsgs(finalMsgs);
    if(isComplete)setLessonStep(TOTAL_STEPS);
    if(activeConvoId){const updated=convos.map(c=>c.id===activeConvoId?{...c,messages:finalMsgs,updatedAt:Date.now()}:c);saveConvos(updated,activeConvoId);}
  };

  const newConvo=(ch,tp,initialMsgs)=>{
    const id="c_"+Date.now();
    const c={id,langId:lang,chapter:ch||null,topic:tp||null,messages:initialMsgs||[],createdAt:Date.now(),updatedAt:Date.now(),title:tp||ch||"Chat libre"};
    const updated=[c,...convos].slice(0,50);// Keep 50 max
    saveConvos(updated,id);
    return id;
  };

  const startLesson=async(ch,ti,tp)=>{
    const ci=chapters.findIndex(c=>c.ch===ch.ch);
    setChapter(ch.title);setTopic(tp);setChapterIdx(ci>=0?ci:0);setTopicIdx(ti);setLessonStep(0);setMsgs([]);setView("chat");
    const initMsgs=[{role:"user",content:`📖 Leçon: ${tp}`}];
    const cid=newConvo(ch.title,tp,initMsgs);setActiveConvoId(cid);setMsgs(initMsgs);
    const reply=await callAI([{role:"user",content:`Enseigne-moi "${tp}" du chapitre "${ch.title}". Rappelle-toi: explique UN SEUL concept à la fois, avec une analogie, UN exemple de code court, et termine par une question ou un petit exercice pour moi.`}],getSys());
    const final=[...initMsgs,{role:"assistant",content:reply}];
    setMsgs(final);markDone(lang,ch.ch,ti);
    const updated=convos.map(c=>c.id===cid?{...c,messages:final,updatedAt:Date.now()}:c);
    if(!updated.find(c=>c.id===cid))updated.unshift({id:cid,langId:lang,chapter:ch.title,topic:tp,messages:final,createdAt:Date.now(),updatedAt:Date.now(),title:tp});
    saveConvos(updated,cid);
  };

  // Navigation helpers
  const getNextTopic=()=>{
    if(!chapters.length)return null;
    const ch=chapters[chapterIdx];
    if(topicIdx<ch.topics.length-1)return{ch,ti:topicIdx+1,tp:ch.topics[topicIdx+1]};
    if(chapterIdx<chapters.length-1){const nch=chapters[chapterIdx+1];return{ch:nch,ti:0,tp:nch.topics[0]};}
    return null;
  };
  const getPrevTopic=()=>{
    if(!chapters.length)return null;
    const ch=chapters[chapterIdx];
    if(topicIdx>0)return{ch,ti:topicIdx-1,tp:ch.topics[topicIdx-1]};
    if(chapterIdx>0){const pch=chapters[chapterIdx-1];return{ch:pch,ti:pch.topics.length-1,tp:pch.topics[pch.topics.length-1]};}
    return null;
  };

  const startFreeChat=()=>{
    setChapter(null);setTopic(null);setLessonStep(0);
    const lg=LANGUAGES.find(l=>l.id===lang);
    const initMsgs=[{role:"assistant",content:`Salut ! 👋 Je suis ton prof ${lg?.name}. Pose-moi n'importe quelle question !`}];
    setMsgs(initMsgs);setView("chat");
    newConvo(null,"Chat libre — "+lg?.name,initMsgs);
  };

  const loadConvo=(c)=>{
    setActiveConvoId(c.id);setMsgs(c.messages);setChapter(c.chapter);setTopic(c.topic);
    if(c.langId&&c.langId!==lang)setLang(c.langId);
    setView("chat");save("activeConvoId",c.id);
  };

  const deleteConvo=(id)=>{
    const updated=convos.filter(c=>c.id!==id);
    const newActive=updated.length>0?updated[0].id:null;
    saveConvos(updated,newActive);
    if(id===activeConvoId){if(updated.length>0)loadConvo(updated[0]);else{setMsgs([]);setView("course");}}
  };

  // ═══════ QUIZ ═══════
  const startQuiz=async(chObj)=>{
    setView("quiz");setQuizData(null);setQuizAnswers({});setQuizResult(null);
    const lg=LANGUAGES.find(l=>l.id===lang);
    const prompt=`Génère un quiz de 5 questions QCM sur le chapitre "${chObj.title}" en ${lg?.name}. Les sujets couverts sont: ${chObj.topics.join(", ")}.

Réponds UNIQUEMENT avec ce format JSON exact (pas de texte avant/après):
[{"q":"question","opts":["A","B","C","D"],"answer":0},...]
où answer est l'index (0-3) de la bonne réponse.`;
    const reply=await callAI([{role:"user",content:prompt}],"Tu génères des quiz JSON. Réponds UNIQUEMENT en JSON valide.");
    try{
      const clean=reply.replace(/```json?\n?/g,"").replace(/```/g,"").trim();
      const parsed=JSON.parse(clean);
      setQuizData({chapter:chObj,questions:parsed});
    }catch{setQuizData({chapter:chObj,questions:[{q:"Erreur de génération du quiz. Réessayez.",opts:["OK","OK","OK","OK"],answer:0}]});}
  };

  const submitQuiz=()=>{
    if(!quizData)return;
    let correct=0;
    quizData.questions.forEach((q,i)=>{if(quizAnswers[i]===q.answer)correct++;});
    const passed=correct>=3;
    setQuizResult({correct,total:quizData.questions.length,passed});
    if(passed)setStats(prev=>({...prev,quizzesPassed:prev.quizzesPassed+1}));
  };

  // ═══════ EXERCISE ═══════
  const[exercise,setExercise]=useState(null);
  const[exCode,setExCode]=useState("");
  const[exResult,setExResult]=useState(null);
  const[exLoading,setExLoading]=useState(false);

  const startExercise=async(tp)=>{
    setView("exercise");setExercise(null);setExCode("");setExResult(null);
    const lg=LANGUAGES.find(l=>l.id===lang);
    const prompt=`Génère un exercice de programmation en ${lg?.name} sur "${tp}".

Réponds UNIQUEMENT avec ce format JSON:
{"title":"titre court","description":"énoncé détaillé de l'exercice","hint":"un indice","expected":"description de ce que le code doit faire/afficher"}`;
    const reply=await callAI([{role:"user",content:prompt}],"Génère un exercice JSON. UNIQUEMENT du JSON valide.");
    try{
      const clean=reply.replace(/```json?\n?/g,"").replace(/```/g,"").trim();
      setExercise(JSON.parse(clean));
    }catch{setExercise({title:tp,description:"Écris un programme qui illustre ce concept. Le prof IA évaluera ta solution.",hint:"Essaie de couvrir les cas de base.",expected:"Un programme fonctionnel"});}
  };

  const submitExercise=async()=>{
    if(!exCode.trim())return;
    setExLoading(true);
    const lg=LANGUAGES.find(l=>l.id===lang);
    const prompt=`L'élève devait faire cet exercice:
Titre: ${exercise.title}
Énoncé: ${exercise.description}
Attendu: ${exercise.expected}

Voici sa solution en ${lg?.name}:
\`\`\`${lang}\n${exCode}\n\`\`\`

Évalue sa solution. Réponds en JSON:
{"score":0-100,"passed":true/false,"feedback":"retour détaillé et encourageant en français","corrections":"corrections si nécessaire"}`;
    const reply=await callSilent([{role:"user",content:prompt}],"Évalue le code. Réponds UNIQUEMENT en JSON.");
    try{
      const clean=reply.replace(/```json?\n?/g,"").replace(/```/g,"").trim();
      setExResult(JSON.parse(clean));
      if(JSON.parse(clean).passed)setStats(prev=>({...prev,totalExercises:prev.totalExercises+1}));
    }catch{setExResult({score:50,passed:false,feedback:reply,corrections:""});}
    setExLoading(false);
  };

  const lg=LANGUAGES.find(l=>l.id===lang);
  const chapters=COURSE[lang]||[];

  if(!ready)return(<div style={S.root}><div style={S.center}><h1 style={S.heroTitle}>⌨️ Code<span style={{color:"#FF6B35"}}>Sensei</span></h1><p style={{color:"#888",marginTop:16}}>Chargement...</p></div></div>);

  // ═══════ HOME ═══════
  if(view==="home")return(
    <div style={S.root}><div style={S.center}>
      <div style={S.glow}/>
      <h1 style={S.heroTitle}>⌨️ Code<span style={{color:"#FF6B35"}}>Sensei</span></h1>
      <p style={S.sub}>Ton professeur IA pour maîtriser la programmation</p>
      <div style={S.row3}>
        <div style={S.stat}><span style={S.statN}>{LANGUAGES.length}</span><span style={S.statL}>Langages</span></div>
        <div style={S.stat}><span style={S.statN}>∞</span><span style={S.statL}>Exercices</span></div>
        <div style={S.stat}><span style={S.statN}>24/7</span><span style={S.statL}>Disponible</span></div>
      </div>
      <div style={{display:"flex",gap:12,marginTop:32,zIndex:1}}>
        <button style={S.startBtn} onClick={()=>setView("select")}>Commencer →</button>
        <button style={{...S.startBtn,background:"#12121e",border:"1px solid #FF6B35",boxShadow:"none"}} onClick={()=>setView("dashboard")}>📊 Dashboard</button>
      </div>
      <div style={S.pills}>{LANGUAGES.map(l=><div key={l.id} style={{...S.pill,borderColor:l.color+"44"}}><span>{l.icon}</span><span style={{fontSize:13}}>{l.name}</span></div>)}</div>
    </div></div>
  );

  // ═══════ DASHBOARD ═══════
  if(view==="dashboard")return(
    <div style={S.root}><div style={{padding:32,maxWidth:800,margin:"0 auto"}}>
      <button style={S.back} onClick={()=>setView("home")}>← Retour</button>
      <h2 style={{fontSize:28,fontWeight:800,color:"#f0f0f0",marginTop:16}}>📊 Tableau de bord</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:16,marginTop:24}}>
        <div style={S.dashCard}><div style={{fontSize:32,fontWeight:800,color:"#FF6B35"}}>{stats.totalMessages}</div><div style={{fontSize:13,color:"#888"}}>Messages envoyés</div></div>
        <div style={S.dashCard}><div style={{fontSize:32,fontWeight:800,color:"#3fb950"}}>{stats.totalExercises}</div><div style={{fontSize:13,color:"#888"}}>Exercices réussis</div></div>
        <div style={S.dashCard}><div style={{fontSize:32,fontWeight:800,color:"#58a6ff"}}>{stats.quizzesPassed}</div><div style={{fontSize:13,color:"#888"}}>Quiz validés</div></div>
        <div style={S.dashCard}><div style={{fontSize:32,fontWeight:800,color:"#d2a8ff"}}>{stats.streak}🔥</div><div style={{fontSize:13,color:"#888"}}>Jours consécutifs</div></div>
      </div>
      <h3 style={{color:"#f0f0f0",marginTop:32,marginBottom:16}}>Progression par langage</h3>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {LANGUAGES.map(l=>{const p=getProg(l.id);return p.pct>0?(
          <div key={l.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:"#12121e",borderRadius:10,border:"1px solid #1a1a2a"}}>
            <span style={{fontSize:20}}>{l.icon}</span>
            <span style={{fontWeight:600,color:"#f0f0f0",minWidth:100}}>{l.name}</span>
            <div style={{flex:1,height:8,background:"#1a1a2a",borderRadius:4}}><div style={{height:"100%",borderRadius:4,background:l.color,width:p.pct+"%",transition:"width 0.5s"}}/></div>
            <span style={{fontSize:13,color:l.color,fontWeight:700,minWidth:40,textAlign:"right"}}>{p.pct}%</span>
          </div>
        ):null;})}
        {LANGUAGES.every(l=>getProg(l.id).pct===0)&&<p style={{color:"#888",textAlign:"center",padding:20}}>Commence à apprendre pour voir ta progression ici !</p>}
      </div>
      <h3 style={{color:"#f0f0f0",marginTop:32,marginBottom:16}}>Conversations récentes ({convos.length})</h3>
      {convos.slice(0,8).map(c=>{const cl=LANGUAGES.find(l=>l.id===c.langId);return(
        <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"#12121e",borderRadius:8,border:"1px solid #1a1a2a",marginBottom:8,cursor:"pointer"}} onClick={()=>{setLang(c.langId);loadConvo(c);}}>
          <span>{cl?.icon||"💬"}</span>
          <div style={{flex:1}}><div style={{fontSize:14,color:"#f0f0f0",fontWeight:600}}>{c.title}</div><div style={{fontSize:11,color:"#888"}}>{c.messages.length} messages · {new Date(c.updatedAt).toLocaleDateString("fr")}</div></div>
        </div>
      );})}
    </div></div>
  );

  // ═══════ SELECT ═══════
  if(view==="select")return(
    <div style={S.root}><div style={{padding:"32px 24px",maxWidth:1000,margin:"0 auto"}}>
      <button style={S.back} onClick={()=>setView("home")}>← Retour</button>
      <h2 style={{fontSize:28,fontWeight:800,color:"#f0f0f0",textAlign:"center",margin:"16px 0 20px"}}>Choisis ton langage</h2>
      <div style={{display:"flex",gap:8,marginBottom:24,justifyContent:"center"}}>{LEVELS.map((lv,i)=><button key={lv} onClick={()=>setLevel(i)} style={{...S.lvlBtn,...(level===i?S.lvlAct:{})}}>{lv}</button>)}</div>
      <div style={S.cards}>{LANGUAGES.map(l=>{const p=getProg(l.id);return(
        <div key={l.id} style={S.card} onClick={()=>{setLang(l.id);setView("course");}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.borderColor=l.color;}} onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.borderColor="#2a2a3a";}}>
          <div style={{fontSize:32}}>{l.icon}</div><div style={{fontWeight:700,fontSize:16,color:"#f0f0f0"}}>{l.name}</div><div style={{fontSize:12,color:"#888",marginTop:2}}>{l.desc}</div>
          {p.pct>0&&<><div style={{width:"80%",height:3,background:"#1a1a2a",borderRadius:4,marginTop:8}}><div style={{height:"100%",borderRadius:4,background:l.color,width:p.pct+"%"}}/></div><div style={{fontSize:11,color:l.color,marginTop:4}}>{p.pct}%</div></>}
        </div>);})}</div>
    </div></div>
  );

  // ═══════ COURSE ═══════
  if(view==="course")return(
    <div style={S.root}><div style={{padding:24,maxWidth:900,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap"}}>
        <button style={S.back} onClick={()=>setView("select")}>← Langages</button>
        <div style={{display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:28}}>{lg?.icon}</span><div><h2 style={{margin:0,color:"#f0f0f0",fontSize:22}}>{lg?.name}</h2><span style={{fontSize:12,color:"#888"}}>{LEVELS[level]}</span></div></div>
        <div style={{display:"flex",gap:8}}>
          <button style={{...S.freeBtn,background:lg?.color||"#FF6B35"}} onClick={startFreeChat}>💬 Chat libre</button>
          <button style={{...S.freeBtn,background:"#12121e",border:"1px solid #FF6B35"}} onClick={()=>setView("dashboard")}>📊</button>
        </div>
      </div>
      <div style={{width:"100%",height:8,background:"#1a1a2a",borderRadius:8,marginTop:20,marginBottom:28,position:"relative"}}><div style={{height:"100%",borderRadius:8,background:lg?.color,width:getProg(lang).pct+"%",transition:"width 0.5s"}}/><span style={{position:"absolute",right:0,top:-18,fontSize:12,color:"#888"}}>{getProg(lang).pct}%</span></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
        {chapters.map((ch,ci)=>{const done=isChapterDone(lang,ch);return(
          <div key={ci} style={{background:"#12121e",borderRadius:14,border:"1px solid #1a1a2a",padding:18}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{padding:"4px 10px",borderRadius:8,fontSize:12,fontWeight:700,background:lg?.color+"22",color:lg?.color}}>Ch.{ch.ch}</span><span style={{fontWeight:700,color:"#f0f0f0",fontSize:15}}>{ch.title}</span></div>
              {done&&<span style={{fontSize:11,color:"#3fb950",background:"#3fb95015",padding:"3px 8px",borderRadius:6}}>✓</span>}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:2}}>
              {ch.topics.map((tp,ti)=>{const d=progress[lang]?.[`${ch.ch}-${ti}`];return(
                <div key={ti} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 6px",borderRadius:8,cursor:"pointer"}} onClick={()=>startLesson(ch,ti,tp)} onMouseEnter={e=>e.currentTarget.style.background="#1a1a2e"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <span style={{width:20,height:20,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#fff",fontWeight:700,background:d?(lg?.color||"#4ade80"):"#333",flexShrink:0}}>{d?"✓":""}</span>
                  <span style={{color:d?"#aaa":"#ddd",fontSize:14}}>{tp}</span>
                  <span style={{marginLeft:"auto",color:"#444",fontSize:13}}>→</span>
                </div>);
              })}
            </div>
            {/* Quiz + Exercise buttons */}
            <div style={{display:"flex",gap:8,marginTop:12}}>
              <button onClick={()=>startQuiz(ch)} style={{flex:1,padding:"8px",borderRadius:8,border:"1px solid #d2992244",background:"#d2992211",color:"#d29922",cursor:"pointer",fontSize:12,fontWeight:600}}>📝 Quiz</button>
              <button onClick={()=>startExercise(ch.title+" — "+ch.topics[0])} style={{flex:1,padding:"8px",borderRadius:8,border:"1px solid #58a6ff44",background:"#58a6ff11",color:"#58a6ff",cursor:"pointer",fontSize:12,fontWeight:600}}>🏋️ Exercice</button>
            </div>
          </div>);
        })}
      </div>
    </div></div>
  );

  // ═══════ QUIZ ═══════
  if(view==="quiz")return(
    <div style={S.root}><div style={{padding:32,maxWidth:700,margin:"0 auto"}}>
      <button style={S.back} onClick={()=>setView("course")}>← Retour au cours</button>
      <h2 style={{color:"#f0f0f0",marginTop:16}}>📝 Quiz{quizData?` — ${quizData.chapter.title}`:""}</h2>
      {!quizData?<p style={{color:"#888",marginTop:24}}>⏳ Génération du quiz...</p>:quizResult?(
        <div style={{marginTop:24}}>
          <div style={{padding:24,background:quizResult.passed?"#23863622":"#f8514922",borderRadius:14,border:`1px solid ${quizResult.passed?"#238636":"#f85149"}`,textAlign:"center"}}>
            <div style={{fontSize:48,fontWeight:800,color:quizResult.passed?"#3fb950":"#f85149"}}>{quizResult.correct}/{quizResult.total}</div>
            <div style={{fontSize:18,color:"#f0f0f0",marginTop:8}}>{quizResult.passed?"🎉 Quiz réussi !":"Encore un effort !"}</div>
            <p style={{color:"#888",marginTop:8}}>{quizResult.passed?"Tu maîtrises ce chapitre.":"Il faut au moins 3/5 pour valider."}</p>
          </div>
          <div style={{display:"flex",gap:12,marginTop:16}}>
            <button style={{...S.freeBtn,background:lg?.color}} onClick={()=>setView("course")}>Continuer</button>
            {!quizResult.passed&&<button style={{...S.freeBtn,background:"#12121e",border:"1px solid "+lg?.color}} onClick={()=>{setQuizAnswers({});setQuizResult(null);}}>Réessayer</button>}
          </div>
        </div>
      ):(
        <div style={{marginTop:20}}>
          {quizData.questions.map((q,qi)=>(
            <div key={qi} style={{padding:16,background:"#12121e",borderRadius:12,border:"1px solid #1a1a2a",marginBottom:12}}>
              <div style={{fontWeight:600,color:"#f0f0f0",marginBottom:10}}>{qi+1}. {q.q}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {q.opts.map((opt,oi)=>(
                  <button key={oi} onClick={()=>setQuizAnswers(prev=>({...prev,[qi]:oi}))}
                    style={{padding:"10px 14px",borderRadius:8,border:`1px solid ${quizAnswers[qi]===oi?(lg?.color||"#FF6B35"):"#2a2a3a"}`,background:quizAnswers[qi]===oi?(lg?.color||"#FF6B35")+"22":"#0d1117",color:quizAnswers[qi]===oi?"#f0f0f0":"#aaa",cursor:"pointer",fontSize:13,textAlign:"left"}}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button onClick={submitQuiz} disabled={Object.keys(quizAnswers).length<quizData.questions.length}
            style={{...S.freeBtn,background:lg?.color,opacity:Object.keys(quizAnswers).length<quizData.questions.length?0.4:1,marginTop:8}}>
            Valider le quiz ({Object.keys(quizAnswers).length}/{quizData.questions.length})
          </button>
        </div>
      )}
    </div></div>
  );

  // ═══════ EXERCISE ═══════
  if(view==="exercise")return(
    <div style={S.root}><div style={{padding:32,maxWidth:800,margin:"0 auto"}}>
      <button style={S.back} onClick={()=>setView("course")}>← Retour</button>
      {!exercise?<p style={{color:"#888",marginTop:24}}>⏳ Génération de l'exercice...</p>:(
        <div style={{marginTop:16}}>
          <h2 style={{color:"#f0f0f0"}}>🏋️ {exercise.title}</h2>
          <div style={{padding:16,background:"#12121e",borderRadius:12,border:"1px solid #1a1a2a",marginTop:12}}>
            <p style={{color:"#e0e0e0",lineHeight:1.7,margin:0}}>{exercise.description}</p>
            <p style={{color:"#888",fontSize:13,marginTop:10}}>💡 Indice: {exercise.hint}</p>
          </div>
          <div style={{marginTop:16}}>
            <CodeEditor value={exCode} onChange={setExCode} langId={lang} disabled={exLoading} onRun={handleRun} onSend={submitExercise} isRunning={running}/>
          </div>
          <button onClick={submitExercise} disabled={exLoading||!exCode.trim()} style={{...S.freeBtn,background:"#238636",marginTop:12,opacity:exLoading||!exCode.trim()?0.4:1}}>
            {exLoading?"⏳ Évaluation...":"✅ Soumettre ma solution"}
          </button>
          {exResult&&(
            <div style={{marginTop:16,padding:20,background:exResult.passed?"#238636":"#d29922"+"22",borderRadius:12,border:`1px solid ${exResult.passed?"#238636":"#d29922"}`}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                <div style={{fontSize:36,fontWeight:800,color:exResult.passed?"#3fb950":"#d29922"}}>{exResult.score}/100</div>
                <div style={{fontSize:18,color:"#f0f0f0"}}>{exResult.passed?"🎉 Réussi !":"Presque !"}</div>
              </div>
              <p style={{color:"#e0e0e0",lineHeight:1.6,margin:0}}>{exResult.feedback}</p>
              {exResult.corrections&&<div style={{marginTop:10,padding:12,background:"#0d1117",borderRadius:8}}><p style={{color:"#f85149",margin:0,fontSize:13}}>{exResult.corrections}</p></div>}
            </div>
          )}
        </div>
      )}
    </div></div>
  );

  // ═══════ CHAT ═══════
  return(
    <div style={S.root}><div style={{display:"flex",height:"100vh",overflow:"hidden"}}>
      {/* Sidebar */}
      <div style={{background:"#0e0e1a",borderRight:"1px solid #1a1a2a",width:sideOpen?280:0,padding:sideOpen?16:0,overflow:"hidden",transition:"width 0.3s,padding 0.3s",display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}><span style={{fontSize:20}}>{lg?.icon}</span><span style={{fontWeight:700,color:"#f0f0f0",fontSize:15}}>{lg?.name}</span></div>
        <button style={{...S.sideBtn,background:lg?.color+"22",color:lg?.color,marginBottom:8}} onClick={()=>setView("course")}>📚 Cours</button>
        <button style={{...S.sideBtn,marginBottom:8}} onClick={startFreeChat}>💬 Nouveau chat</button>
        <button style={{...S.sideBtn,marginBottom:12}} onClick={()=>setView("dashboard")}>📊 Dashboard</button>
        <div style={{fontSize:11,color:"#666",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Conversations</div>
        <div style={{flex:1,overflowY:"auto"}}>
          {convos.filter(c=>c.langId===lang).map(c=>(
            <div key={c.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 6px",borderRadius:6,cursor:"pointer",background:c.id===activeConvoId?"#1a1a2e":"transparent",marginBottom:2}} onClick={()=>loadConvo(c)}>
              <span style={{fontSize:12,color:c.id===activeConvoId?lg?.color:"#888"}}>💬</span>
              <div style={{flex:1,overflow:"hidden"}}><div style={{fontSize:12,color:c.id===activeConvoId?"#f0f0f0":"#bbb",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.title}</div><div style={{fontSize:10,color:"#555"}}>{c.messages.length} msg</div></div>
              <button onClick={e=>{e.stopPropagation();deleteConvo(c.id);}} style={{background:"none",border:"none",color:"#555",cursor:"pointer",fontSize:11,padding:"2px 4px"}}>✕</button>
            </div>
          ))}
        </div>
      </div>
      {/* Main */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:"1px solid #1a1a2a",background:"#0e0e1a"}}>
          <button style={{background:"none",border:"1px solid #2a2a3a",color:"#888",width:32,height:32,borderRadius:8,cursor:"pointer",fontSize:12}} onClick={()=>setSideOpen(!sideOpen)}>{sideOpen?"◀":"▶"}</button>
          <div style={{flex:1}}><span style={{fontWeight:700,color:"#f0f0f0"}}>{topic?`📖 ${topic}`:`💬 ${lg?.name}`}</span>{chapter&&<span style={{fontSize:12,color:"#888",marginLeft:8}}>{chapter}</span>}</div>
          {/* Topic navigation */}
          {topic&&(
            <div style={{display:"flex",gap:6}}>
              {getPrevTopic()&&<button onClick={()=>{const p=getPrevTopic();if(p)startLesson(p.ch,p.ti,p.tp);}} disabled={loading} style={{padding:"6px 12px",borderRadius:8,border:"1px solid #2a2a3a",background:"#12121e",color:"#aaa",cursor:"pointer",fontSize:12,fontWeight:600,opacity:loading?0.4:1}}>← Précédent</button>}
              {getNextTopic()&&<button onClick={()=>{const n=getNextTopic();if(n)startLesson(n.ch,n.ti,n.tp);}} disabled={loading} style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${lg?.color||"#FF6B35"}44`,background:(lg?.color||"#FF6B35")+"15",color:lg?.color||"#FF6B35",cursor:"pointer",fontSize:12,fontWeight:600,opacity:loading?0.4:1}}>Suivant →</button>}
            </div>
          )}
        </div>
        {/* Lesson progress bar */}
        {topic&&(
          <div style={{padding:"8px 16px",background:"#0e0e1a",borderBottom:"1px solid #1a1a2a"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
              <span style={{fontSize:12,color:"#888"}}>Progression de la leçon</span>
              <span style={{fontSize:12,fontWeight:700,color:lessonStep>=TOTAL_STEPS?"#3fb950":lg?.color||"#FF6B35"}}>{lessonStep>=TOTAL_STEPS?"✓ Terminé":`${Math.min(lessonStep+1,TOTAL_STEPS)}/${TOTAL_STEPS}`}</span>
            </div>
            <div style={{display:"flex",gap:4}}>
              {["Explication","Exemple","Pratique","Validation"].map((label,i)=>(
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  <div style={{width:"100%",height:4,borderRadius:2,background:i<=lessonStep?(i<lessonStep?"#3fb950":lg?.color||"#FF6B35"):"#1a1a2a",transition:"background 0.3s"}}/>
                  <span style={{fontSize:10,color:i<=lessonStep?"#ccc":"#555"}}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{flex:1,overflowY:"auto",padding:"20px 24px",display:"flex",flexDirection:"column",gap:16}}>
          {msgs.map((m,i)=>(
            <div key={i} style={{padding:"14px 18px",borderRadius:14,alignSelf:m.role==="user"?"flex-end":"flex-start",background:m.role==="user"?(lg?.color||"#FF6B35")+"22":"#1a1a2e",borderLeft:m.role==="assistant"?`3px solid ${lg?.color||"#FF6B35"}`:"none",maxWidth:"85%"}}>
              {m.role==="assistant"&&<div style={{fontSize:11,color:lg?.color,marginBottom:4,fontWeight:600}}>🎓 CodeSensei</div>}
              <AIMsg content={m.content}/>
            </div>
          ))}
          {loading&&<div style={{padding:"14px 18px",borderRadius:14,background:"#1a1a2e",alignSelf:"flex-start",borderLeft:`3px solid ${lg?.color}`}}><div style={{fontSize:11,color:lg?.color,marginBottom:4,fontWeight:600}}>🎓 CodeSensei</div><span style={{color:"#888"}}>Réflexion...</span></div>}
          {/* Lesson complete banner */}
          {topic&&lessonStep>=TOTAL_STEPS&&!loading&&(
            <div style={{padding:"16px 20px",borderRadius:14,background:"#238636"+"18",border:"1px solid #23863644",textAlign:"center"}}>
              <div style={{fontSize:18,fontWeight:700,color:"#3fb950",marginBottom:6}}>🎉 Leçon terminée !</div>
              <p style={{color:"#aaa",margin:"0 0 12px",fontSize:13}}>Tu maîtrises "{topic}"</p>
              <div style={{display:"flex",gap:8,justifyContent:"center"}}>
                {getNextTopic()&&<button onClick={()=>{const n=getNextTopic();if(n)startLesson(n.ch,n.ti,n.tp);}} style={{padding:"8px 20px",borderRadius:8,border:"none",background:lg?.color||"#FF6B35",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:600}}>Leçon suivante →</button>}
                <button onClick={()=>setView("course")} style={{padding:"8px 20px",borderRadius:8,border:"1px solid #2a2a3a",background:"#12121e",color:"#aaa",cursor:"pointer",fontSize:13}}>Retour aux cours</button>
              </div>
            </div>
          )}
          <div ref={endRef}/>
        </div>
        {/* Input */}
        <div style={{padding:"10px 18px 14px",borderTop:"1px solid #1a1a2a",background:"#0e0e1a"}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
            <button onClick={()=>setMode("text")} style={{...S.modeBtn,...(mode==="text"?{background:(lg?.color||"#FF6B35")+"22",color:lg?.color||"#FF6B35",borderColor:lg?.color||"#FF6B35"}:{})}}>💬 Texte</button>
            <button onClick={()=>setMode("code")} style={{...S.modeBtn,...(mode==="code"?{background:(lg?.color||"#FF6B35")+"22",color:lg?.color||"#FF6B35",borderColor:lg?.color||"#FF6B35"}:{})}}>{"</>"} Code</button>
            <span style={{fontSize:11,color:"#484f58",marginLeft:8}}>{mode==="text"?"Entrée = envoyer":"▶ Exécuter · Ctrl+↵ envoyer"}</span>
          </div>
          <div style={{display:"flex",gap:10,alignItems:"flex-end"}}>
            {mode==="text"?(
              <textarea ref={inRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendChat();}}} placeholder="Ta question..." rows={1} style={{...S.textInput,resize:"none",minHeight:44,maxHeight:120}} disabled={loading} onInput={e=>{e.target.style.height="44px";e.target.style.height=Math.min(e.target.scrollHeight,120)+"px";}}/>
            ):(
              <CodeEditor value={input} onChange={setInput} langId={lang} disabled={loading} onRun={handleRun} onSend={sendChat} isRunning={running}/>
            )}
            <button onClick={sendChat} disabled={loading||!input.trim()} style={{...S.sendBtn,background:lg?.color||"#FF6B35",opacity:loading||!input.trim()?0.4:1}}>↑</button>
          </div>
        </div>
      </div>
    </div></div>
  );
}

// ═══════════════════ STYLES ═══════════════════

const S={
  root:{width:"100%",minHeight:"100vh",background:"#0a0a14",fontFamily:"'Satoshi','DM Sans',sans-serif",color:"#e0e0e0"},
  center:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:"40px 20px",position:"relative",textAlign:"center"},
  glow:{position:"absolute",top:"10%",left:"50%",transform:"translateX(-50%)",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,#FF6B3510 0%,transparent 70%)",pointerEvents:"none"},
  heroTitle:{fontSize:48,fontWeight:900,color:"#f0f0f0",margin:0,letterSpacing:-2,zIndex:1},
  sub:{fontSize:18,color:"#888",marginTop:8,zIndex:1},
  row3:{display:"flex",gap:24,marginTop:36,zIndex:1},
  stat:{display:"flex",flexDirection:"column",alignItems:"center",padding:"16px 28px",background:"#12121e",borderRadius:12,border:"1px solid #1a1a2a"},
  statN:{fontSize:28,fontWeight:800,color:"#FF6B35"},statL:{fontSize:12,color:"#888",marginTop:4},
  startBtn:{padding:"14px 36px",fontSize:16,fontWeight:700,background:"linear-gradient(135deg,#FF6B35,#FF8F5E)",color:"#fff",border:"none",borderRadius:12,cursor:"pointer",zIndex:1,transition:"transform 0.2s",boxShadow:"0 4px 24px #FF6B3544"},
  pills:{display:"flex",flexWrap:"wrap",gap:8,marginTop:32,justifyContent:"center",maxWidth:600,zIndex:1},
  pill:{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",background:"#12121e",borderRadius:20,border:"1px solid #1a1a2a",fontSize:13,color:"#bbb"},
  back:{background:"none",border:"1px solid #2a2a3a",color:"#aaa",padding:"8px 16px",borderRadius:8,cursor:"pointer",fontSize:13},
  lvlBtn:{padding:"8px 20px",borderRadius:20,border:"1px solid #2a2a3a",background:"#12121e",color:"#aaa",cursor:"pointer",fontSize:13,fontWeight:600},
  lvlAct:{background:"#FF6B35",color:"#fff",borderColor:"#FF6B35"},
  cards:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12},
  card:{display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:"20px 16px",background:"#12121e",borderRadius:14,border:"1px solid #2a2a3a",cursor:"pointer",transition:"all 0.25s",textAlign:"center"},
  freeBtn:{padding:"10px 20px",border:"none",borderRadius:10,color:"#fff",fontWeight:700,cursor:"pointer",fontSize:14},
  dashCard:{padding:20,background:"#12121e",borderRadius:14,border:"1px solid #1a1a2a",textAlign:"center"},
  sideBtn:{width:"100%",padding:10,border:"1px solid #1a1a2a",borderRadius:8,background:"#12121e",color:"#ccc",cursor:"pointer",fontSize:13,fontWeight:600,textAlign:"left"},
  modeBtn:{padding:"5px 14px",borderRadius:8,border:"1px solid #2a2a3a",background:"#12121e",color:"#888",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"'Satoshi',sans-serif"},
  textInput:{flex:1,padding:"12px 16px",borderRadius:12,border:"1px solid #2a2a3a",background:"#12121e",color:"#f0f0f0",fontSize:14,outline:"none",fontFamily:"'Satoshi',sans-serif"},
  sendBtn:{width:44,height:44,borderRadius:12,border:"none",color:"#fff",fontSize:20,fontWeight:700,cursor:"pointer",flexShrink:0},
};

if(typeof document!=="undefined"){const st=document.createElement("style");st.textContent=`@import url('https://api.fontshare.com/v2/css?f[]=satoshi@700,400,900&display=swap');::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:#0a0a14}::-webkit-scrollbar-thumb{background:#2a2a3a;border-radius:3px}`;document.head.appendChild(st);}
