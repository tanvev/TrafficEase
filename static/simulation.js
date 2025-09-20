const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

async function fetchVehicles() {
    const res = await axios.get("/api/vehicles");
    return res.data;
}

async function update() {
    await axios.get("/api/update");
    const vehicles = await fetchVehicles();
    drawVehicles(vehicles);
    requestAnimationFrame(update);
}

function drawVehicles(vehicles) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const roads = { A: 50, B: 150, C: 250, D: 350 };
    vehicles.forEach(v => {
        ctx.fillStyle = "red";
        ctx.fillRect(v.pos*7, roads[v.road], 20, 10);
    });
}

update();
const totalVehiclesEl = document.getElementById("totalVehicles");
const avgCongestionEl = document.getElementById("avgCongestion");

// Chart.js for congestion
const ctxChart = document.getElementById('congestionChart').getContext('2d');
const congestionChart = new Chart(ctxChart, {
    type: 'bar',
    data: {
        labels: ['A','B','C','D'],
        datasets: [{
            label: 'Congestion',
            data: [0,0,0,0],
            backgroundColor: 'rgba(255, 99, 132, 0.5)'
        }]
    },
    options: { scales: { y: { beginAtZero:true, max:100 } } }
});

async function updateDashboard(vehicles){
    totalVehiclesEl.innerText = vehicles.length;
    let counts = {A:0,B:0,C:0,D:0};
    vehicles.forEach(v=>counts[v.road]+=1);
    avgCongestionEl.innerText = Math.round((counts.A+counts.B+counts.C+counts.D)/4*10)+"%";
    congestionChart.data.datasets[0].data = [counts.A, counts.B, counts.C, counts.D];
    congestionChart.update();
}

async function update() {
    await axios.get("/api/update");
    const vehicles = await fetchVehicles();
    drawVehicles(vehicles);
    updateDashboard(vehicles);
    requestAnimationFrame(update);
}
// Simple vehicle + signal simulation
function simulateTraffic() {
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 300;
  document.querySelector("#driver-portal").appendChild(canvas);
  const ctx = canvas.getContext("2d");

  let x = 0;
  let signalGreen = true;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Road
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 120, canvas.width, 60);

    // Traffic Signal
    ctx.fillStyle = signalGreen ? "green" : "red";
    ctx.beginPath();
    ctx.arc(500, 100, 15, 0, Math.PI * 2);
    ctx.fill();

    // Vehicle
    ctx.fillStyle = "cyan";
    ctx.fillRect(x, 135, 30, 30);

    if (signalGreen || x < 460) {
      x += 2;
    }

    if (x > canvas.width) x = -30;

    requestAnimationFrame(draw);
  }

  setInterval(() => {
    signalGreen = !signalGreen;
  }, 4000);

  draw();
}

simulateTraffic();
document.querySelectorAll(".route-card").forEach(card => {
    card.addEventListener("click", () => {
        document.querySelectorAll(".route-card").forEach(c => c.classList.remove("active"));
        card.classList.add("active");
    });
});
