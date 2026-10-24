import"./pages-0P5Txbp4.js";import{L as y,c as f,d as b}from"./openmeteo-weather-Bj35Lj7e.js";let o=null,c=null,l=null,m=null,g=[],s="all";document.addEventListener("DOMContentLoaded",()=>{x(),$(),k(),w(),h()});function x(){const n=document.getElementById("nav-toggle"),e=document.getElementById("main-nav");n&&e&&n.addEventListener("click",()=>e.classList.toggle("open"))}function $(){if(!window.L){console.error("Leaflet library not loaded");return}o=L.map("map",{center:[-2.2,118],zoom:5,minZoom:4,maxZoom:16,scrollWheelZoom:!0}),l=L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{attribution:"Citra Satelit &copy; Esri &mdash; NASA, USGS, ESA, Earth Observatory",maxZoom:19}),m=L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",{attribution:"&copy; OpenStreetMap contributors &copy; CARTO",subdomains:"abcd",maxZoom:19}),l.addTo(o),c=l,v()}function k(){const n=document.getElementById("layer-satellite"),e=document.getElementById("layer-dark");!n||!e||(n.addEventListener("click",()=>{c!==l&&(o.removeLayer(m),l.addTo(o),c=l,n.classList.add("active"),e.classList.remove("active"))}),e.addEventListener("click",()=>{c!==m&&(o.removeLayer(l),m.addTo(o),c=m,e.classList.add("active"),n.classList.remove("active"))}))}function v(){g.forEach(e=>o.removeLayer(e)),g=[],(s==="all"?y:b(s)).forEach(e=>{const d=L.divIcon({className:"custom-leaflet-icon-wrapper",html:`
        <div class="custom-city-pin" id="pin-${e.id}">
          <span style="color: #38bdf8;">📍</span>
          <span>${e.name}</span>
          <span class="mono" id="pin-temp-${e.id}" style="color: #34d399; margin-left: 2px;">--°</span>
        </div>
      `,iconSize:[125,32],iconAnchor:[62,16]}),t=L.marker([e.lat,e.lon],{icon:d}).addTo(o),r=`
      <div style="min-width: 230px; font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px;">
          <h4 style="margin: 0; font-size: 1.05rem; font-weight: 800; color: #ffffff;">${e.name}</h4>
          <span style="font-size: 0.7rem; color: #38bdf8; font-weight: 700;">${e.region}</span>
        </div>
        <div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 8px;">
          Provinsi ${e.province} ${e.desa?"• Kel. "+e.desa:""}
        </div>
        <p style="font-size: 0.8rem; color: #cbd5e1; line-height: 1.4; margin-bottom: 10px;">
          ${e.description}
        </p>
        <div style="background: rgba(14, 165, 233, 0.12); border: 1px solid rgba(14, 165, 233, 0.3); border-radius: 6px; padding: 6px 10px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.75rem; color: #cbd5e1;">Prakiraan Langsung:</span>
          <span id="popup-temp-${e.id}" style="font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #38bdf8; font-size: 0.95rem;">Memuat...</span>
        </div>
        <div style="display: flex; gap: 6px;">
          <button id="btn-goto-${e.id}" style="flex: 1; padding: 7px 12px; background: linear-gradient(135deg, #0ea5e9, #0284c7); color: white; border: none; border-radius: 6px; font-size: 0.8rem; font-weight: 700; cursor: pointer;">
            Buka Dashboard Provinsi →
          </button>
        </div>
      </div>
    `;t.bindPopup(r),t.on("popupopen",()=>{const i=document.getElementById(`btn-goto-${e.id}`);i&&(i.onclick=()=>{localStorage.setItem("kotatangguh:selected-location",JSON.stringify(e)),window.location.href="/dashboard.html"}),f(e.lat,e.lon).then(a=>{const p=document.getElementById(`popup-temp-${e.id}`);if(p&&(a!=null&&a.current)){const u=Math.round(a.current.temperature_2m);p.textContent=`${a.current.weatherIcon||"⛅"} ${u}°C`}}).catch(()=>{})}),g.push(t),f(e.lat,e.lon).then(i=>{const a=document.getElementById(`pin-temp-${e.id}`);a&&(i!=null&&i.current)&&(a.textContent=`${Math.round(i.current.temperature_2m)}°C`)}).catch(()=>{})})}function w(){const n=document.querySelectorAll(".filter-pill");n.forEach(e=>{e.addEventListener("click",()=>{n.forEach(r=>r.classList.remove("active")),e.classList.add("active"),s=e.dataset.region,v(),h();const d={all:{center:[-2.2,118],zoom:5},Sumatera:{center:[-.5,102],zoom:6},Jawa:{center:[-7.2,110],zoom:7},"Bali & Nusa Tenggara":{center:[-8.8,118.5],zoom:7},Kalimantan:{center:[-.5,114.5],zoom:6},Sulawesi:{center:[-2,121],zoom:6},Maluku:{center:[-2.5,128.5],zoom:6},Papua:{center:[-4,137],zoom:6}},t=d[s]||d.all;o.flyTo(t.center,t.zoom,{duration:1.2})})})}function h(){const n=document.getElementById("explore-city-grid"),e=document.getElementById("matrix-count-badge");if(!n)return;const d=s==="all"?y:b(s);e&&(e.textContent=`Menampilkan ${d.length} Provinsi (${s==="all"?"Seluruh Nusantara":s})`),n.innerHTML="",d.forEach(t=>{const r=document.createElement("div");r.className="card card-glass",r.style.cursor="pointer",r.innerHTML=`
      <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
        <h4 style="margin: 0; font-size: 1.05rem; color: var(--text-pure);">${t.name}</h4>
        <span class="badge badge-source">${t.region}</span>
      </div>
      <div style="font-size: 0.8rem; color: var(--primary-light); font-weight: 600; margin-bottom: 6px;">
        Provinsi ${t.province}
      </div>
      <p style="font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.45; margin-bottom: 10px;">
        ${t.description}
      </p>
      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 8px;">
        <span style="font-size: 0.75rem; color: var(--text-muted);">Koordinat: ${t.lat.toFixed(2)}°, ${t.lon.toFixed(2)}°</span>
        <button class="btn btn-primary btn-sm" id="btn-card-dash-${t.id}">Buka Dashboard</button>
      </div>
    `,r.addEventListener("click",i=>{if(i.target.id===`btn-card-dash-${t.id}`){localStorage.setItem("kotatangguh:selected-location",JSON.stringify(t)),window.location.href="/dashboard.html";return}o.flyTo([t.lat,t.lon],11,{duration:1.2}),window.scrollTo({top:document.querySelector(".map-container-wrapper").offsetTop-90,behavior:"smooth"});const a=g.find(p=>{const u=p.getLatLng();return Math.abs(u.lat-t.lat)<.001&&Math.abs(u.lng-t.lon)<.001});a&&setTimeout(()=>a.openPopup(),700)}),n.appendChild(r)})}
