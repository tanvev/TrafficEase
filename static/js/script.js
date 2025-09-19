document.addEventListener('DOMContentLoaded', () => {
    const routeBoxes = document.querySelectorAll('.border-2, .border');
    const waitTimeEl = document.querySelector('.text-xl.font-bold.text-white');

    // Chart.js setup inside Authority Dashboard
    const ctx = document.getElementById('trafficChart').getContext('2d');
    window.trafficChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                { label: 'Lane 1', data: [], borderColor: '#34D399', backgroundColor: 'rgba(52,211,153,0.2)', tension: 0.3 },
                { label: 'Lane 2', data: [], borderColor: '#60A5FA', backgroundColor: 'rgba(96,165,250,0.2)', tension: 0.3 },
                { label: 'Lane 3', data: [], borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.2)', tension: 0.3 }
            ]
        },
        options: { responsive: true, animation: { duration: 0 } }
    });

    // Fetch traffic every 2 seconds
    async function updateTraffic() {
        const res = await fetch('/api/traffic');
        const traffic = await res.json();

        // Highlight fastest lane
        const lanes = [traffic.lane1, traffic.lane2, traffic.lane3];
        const minTraffic = Math.min(...lanes);
        routeBoxes.forEach((box, i) => {
            box.style.borderColor = (lanes[i] === minTraffic) ? '#34D399' : '';
        });
        if(waitTimeEl) waitTimeEl.textContent = `${minTraffic + 5} min`;

        // Update chart
        const time = new Date().toLocaleTimeString();
        window.trafficChart.data.labels.push(time);
        window.trafficChart.data.datasets[0].data.push(traffic.lane1);
        window.trafficChart.data.datasets[1].data.push(traffic.lane2);
        window.trafficChart.data.datasets[2].data.push(traffic.lane3);

        if(window.trafficChart.data.labels.length > 20){
            window.trafficChart.data.labels.shift();
            window.trafficChart.data.datasets.forEach(ds => ds.data.shift());
        }
        window.trafficChart.update();
    }

    setInterval(updateTraffic, 2000);

    // Vehicle simulation
    const mapPanel = document.querySelector('#authority-portal .bg-slate-900/50');
    const vehicleContainer = document.createElement('div');
    vehicleContainer.className = 'absolute top-0 left-0 w-full h-full';
    mapPanel.appendChild(vehicleContainer);

    const lanesY = [50, 150, 250]; // Y positions of lanes
    const vehicles = [];

    // Initialize vehicles
    for(let i=0; i<9; i++){
        const div = document.createElement('div');
        div.className = 'w-6 h-6 bg-red-500 rounded-full absolute';
        div.style.left = `${Math.random() * 500}px`;
        div.style.top = `${lanesY[i % 3]}px`;
        vehicleContainer.appendChild(div);
        vehicles.push({el: div, lane: i % 3, speed: 1 + Math.random()});
    }

    function animateVehicles(){
        vehicles.forEach(v => {
            let left = parseFloat(v.el.style.left);
            left += v.speed;
            if(left > 500) left = -10; // loop
            v.el.style.left = left + 'px';
        });
        requestAnimationFrame(animateVehicles);
    }
    animateVehicles();
});

// --- Fetch traffic from backend ---
async function updateTrafficData(){
    try{
        const res = await fetch('/api/traffic');
        const data = await res.json();
        // Update chart
        trafficChart.data.datasets[0].data = [data.lane1,data.lane2,data.lane3];
        trafficChart.update();
        // Update dashboard stats
        document.getElementById('congestionLevel').textContent = data.congestion_level + '%';
        document.getElementById('avgWaitTime').textContent = data.avg_wait_time + ' s';
        document.getElementById('violationsToday').textContent = data.violations_today;
    }catch(err){
        console.error('Error fetching traffic data', err);
    }
}

// Update every 2 seconds
setInterval(updateTrafficData,2000);
updateTrafficData();

