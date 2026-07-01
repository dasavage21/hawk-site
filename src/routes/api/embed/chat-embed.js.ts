import { createAPIFileRoute } from "@tanstack/react-start/api";

/**
 * GET /api/embed/chat-embed.js — Self-contained chat widget embed script.
 *
 * Generated websites include this as a <script> tag.
 * The widget reads businessId and industry from a data attribute on a container div.
 */
export const Route = createAPIFileRoute("/api/embed/chat-embed.js")({
  GET: async () => {
    const js = makeEmbedScript();
    return new Response(js, {
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  },
});

/** Generate the embed script as a string for inline use or serving */
export function makeEmbedScript(): string {
  return `(function(){'use strict';
var c=document.getElementById('localamp-chat');
if(!c)return;
var bid=c.getAttribute('data-business-id'),ind=c.getAttribute('data-industry')||'generic';
var s=document.createElement('style');
s.textContent='#lac-w{z-index:2147483647;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}#lac-w *{box-sizing:border-box;margin:0;padding:0}.lac-b{position:fixed;bottom:16px;right:16px;z-index:2147483647;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#4f46e5,#7c3aed);border:none;cursor:pointer;box-shadow:0 4px 20px rgba(79,70,229,.4);display:flex;align-items:center;justify-content:center;transition:transform .2s}.lac-b:hover{transform:scale(1.1)}.lac-w{position:fixed;bottom:16px;right:16px;z-index:2147483647;width:360px;max-width:calc(100vw - 32px);background:#fff;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,.15);border:1px solid #e5e7eb;display:none;flex-direction:column;max-height:calc(100vh - 120px)}.lac-w.o{display:flex}.lac-h{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;padding:12px 16px;border-radius:16px 16px 0 0;display:flex;align-items:center;justify-content:space-between}.lac-hl{display:flex;align-items:center;gap:8px}.lac-a{width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700}.lac-ht{font-size:14px;font-weight:600}.lac-hs{font-size:11px;opacity:.7}.lac-x{background:0;border:none;color:#fff;cursor:pointer;padding:4px;border-radius:8px}.lac-x:hover{background:rgba(255,255,255,.2)}.lac-m{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:8px;height:320px}.lac-msg{max-width:80%;padding:10px 14px;border-radius:16px;font-size:14px;line-height:1.4}.lac-msg.b{background:#f3f4f6;color:#1f2937;align-self:flex-start;border-bottom-left-radius:4px}.lac-msg.u{background:#4f46e5;color:#fff;align-self:flex-end;border-bottom-right-radius:4px}.lac-i{border-top:1px solid #e5e7eb;padding:12px;display:flex;gap:8px}.lac-t{flex:1;border:1px solid #d1d5db;border-radius:12px;padding:10px 14px;font-size:14px;outline:0}.lac-t:focus{border-color:#4f46e5;box-shadow:0 0 0 2px rgba(79,70,229,.2)}.lac-s{background:#4f46e5;border:none;color:#fff;border-radius:12px;width:40px;height:40px;cursor:pointer;display:flex;align-items:center;justify-content:center}.lac-s:hover{background:#4338ca}.lac-s:disabled{opacity:.5;cursor:not-allowed}';
document.head.appendChild(s);
var sid='lac_'+crypto.randomUUID(),open=false,init=false,msgs=[];
var b=document.createElement('button');
b.className='lac-b';
b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
var w=document.createElement('div');
w.className='lac-w';
w.innerHTML='<div class="lac-h"><div class="lac-hl"><div class="lac-a">AI</div><div><div class="lac-ht">Chat Assistant</div><div class="lac-hs">We reply instantly</div></div></div><button class="lac-x" id="lacx"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div><div class="lac-m" id="lacm"></div><div class="lac-i"><input class="lac-t" id="lact" placeholder="Type your message..."><button class="lac-s" id="lacs" aria-label="Send"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button></div>';
var h=document.createElement('div');h.id='lac-w';h.appendChild(b);h.appendChild(w);document.body.appendChild(h);
var mc=document.getElementById('lacm'),ti=document.getElementById('lact'),sb=document.getElementById('lacs'),xc=document.getElementById('lacx');
function am(r,c){msgs.push({role:r,content:c});var d=document.createElement('div');d.className='lac-msg '+(r==='user'?'u':'b');d.textContent=c;mc.appendChild(d);mc.scrollTop=mc.scrollHeight}
function st(){var d=document.createElement('div');d.className='lac-msg b';d.id='lacty';d.innerHTML='<span style="display:inline-flex;gap:4px"><span style="width:8px;height:8px;border-radius:50%;background:#9ca3af;animation:lacb 1.4s infinite both"></span><span style="width:8px;height:8px;border-radius:50%;background:#9ca3af;animation:lacb 1.4s infinite .16s both"></span><span style="width:8px;height:8px;border-radius:50%;background:#9ca3af;animation:lacb 1.4s infinite .32s both"></span></span>';mc.appendChild(d);mc.scrollTop=mc.scrollHeight}
function ht(){var e=document.getElementById('lacty');if(e)e.remove()}
function sc(){var d=document.createElement('div');d.className='lac-msg b';d.innerHTML='<strong>✅ Thanks!</strong><br><span style="font-size:13px;color:#166534">We\\'ll get back to you shortly.</span>';mc.appendChild(d);mc.scrollTop=mc.scrollHeight}
function init(){if(init)return;init=true;st();fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({businessId:bid,sessionId:sid,industry:ind})}).then(function(r){return r.json()}).then(function(d){ht();if(d.messages)d.messages.forEach(function(m){am(m.role,m.content)})}).catch(function(){ht();am('bot','Hi! How can we help you today?')})}
function sm(t){if(!t.trim())return;am('user',t);ti.value='';sb.disabled=true;st();fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({businessId:bid,sessionId:sid,industry:ind,message:t})}).then(function(r){return r.json()}).then(function(d){ht();sb.disabled=false;if(d.messages)d.messages.filter(function(m){return m.role==='bot'}).forEach(function(m){am(m.role,m.content)});if(d.leadCaptured)sc()}).catch(function(){ht();sb.disabled=false;am('bot','Sorry, connection issue. Please try again.')})}
b.addEventListener('click',function(){open=true;b.style.display='none';w.classList.add('o');init()});
xc.addEventListener('click',function(){open=false;w.classList.remove('o');b.style.display='flex'});
sb.addEventListener('click',function(){sm(ti.value)});
ti.addEventListener('keydown',function(e){if(e.key==='Enter')sm(ti.value)});
ti.addEventListener('input',function(){sb.disabled=!ti.value.trim()});
var stl=document.createElement('style');stl.textContent='@keyframes lacb{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}';document.head.appendChild(stl);
})();`;
}

/**
 * Generate the HTML snippet that businesses paste into their websites.
 * This creates the placeholder div and loads the embed script.
 */
export function generateEmbedSnippet(businessId: string, industry: string): string {
  return [
    `<!-- LocalAmp Chat Widget -->`,
    `<div id="localamp-chat" data-business-id="${businessId}" data-industry="${industry}"></div>`,
    `<script src="/api/embed/chat-embed.js" async></script>`,
  ].join("\n");
}