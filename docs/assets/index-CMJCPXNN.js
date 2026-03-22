(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))n(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const o of t.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function r(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function n(e){if(e.ep)return;e.ep=!0;const t=r(e);fetch(e.href,t)}})();const l="2009551865-w1GySXcD",d="https://line.me/R/ti/p/@209sgiku";async function c(){const s=document.getElementById("gate"),i=document.getElementById("gateCard"),r=document.getElementById("root");try{i.innerHTML="LIFF 初始化中…",await liff.init({liffId:l,withLoginOnExternalBrowser:!0}),location.hash.startsWith("#/liff-redirect")&&history.replaceState(null,"","/lottery-site-1/");const n=liff.isInClient(),e=liff.isLoggedIn();if(!e){i.innerHTML=`
          <div style="font-size:28px;font-weight:bold;">尚未登入 LIFF</div>
          <div style="margin-top:12px;">請直接從 LINE 內重新開啟這個 LIFF 連結。</div>
          <div class="debug">
isInClient: ${n}
isLoggedIn: ${e}
url: ${location.href}
          </div>
        `;return}if(!(await liff.getFriendship()).friendFlag){i.innerHTML=`
          <div style="font-size:28px;font-weight:bold;">請先加入好友</div>
          <div style="margin-top:12px;">加入官方好友後，才可以進行抽獎。</div>
          <a class="btn" href="${d}" target="_blank" rel="noopener noreferrer">
            加入好友
          </a>
        `;return}s.style.display="none",r.style.display="block"}catch(n){i.innerHTML=`
        <div style="font-size:28px;font-weight:bold;">LIFF 載入失敗</div>
        <div class="debug">
message: ${n?.message||"無"}
name: ${n?.name||"無"}
url: ${location.href}
        </div>
      `}}window.addEventListener("load",c);
//# sourceMappingURL=index-CMJCPXNN.js.map
