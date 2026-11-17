/* Delphi One landing — shared page behaviour.
   Ported from the "Delphi One Home Design" artifact (render → setupStages/setupHero/setupHiw/
   setupFeatures/setupReveal/setupHeaderMenu), the same way beta.delphi.one does it: the markup is
   static (src/components), this file only wires the motion and the controls. Every block checks
   that its section is on the page, so one script serves every landing. */

const PAGE = document.getElementById("main")?.classList.contains("pg-home2") ? "home2" : "other";
const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* assets the script swaps at runtime (the rotating asset in the readers hero) */
const W = { i_btc: "/images/v2/i_btc.svg", i_eth: "/images/v2/i_eth.svg", i_tsla: "/images/v2/i_tsla.webp", i_nvda: "/images/v2/i_nvda.webp", i_sol: "/images/v2/i_sol.webp", i_xrp: "/images/v2/i_xrp.webp" };

/* ---------- stages (Figma compositions scaled to the column) ---------- */
function fitStages(){
  document.querySelectorAll(".stagebox").forEach(b=>{
    const w=+b.dataset.w,h=+b.dataset.h,st=b.firstElementChild;
    if(innerWidth<1000){st.style.transform="";st.style.removeProperty("--k");st.querySelectorAll(".callout").forEach(c=>{if(c.dataset.l) c.style.left=c.dataset.l+"px"});b.style.height="";return}
    const s=Math.min(1,b.clientWidth/w);
    st.style.transform=`translateX(${Math.max(0,(b.clientWidth-w*s)/2)}px) scale(${s})`;
    st.style.setProperty("--k",(1/s).toFixed(4));
    st.querySelectorAll(".callout").forEach(c=>{ if(!c.dataset.l) c.dataset.l=parseFloat(c.style.left)||0; const l=+c.dataset.l, nw=Math.round(280*Math.min(1/s,1.15));
      c.style.left=(l+140<w/2 ? l+280-nw : l)+"px" });
    b.style.height=(h*s)+"px";
  });
}
function setupStages(){
  if(!document.querySelector(".stagebox")) return;
  const ro=new ResizeObserver(()=>fitStages());
  document.querySelectorAll(".stagebox").forEach(b=>ro.observe(b));
  fitStages();
}

/* a faded-out layer keeps its links out of the tab order, so keyboard focus never lands on something invisible (a11y) */
function focusable(layer,on){ layer.querySelectorAll("a,button").forEach(a=>{ if(on) a.removeAttribute("tabindex"); else a.setAttribute("tabindex","-1") }) }

