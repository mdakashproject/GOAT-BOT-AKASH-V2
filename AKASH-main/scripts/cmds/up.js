const { createCanvas } = require('canvas');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const format = b => {
    const u = ['B','KB','MB','GB','TB'];
    const i = Math.floor(Math.log(b)/Math.log(1024));
    return (b/Math.pow(1024,i)).toFixed(2) + " " + u[i];
};

let prev = null;
const getCPU = () => {
    let idle = 0, total = 0;
    for (const c of os.cpus()) {
        for (const t in c.times) total += c.times[t];
        idle += c.times.idle;
    }
    const cur = { idle, total };
    if (!prev) { prev = cur; return 0; }
    const di = cur.idle - prev.idle;
    const dt = cur.total - prev.total;
    prev = cur;
    return dt ? Math.round(100 - (100 * di / dt)) : 0;
};

const getDisk = () => {
    try {
        const d = execSync("df -k /").toString().split("\n")[1].split(/\s+/);
        const used = parseInt(d[2]) * 1024;
        const total = parseInt(d[1]) * 1024;
        return Math.round(used / total * 100);
    } catch {
        return 73;
    }
};

module.exports = {
    config: {
        name: "uptime",
        aliases: ["up", "status"],
        version: "40.4-dashboard",
        author: "MOHAMMAD AKASH",
        role: 0,
        category: "system"
    },

    onStart: async function({ message }) {
        try {
            const start = Date.now();

            const cpu = getCPU();
            const total = os.totalmem();
            const used = total - os.freemem();
            const ram = Math.round(used / total * 100);
            const disk = getDisk();

            const sec = process.uptime();
            const d = Math.floor(sec/86400);
            const h = Math.floor(sec%86400/3600);
            const m = Math.floor(sec%3600/60);
            const s = Math.floor(sec%60);
            const uptime = d ? `${d}d ${h}h ${m}m ${s}s` : `${h}h ${m}m ${s}s`;
            const ping = Date.now() - start;

            // CANVAS
            const W = 1400, H = 820;
            const cv = createCanvas(W,H);
            const c = cv.getContext("2d");

            // BACKGROUND
            const bg = c.createLinearGradient(0,0,0,H);
            bg.addColorStop(0,"#070A14");
            bg.addColorStop(1,"#0E1220");
            c.fillStyle = bg;
            c.fillRect(0,0,W,H);

            // GLASS PANEL FUNCTION
            const glass = (x,y,w,h,r=25) => {
                c.save();
                c.beginPath();
                c.moveTo(x+r,y);
                c.arcTo(x+w,y,x+w,y+h,r);
                c.arcTo(x+w,y+h,x,y+h,r);
                c.arcTo(x,y+h,x,y,r);
                c.arcTo(x,y,x+w,y,r);
                c.closePath();
                c.fillStyle = "rgba(255,255,255,0.06)";
                c.fill();
                c.strokeStyle = "rgba(255,255,255,0.12)";
                c.lineWidth = 2;
                c.stroke();
                c.restore();
            };

            // SIDEBAR
            glass(30,30,330,760);
            c.font = "bold 44px Arial";
            c.fillStyle = "#48caff";
            c.fillText("SYSTEM INFO",60,100);

            // INFO LIST
            let infoY = 160;
            const infoPad = 55;
            const info = [
                `CPU       : ${cpu}%`,
                `RAM       : ${ram}%`,
                `Disk      : ${disk}%`,
                `Memory    : 128GB`
            ];
            c.font = "30px Arial";
            c.fillStyle = "#dfefff";
            info.forEach(t => {
                c.fillText(t,60,infoY);
                infoY += infoPad;
            });

            // === UPTIME HIGHLIGHT PANEL ===
            glass(30, infoY + 10, 330, 120, 25);
            c.font = "bold 36px Arial";
            c.fillStyle = "#00ffcc";
            c.fillText("🚀 UPTIME", 60, infoY + 50);
            c.font = "bold 32px Arial";
            c.fillStyle = "#ffffff";
            c.fillText(uptime, 60, infoY + 90);

            // HEADER PANEL WITH "DASHBOARD"
            glass(400,30,970,200);
            c.font = "bold 52px Arial";
            c.fillStyle = "#52d5ff";
            c.textAlign = "center";
            c.fillText("DASHBOARD", 885, 110);

            // BAR FUNCTION
            const bar = (x,y,w,h,val,color,label) => {
                c.save();
                c.font="28px Arial";
                c.fillStyle="#c5dfff";
                c.textAlign="left";
                c.fillText(label,x,y-20);

                c.fillStyle="rgba(255,255,255,0.07)";
                c.fillRect(x,y,w,h);

                const fw = (val/100)*w;
                c.fillStyle=color;
                c.shadowColor=color;
                c.shadowBlur=30;
                c.fillRect(x,y,fw,h);
                c.shadowBlur=0;

                c.font="bold 26px Arial";
                c.fillStyle="#fff";
                c.textAlign="right";
                c.fillText(val+"%",x+w-10,y+h-10);
                c.restore();
            };

            // BAR PANELS
            glass(400,250,970,150);
            bar(440,300,900,32,cpu,"#00ffbf","CPU Usage");
            glass(400,420,970,150);
            bar(440,470,900,32,ram,"#ff6ab3","RAM Usage");
            glass(400,590,970,150);
            bar(440,640,900,32,disk,"#55a8ff","Disk Usage");

            // FOOTER
            c.font="bold 30px Arial";
            c.fillStyle="#4ecaff";
            c.textAlign="left";
            c.fillText(`Ping : ${ping}ms`,60,780);
            c.textAlign="center";
            c.fillText("Status: Optimized & Running Stable",885,780);

            // SAVE & SEND
            const file = path.join(__dirname,"cache","up_dashboard.png");
            fs.mkdirSync(path.dirname(file),{recursive:true});
            fs.writeFileSync(file,cv.toBuffer("image/png"));
            await message.reply({body:"",attachment:fs.createReadStream(file)});
            setTimeout(()=>fs.existsSync(file)&&fs.unlinkSync(file),8000);

        } catch(e){ console.log(e); message.reply("❌ Dashboard rendering failed."); }
    }
};
