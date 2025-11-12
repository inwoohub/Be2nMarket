// src/components/SnowFX.jsx
import { useEffect, useRef } from "react";

export default function SnowFX() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const c = canvasRef.current;
        if (!c) return;
        const x = c.getContext("2d");

        let stop = false; // 접근성 설정을 존중하려면 matchMedia 코드로 바꿔도 됨
        const dpr = () => Math.max(1, Math.min(2, window.devicePixelRatio || 1));
        let W=0, H=0, ratio=1, flakes=[], raf=0;
        const CFG = { density:0.8, sizeMin:1.2, sizeMax:3.2, speedMin:18, speedMax:42, drift:-12, windJitter:10, alpha:.92, shadow:"#00000022" };

        const s = c.style;
        s.position="fixed"; s.left=0; s.top=0; s.width="100vw"; s.height="100vh";
        s.pointerEvents="none"; s.zIndex=9999; s.opacity=".95";

        const rnd=(a,b)=>a+Math.random()*(b-a);
        const make=(spawnTop)=>({ x:rnd(0,W), y:spawnTop?rnd(-H,0):rnd(0,H), r:rnd(CFG.sizeMin,CFG.sizeMax),
            v:rnd(CFG.speedMin,CFG.speedMax)/60, drift:rnd(CFG.drift,CFG.drift+CFG.windJitter)/60, phase:Math.random()*Math.PI*2 });

        function resize(){
            ratio=dpr(); W=window.innerWidth; H=window.innerHeight;
            c.width=W*ratio; c.height=H*ratio; x.setTransform(ratio,0,0,ratio,0,0);
            const target=Math.floor((W*H)/8000*CFG.density);
            if (flakes.length<target) for(let i=flakes.length;i<target;i++) flakes.push(make(true));
            else flakes.length=target;
        }
        function step(){
            x.clearRect(0,0,W,H);
            x.globalAlpha=CFG.alpha; x.fillStyle="rgba(255,255,255,1)";
            x.shadowColor=CFG.shadow; x.shadowBlur=6; x.shadowOffsetY=1;
            for (let f of flakes){
                f.phase+=0.02; f.x+=f.drift+Math.sin(f.phase)*0.3; f.y+=f.v;
                if (f.x<-20) f.x=W+20; if (f.x>W+20) f.x=-20;
                if (f.y>H+10){ f.x=rnd(0,W); f.y=rnd(-40,-10); f.v=rnd(CFG.speedMin,CFG.speedMax)/60; }
                x.beginPath(); x.arc(f.x,f.y,f.r,0,Math.PI*2); x.fill();
            }
            if (!stop) raf=requestAnimationFrame(step);
        }
        function start(){ if (stop) return; cancelAnimationFrame(raf); raf=requestAnimationFrame(step); }

        const onResize=()=>resize();
        window.addEventListener("resize", onResize, { passive:true });

        resize(); start();

        return () => {
            stop = true;
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", onResize);
        };
    }, []);

    return <canvas id="snowfx" ref={canvasRef} />;
}