/* ---------- hero: scroll-driven like beta.delphi.one (eased progress, lerp .11) ---------- */
function setupHero(){
  const hero=document.getElementById("hero"), stageEl=document.getElementById("heroStage"), art=document.getElementById("art");
  if(!hero) return;
  const stars=document.getElementById("stars");
  let seed=20260817; const rnd=()=>(seed=(seed*1664525+1013904223)%4294967296)/4294967296;
  let h=""; for(let i=0;i<110;i++){const c=(.9+rnd()*1.8).toFixed(2);h+=`<span class="star" style="left:${(rnd()*100).toFixed(2)}%;top:${(rnd()*100).toFixed(2)}%;width:${c}px;height:${c}px;--o:${(.18+rnd()*.7).toFixed(2)};animation-delay:${(rnd()*6).toFixed(2)}s;animation-duration:${(2.6+rnd()*3.6).toFixed(2)}s"></span>`} stars.innerHTML=h;
  const copy=document.getElementById("hCopy"), winEl=document.getElementById("hWin"), cta=document.getElementById("hCta2"), hint=document.getElementById("hHint");
  const bgA=stageEl.querySelector(".hbg-a"), bgB=stageEl.querySelector(".hbg-b");
  const cards=[...stageEl.querySelectorAll(".h-card")];
  const hdr=document.getElementById("hdr");
  const reduce=REDUCE;
  const mobile=()=>innerWidth<=900;
  const cl=v=>Math.max(0,Math.min(1,v)), ease=t=>1-Math.pow(1-t,3);
  let target=0,cur=0,raf=null;
  function scale(){ if(mobile()){art.style.removeProperty("--s");art.style.removeProperty("--hy");return}
    const s=Math.min(stageEl.clientWidth/1920,stageEl.clientHeight/1080); art.style.setProperty("--s",s.toFixed(4));
    if(hint&&cta){ const sr=stageEl.getBoundingClientRect(), top=hdr.offsetHeight+hdr.offsetTop, at=art.getBoundingClientRect().top-sr.top;
      const hg=parseFloat(getComputedStyle(art).getPropertyValue("--hg"))||64, hy=((top+sr.height-2*at)/s-(328-hg/s-hint.offsetHeight)-((PAGE==="home2"?776+hg/s:843)+cta.offsetHeight))/2; art.style.setProperty("--hy",hy.toFixed(1)+"px") } }
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(()=>{ if(document.getElementById("heroStage")===stageEl) scale() });
  function progress(){const r=hero.getBoundingClientRect(); const run=hero.offsetHeight-stageEl.offsetHeight; return run<=0?0:cl(-r.top/run)}
  if(hero.classList.contains("static")){
    const onS=()=>hdr.classList.toggle("solid",hero.getBoundingClientRect().bottom<=hdr.offsetHeight+60), onR=()=>{scale();onS()};
    scale(); onS(); addEventListener("scroll",onS,{passive:true}); addEventListener("resize",onR);
    return;
  }
  function paint(p){
    if(mobile()){[copy,winEl,cta,hint,bgA,bgB,stars,...cards].forEach(e=>{e.style.opacity="";e.style.transform="";focusable(e,true)});return}
    const out=ease(cl((p-.04)/.3));
    copy.style.opacity=1-out; copy.style.transform=`translateY(${-140*out}px)`; copy.style.pointerEvents=out>.6?"none":"";
    focusable(copy,out<=.6);
    const hk=ease(cl((p-.42)/.22)); hint.style.opacity=hk; hint.style.transform=`translateY(${(1-hk)*30}px)`;
    const w=ease(cl((p-.08)/.55));
    winEl.style.transform=`translateY(${(1-w)*900}px) scale(${1.18-.18*w})`;
    const b=cl((p-.18)/.45); bgA.style.opacity=1-b; bgB.style.opacity=b; stars.style.opacity=b;
    bgB.style.transform=`scale(${1.04+.04*(1-b)})`;
    cards.forEach((c,i)=>{const k=ease(cl((p-.5-i*.06)/.22)); c.style.opacity=k; c.style.transform=`translate(${(1-k)*100*c.dataset.side}px,${(1-k)*30}px)`; c.style.pointerEvents=k>.5?"":"none"; focusable(c,k>.5)});
    const k=ease(cl((p-.74)/.16)); cta.style.opacity=k; cta.style.transform=`translate(-50%,${(1-k)*30}px)`; cta.style.pointerEvents=k>.5?"":"none"; focusable(cta,k>.5);
  }
  function tick(){const d=target-cur; if(Math.abs(d)<4e-4){cur=target;paint(cur);raf=null;return} cur+=d*.11; paint(cur); raf=requestAnimationFrame(tick)}
  function onScroll(){
    target=reduce?1:progress();
    if(raf===null) raf=requestAnimationFrame(tick);
    const solid=hero.getBoundingClientRect().bottom<=hdr.offsetHeight+60;
    hdr.classList.toggle("solid",solid);
  }
  /* each side's two cards stack with a fixed 24px gap, whatever their text length */
  const stack=()=>{ if(mobile()||cards.length<4) return; const s=parseFloat(art.style.getPropertyValue("--s"))||1; [[0,1],[2,3]].forEach(([a,b])=>{cards[b].style.top=(parseFloat(getComputedStyle(cards[a]).top)+cards[a].offsetHeight+24/s)+"px"}) };
  const cro=new ResizeObserver(stack); cards.forEach(c=>cro.observe(c));
  function onResize(){scale(); stack(); onScroll()}
  scale(); stack(); cur=target=reduce?1:progress(); paint(cur); onScroll();
  addEventListener("scroll",onScroll,{passive:true}); addEventListener("resize",onResize);
}


