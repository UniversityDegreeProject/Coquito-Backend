import{c as o,r as c,a as l,j as e}from"./index-DlArgOZR.js";const n=[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]],d=o("loader-circle",n),x=c.memo(({title:a,message:s="Por favor, espere un momento...",minHeightClass:t="min-h-[350px]"})=>{const{isDark:r,colors:i}=l();return e.jsx("div",{className:`
        w-full flex items-center justify-center
        rounded-xl shadow-sm border
        ${r?"bg-[#1E293B]/50 border-[#334155]/50":"bg-white/50 border-white/50"}
        transition-all duration-300
        ${t} 
      `,"aria-label":a,role:"status",children:e.jsxs("div",{className:"flex flex-col items-center gap-4 text-center p-4",children:[e.jsx(d,{className:`
            w-12 h-12 animate-spin 
            ${r?"text-[#F59E0B]":"text-[#275081]"}
          `,"aria-hidden":"true"}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:`text-xl font-bold ${i.text.primary}`,children:a}),e.jsx("p",{className:`${r?"text-[#94A3B8]":"text-gray-600"}`,children:s})]})]})})});x.displayName="GenericGridLoader";export{x as G,d as L};
