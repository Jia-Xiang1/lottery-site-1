const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/main-iRuUzZ0V.js","assets/main-C6D-zbW_.css"])))=>i.map(i=>d[i]);
(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))o(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const n of t.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&o(n)}).observe(document,{childList:!0,subtree:!0});function c(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function o(e){if(e.ep)return;e.ep=!0;const t=c(e);fetch(e.href,t)}})();const h="modulepreload",y=function(d){return"/lottery-site-1/"+d},u={},v=function(r,c,o){let e=Promise.resolve();if(c&&c.length>0){let g=function(i){return Promise.all(i.map(a=>Promise.resolve(a).then(f=>({status:"fulfilled",value:f}),f=>({status:"rejected",reason:f}))))};document.getElementsByTagName("link");const n=document.querySelector("meta[property=csp-nonce]"),s=n?.nonce||n?.getAttribute("nonce");e=g(c.map(i=>{if(i=y(i),i in u)return;u[i]=!0;const a=i.endsWith(".css"),f=a?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${i}"]${f}`))return;const l=document.createElement("link");if(l.rel=a?"stylesheet":h,a||(l.as="script"),l.crossOrigin="",l.href=i,s&&l.setAttribute("nonce",s),document.head.appendChild(l),a)return new Promise((m,p)=>{l.addEventListener("load",m),l.addEventListener("error",()=>p(new Error(`Unable to preload CSS for ${i}`)))})}))}function t(n){const s=new Event("vite:preloadError",{cancelable:!0});if(s.payload=n,window.dispatchEvent(s),!s.defaultPrevented)throw n}return e.then(n=>{for(const s of n||[])s.status==="rejected"&&t(s.reason);return r().catch(t)})},L="2009551865-w1GySXcD",w="https://line.me/R/ti/p/@209sgiku";async function E(){await v(()=>import("./main-iRuUzZ0V.js"),__vite__mapDeps([0,1]))}async function F(){const d=document.getElementById("gate"),r=document.getElementById("gateCard"),c=document.getElementById("root");try{if(r.innerHTML="LIFF 初始化中…",typeof liff>"u")throw new Error("LIFF SDK 未載入");await liff.init({liffId:L,withLoginOnExternalBrowser:!0});const o=liff.isInClient(),e=liff.isLoggedIn();if(!e){r.innerHTML=`
              <div style="font-size:28px;font-weight:bold;">尚未登入 LIFF</div>
              <div style="margin-top:12px;">請直接從 LINE 內重新開啟這個 LIFF 連結。</div>
              <div class="debug">
isInClient: ${o}
isLoggedIn: ${e}
url: ${location.href}
              </div>
            `;return}const t=await liff.getFriendship();if(!t.friendFlag){r.innerHTML=`
              <div style="font-size:28px;font-weight:bold;">請先加入好友</div>
              <div style="margin-top:12px;">加入官方好友後，才可以進行抽獎。</div>
              <a class="btn" href="${w}" target="_blank" rel="noopener noreferrer">
                加入好友
              </a>
              <div class="debug">
friendFlag: ${t.friendFlag}
url: ${location.href}
              </div>
            `;return}d.style.display="none",c.style.display="block",await E()}catch(o){console.error("LIFF ERROR:",o),r.innerHTML=`
            <div style="font-size:28px;font-weight:bold;">LIFF 載入失敗</div>
            <div class="debug">
message: ${o?.message||"無"}
name: ${o?.name||"無"}
stack: ${o?.stack||"無"}
url: ${location.href}
userAgent: ${navigator.userAgent}
            </div>
          `}}window.addEventListener("load",F);export{v as _};
//# sourceMappingURL=index-nsOZPXZC.js.map