/* ---------- readers hero: rotating asset, per-character swap ---------- */
const ASSETROT=[["Bitcoin","#F7931A","i_btc"],["Ethereum","#8198F5","i_eth"],["Tesla","#FF4B4F","i_tsla"],["Nvidia","#9BD62F","i_nvda"],["Solana","#14F195","i_sol"],["XRP","#F5F5F7","i_xrp"]];
function setupRotation(){
  const el=document.getElementById("assetRot"); if(!el) return;
  const nm=el.querySelector(".nm"), ic=el.querySelector(".ic");
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  let i=0;
  const set=n=>{const [name,color,key]=ASSETROT[n]; nm.innerHTML=[...name].map((c,j)=>`<span class="ch" style="--i:${j};--r:${name.length-1-j}">${c}</span>`).join(""); el.style.setProperty("--ac",color); ic.src=W[key]};
  set(0);
  setInterval(()=>{
    const out=(ASSETROT[i][0].length-1)*26+220; i=(i+1)%ASSETROT.length;
    if(reduce){set(i);return}
    el.classList.add("swapping"); setTimeout(()=>{set(i);el.classList.remove("swapping")},out);
  },3000);
}

/* active step = the one crossing the middle of the screen; the pinned picture follows it */
/* active step = the one whose text sits closest to the pinned picture's centre (or the screen's centre when the picture is hidden).
   Measured on every scroll, so the step in front of the reader is always the lit one, whatever the scroll speed or jump. */
function setupHiw(){
  const sec=document.getElementById("how"); if(!sec||!sec.querySelector(".hiw-step")) return;
  const steps=[...sec.querySelectorAll(".hiw-step")], panels=[...sec.querySelectorAll(".hiw-panel")], dots=[...sec.querySelectorAll(".hiw-dots i")], stk=document.getElementById("hiwSticky");
  let cur=-1;
  const setActive=i=>{if(i===cur) return; cur=i; steps.forEach((s,j)=>s.classList.toggle("on",j===i));panels.forEach((p,j)=>p.classList.toggle("on",j===i));dots.forEach((d,j)=>d.classList.toggle("on",j===i))};
  const pick=()=>{
    const im=stk&&stk.querySelector(".hiw-img"), ir=im&&im.getBoundingClientRect();
    const ref=ir&&ir.height?ir.top+ir.height/2:innerHeight/2;
    let best=0,bd=Infinity;
    steps.forEach((s,j)=>{const a=s.firstElementChild.getBoundingClientRect(), z=s.querySelector(".checks").getBoundingClientRect(); const d=Math.abs((a.top+z.bottom)/2-ref); if(d<bd){bd=d;best=j}});
    setActive(best);
  };
  let raf=0; const onScroll=()=>{if(!raf) raf=requestAnimationFrame(()=>{raf=0;pick()})};
  const place=()=>{const off=112; const h=stk.offsetHeight; stk.style.setProperty("--stk",Math.max(off+16,off+(innerHeight-off-h)/2)+"px"); const im=sec.querySelector(".hiw-img"); if(im) sec.style.setProperty("--hiw-img-h",im.offsetHeight+"px"); pick()};
  place();
  addEventListener("scroll",onScroll,{passive:true}); addEventListener("resize",place);
}

/* ---------- horizontal card rails (Research, Trade) ---------- */
function setupRails(){
  document.querySelectorAll(".fcar").forEach(r=>{
    const tr=r.querySelector(".fcar-track"), cards=[...tr.children], prev=r.querySelector('.cbtn[data-dir="-1"]'), next=r.querySelector('.cbtn[data-dir="1"]'), cnt=r.querySelector(".cnt");
    const idx=()=>{let best=0,bd=1e9; const l=tr.getBoundingClientRect().left+parseFloat(getComputedStyle(tr).paddingLeft); cards.forEach((c,i)=>{const d=Math.abs(c.getBoundingClientRect().left-l); if(d<bd){bd=d;best=i}}); return best};
    const upd=()=>{const i=idx(); cnt.textContent=`${i+1} / ${cards.length}`; prev.disabled=tr.scrollLeft<4; next.disabled=tr.scrollLeft+tr.clientWidth>=tr.scrollWidth-4};
    const goTo=i=>{const c=cards[Math.max(0,Math.min(cards.length-1,i))]; tr.scrollTo({left:c.offsetLeft-parseFloat(getComputedStyle(tr).paddingLeft),behavior:REDUCE?"auto":"smooth"})};
    prev.addEventListener("click",()=>goTo(idx()-1)); next.addEventListener("click",()=>goTo(idx()+1));
    tr.addEventListener("scroll",upd,{passive:true}); upd();
  });
}

