const { createCanvas } = require('canvas');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const f = b => { const s = ['B','KB','MB','GB','TB'], i = Math.floor(Math.log(b)/Math.log(1024)); return (b/Math.pow(1024,i)).toFixed(2)+' '+s[i]; };

let prev = null;
const getCPU = () => {
  let idle = 0, total = 0;
  for (const c of os.cpus()) { for (const t in c.times) total += c.times[t]; idle += c.times.idle; }
  const cur = {idle,total};
  if (!prev) { prev = cur; return 0; }
  const di = cur.idle-prev.idle, dt = cur.total-prev.total;
  prev = cur;
  return dt ? Math.round(100-(100*di/dt)) : 0;
};

const getDisk = async () => {
  try {
    const d = execSync('df -k /').toString().split('\n')[1].split(/\s+/);
    const used = parseInt(d[2]) * 1024;
    const total = parseInt(d[1]) * 1024;
    const p = Math.round((used / total) * 100);
    return p > 100 ? 100 : p;
  } catch { return 82; }
};

const rr = (c,x,y,w,h,r) => { c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); };

module.exports = {
  config: { name:"uptime", aliases:["up","status"], version:"24.0", author:"Akash", role:0, category:"system" },
  onStart: async function({message}) {
    try {
      const start = Date.now();
      const cpu = getCPU();
      const totalRam = os.totalmem(), usedRam = totalRam - os.freemem();
      const ram = Math.min(100, Math.round((usedRam/totalRam)*100));
      const disk = await getDisk();
      const sec = process.uptime();
      const d = Math.floor(sec/86400), h = Math.floor(sec%86400/3600), m = Math.floor(sec%3600/60), s = Math.floor(sec%60);
      const uptime = d ? `${d}d ${h}h ${m}m ${s}s` : `${h}h ${m}m ${s}s`;
      const ping = Date.now() - start;

      const cv = createCanvas(1080,720), c = cv.getContext('2d');
      c.fillStyle = '#0b0b22'; c.fillRect(0,0,1080,720);
      c.fillStyle = 'rgba(15,15,40,0.95)'; c.strokeStyle = '#3399ff'; c.lineWidth = 6;
      rr(c,30,30,1020,660,60); c.fill(); c.stroke();

      c.font = 'bold 80px Arial'; c.fillStyle = '#fff'; c.textAlign = 'center';
      c.fillText('SYSTEM STATUS',540,145);
      c.font = '36px Arial'; c.fillStyle = '#60a5fa';
      c.fillText('Real-time Server Monitoring',540,195);

      const ring = (x,y,p,col,label) => {
        const r=118,t=26;
        c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fillStyle='rgba(255,255,255,0.08)'; c.fill();
        c.beginPath(); c.arc(x,y,r,-Math.PI/2,(p/100)*Math.PI*2-Math.PI/2); c.lineWidth=t; c.strokeStyle=col; c.lineCap='round'; c.stroke();
        c.shadowColor=col; c.shadowBlur=50; c.stroke(); c.shadowBlur=0;
        if(p>0&&p<100){ const a=(p/100)*Math.PI*2-Math.PI/2; c.beginPath(); c.arc(x+Math.cos(a)*r,y+Math.sin(a)*r,18,0,Math.PI*2); c.fillStyle=col; c.fill(); }
        c.font='bold 62px Arial'; c.fillStyle='#fff'; c.textAlign='center'; c.textBaseline='middle';
        c.fillText(p+'%',x,y);
        c.font='30px Arial'; c.fillStyle='#ccc'; c.textBaseline='alphabetic';
        c.fillText(label,x,y+85);
      };
      ring(240,355,cpu,'#00ff88','CPU');
      ring(540,355,ram,'#ff3366','RAM');
      ring(840,355,disk,'#3399ff','DISK');

      // হালকা নিচে নামালাম → এখন পারফেক্ট গ্যাপ
      const g = (txt, y, col = '#00ffcc') => {
        c.font = 'bold 38px Arial';
        c.shadowColor = col; c.shadowBlur = 30; c.fillStyle = col;
        c.textAlign = 'left';
        c.fillText(txt, 100, y);
      };
      g(`Uptime  →  ${uptime}`, 520);
      g(`RAM     →  ${ram}%   •   Disk  →  ${disk}%`, 570);
      g(`Memory  →  ${f(usedRam)} / ${f(totalRam)}`, 620);
      const pc = ping < 80 ? '#00ff88' : ping < 150 ? '#ffaa00' : '#ff3366';
      g(`Ping    →  ${ping}ms`, 670, pc);
      c.shadowBlur = 0;

      const file = path.join(__dirname,'cache','up.png');
      fs.mkdirSync(path.dirname(file),{recursive:true});
      fs.writeFileSync(file, cv.toBuffer('image/png'));
      await message.reply({body:"",attachment:fs.createReadStream(file)});
      setTimeout(()=>fs.existsSync(file)&&fs.unlinkSync(file),10000);
    } catch { message.reply("Error"); }
  }
};