// Driver Portal Update
async function updateDriverPortal(){
    try{
        const res = await fetch('/api/driver');
        const data = await res.json();
        // Update wait time & alternate routes
        document.querySelector('#driver-portal .wait-time').textContent = data.wait_time + ' min';
        document.querySelector('#driver-portal .alt-routes').textContent = data.alt_routes + ' available';

        // Update routes list
        const routesContainer = document.querySelector('#driver-portal .routes-container');
        routesContainer.innerHTML = ''; // clear old
        data.routes.forEach(route=>{
            const div = document.createElement('div');
            div.className = `border p-3 rounded-lg cursor-pointer ${
                route.name==='Fastest Route' ? 'border-emerald-500 bg-emerald-500/10':'bg-slate-900/50'
            }`;
            div.innerHTML = `
                <div class="flex justify-between">
                    <div>
                        <p class="font-bold">${route.name}</p>
                        <p class="text-sm">Distance: ${route.distance} km</p>
                        <p class="text-sm">Traffic: ${route.traffic}</p>
                    </div>
                    <div class="text-right">
                        <p class="font-bold">${route.time} min</p>
                        <p class="text-xs text-green-400">${route.green_waves} green waves</p>
                    </div>
                </div>`;
            routesContainer.appendChild(div);
        });

        // Highlight fastest lane
        const lanes = data.lanes;
        let minLane = Object.keys(lanes).reduce((a,b)=>lanes[a]<lanes[b]?a:b);
        document.querySelectorAll('#driver-portal .lane-indicator').forEach(l=>{
            if(l.dataset.lane===minLane) l.classList.add('bg-green-500');
            else l.classList.remove('bg-green-500');
        });

    }catch(err){console.error(err);}
}
setInterval(updateDriverPortal,2000);
updateDriverPortal();

async function updateEmergencyPortal(){
    try{
        const res = await fetch('/api/emergency');
        const data = await res.json();
        const statusEl = document.querySelector('#emergency-portal .status-text');
        statusEl.textContent = data.status;
        if(data.status==='Active'){
            statusEl.classList.remove('text-emerald-400');
            statusEl.classList.add('text-red-400');
        }else{
            statusEl.classList.remove('text-red-400');
            statusEl.classList.add('text-emerald-400');
        }
    }catch(err){console.error(err);}
}
setInterval(updateEmergencyPortal,2000);
updateEmergencyPortal();

// Traffic Simulation
const canvas = document.getElementById('traffic-simulation');
const ctx = canvas.getContext('2d');

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const lanesY = [50, 100, 150]; // Y positions for 3 lanes
const laneCount = lanesY.length;

class Vehicle {
    constructor(lane){
        this.lane = lane;
        this.x = Math.random() * canvas.width;
        this.speed = 1 + Math.random() * 2;
        this.color = ['#34d399','#60a5fa','#f87171'][lane];
        this.width = 20;
        this.height = 10;
    }
    move(lanesTraffic){
        // Basic lane switching: choose fastest lane
        let minTraffic = Math.min(...lanesTraffic);
        if(lanesTraffic[this.lane] > minTraffic){
            this.lane = lanesTraffic.indexOf(minTraffic);
        }
        this.x += this.speed;
        if(this.x>canvas.width) this.x = -this.width;
    }
    draw(){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, lanesY[this.lane]-this.height/2, this.width, this.height);
    }
}

let vehicles = [];
for(let i=0;i<15;i++){
    vehicles.push(new Vehicle(Math.floor(Math.random()*laneCount)));
}

function animateSimulation(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Draw lanes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    lanesY.forEach(y=>{
        ctx.beginPath();
        ctx.moveTo(0,y);
        ctx.lineTo(canvas.width,y);
        ctx.stroke();
    });

    // Get current lane traffic from driver API (mocked here)
    let lanesTraffic = [0,0,0];
    vehicles.forEach(v=>lanesTraffic[v.lane]++);

    // Move & draw vehicles
    vehicles.forEach(v=>{
        v.move(lanesTraffic);
        v.draw();
    });

    requestAnimationFrame(animateSimulation);
}
animateSimulation();