/* ---------- "Which one are you?": the switch picks the personas and the CTA under them ---------- */
function setupCaseSwitch(){
  const cs=document.getElementById("caseSwitch"); if(!cs) return;
  const btns=[...cs.querySelectorAll(".cs-opt")], panes=[...document.querySelectorAll(".cs-pane")];
  const pick=i=>{cs.style.setProperty("--x",i); btns.forEach((b,j)=>{b.setAttribute("aria-selected",j===i); b.tabIndex=j===i?0:-1}); panes.forEach((p,j)=>{p.classList.toggle("on",j===i); p.hidden=j!==i}); document.querySelectorAll(".case-lab").forEach((l,j)=>{l.hidden=j!==i})};
  pick(0);
  btns.forEach((b,i)=>{
    b.addEventListener("click",()=>pick(i));
    b.addEventListener("keydown",e=>{ const n=btns.length, to={ArrowRight:(i+1)%n,ArrowLeft:(i-1+n)%n,Home:0,End:n-1}[e.key]; if(to===undefined) return; e.preventDefault(); pick(to); btns[to].focus() });
  });
}

/* ---------- reveal on scroll ---------- */
function setupReveal(){
  const els=[...document.querySelectorAll(".rv")];
  const vh=innerHeight;
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.remove("pre");io.unobserve(e.target)}}),{rootMargin:"0px 0px -8% 0px"});
  els.forEach(el=>{ if(el.getBoundingClientRect().top>vh){el.classList.add("pre");io.observe(el)} });
  const sio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");sio.unobserve(e.target)}}),{threshold:.2});
  document.querySelectorAll(".stagebox").forEach(b=>{ if(b.getBoundingClientRect().top<vh) b.classList.add("in"); else sio.observe(b) });
}

/* ---------- header: burger, use-cases dropdown, in-page anchors ---------- */
function setupHeaderMenu(){
  const b=document.getElementById("burger"), n=document.getElementById("nav");
  const setOpen=o=>{ if(!n) return; n.classList.toggle("open",o); b&&b.setAttribute("aria-expanded",o) };
  b&&b.addEventListener("click",()=>setOpen(!n.classList.contains("open")));
  const dd=document.getElementById("ddCases");
  if(dd){ const btn=dd.querySelector(".dd-btn");
    btn.addEventListener("click",e=>{e.stopPropagation(); const o=!dd.classList.contains("open"); dd.classList.toggle("open",o); btn.setAttribute("aria-expanded",o)});
    document.addEventListener("click",e=>{ if(!dd.contains(e.target)){dd.classList.remove("open"); btn.setAttribute("aria-expanded","false")} });
    dd.addEventListener("keydown",e=>{ if(e.key==="Escape"){dd.classList.remove("open"); btn.focus()} });
  }
  /* same-page links scroll smoothly and close the mobile menu */
  document.addEventListener("click",e=>{
    const a=e.target.closest("a[href]"); if(!a||a.target==="_blank"||a.origin!==location.origin||a.pathname!==location.pathname) return;
    const t=a.hash&&document.getElementById(decodeURIComponent(a.hash.slice(1))); if(a.hash&&!t) return;
    e.preventDefault(); const behavior=REDUCE?"auto":"smooth";
    if(t){ t.scrollIntoView({behavior,block:"start"}); history.replaceState(null,"",a.hash); if(!t.hasAttribute("tabindex")) t.setAttribute("tabindex","-1"); t.focus({preventScroll:true}) } else scrollTo({top:0,behavior});
    setOpen(false);
  });
}

/* ---------- live ticker prices (served by the site's /api/ticker; the markup keeps static fallbacks) ---------- */
function setupTicker(){
  if(!document.querySelector(".tk-item[data-sym]")) return;
  fetch("/api/ticker").then(r=>r.ok?r.json():Promise.reject()).then(d=>{
    document.querySelectorAll(".tk-item[data-sym]").forEach(it=>{ const q=d[it.dataset.sym]; if(!q) return; const up=q.pct>=0, dir=it.querySelector(".tk-dir");
      it.querySelector(".tk-px").textContent="$"+q.price.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}); dir.className="tk-dir "+(up?"up":"down"); dir.textContent=up?"↑":"↓" });
  }).catch(()=>{});
}

/* ---------- boot ---------- */
setupStages(); setupHero(); setupHiw(); setupRotation(); setupRails(); setupCaseSwitch(); setupReveal(); setupHeaderMenu(); setupTicker();
document.documentElement.classList.remove("hero-loading");
if(location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
