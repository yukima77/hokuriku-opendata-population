(function () {
  const D = window.POPULATION_DATA;
  const NAMES = ["北陸3県計", "富山県", "石川県", "福井県"];
  // 色覚多様性に配慮した色（青・橙・緑）＋ 3県計はグレー
  const COLORS = { "北陸3県計": "#7a8394", "富山県": "#0072B2", "石川県": "#D55E00", "福井県": "#009E73" };
  const lastActualIdx = D.years.indexOf(D.lastActual);
  const fmt = (n, d = 0) => n.toLocaleString("ja-JP", { minimumFractionDigits: d, maximumFractionDigits: d });

  const MODES = {
    pop:   { label: "人口（千人）",            calc: (n, i) => D.series[n][i],                                  d: 0 },
    index: { label: "指数（1960年=100）",       calc: (n, i) => D.series[n][i] / D.series[n][0] * 100,           d: 1 },
    share: { label: "全国に占める割合（%）",    calc: (n, i) => D.series[n][i] / D.series["全国"][i] * 100,      d: 2 },
  };

  const state = { mode: "pop", visible: new Set(NAMES) };

  // 地域のチェックボックス
  const seriesBox = document.getElementById("seriesBox");
  NAMES.forEach((n) => {
    const l = document.createElement("label");
    l.innerHTML = '<input type="checkbox" checked> <span style="color:' + COLORS[n] + '">■</span> ' + n;
    l.querySelector("input").addEventListener("change", (e) => {
      e.target.checked ? state.visible.add(n) : state.visible.delete(n);
      update();
    });
    seriesBox.appendChild(l);
  });
  document.querySelectorAll('input[name="mode"]').forEach((r) =>
    r.addEventListener("change", (e) => { state.mode = e.target.value; update(); })
  );

  const chart = new Chart(document.getElementById("chart"), {
    type: "line",
    data: { labels: D.years.map((y) => y + "年"), datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => items[0].label + (items[0].dataIndex > lastActualIdx ? "（推計）" : ""),
            label: (ctx) => ctx.dataset.label + "： " + fmt(ctx.parsed.y, MODES[state.mode].d),
          },
        },
      },
      scales: { y: { title: { display: true, text: "" }, grace: "5%" } },
    },
  });

  function update() {
    const m = MODES[state.mode];
    chart.data.datasets = NAMES.filter((n) => state.visible.has(n)).map((n) => ({
      label: n,
      data: D.years.map((_, i) => m.calc(n, i)),
      borderColor: COLORS[n],
      backgroundColor: COLORS[n],
      borderWidth: n === "北陸3県計" ? 3 : 2,
      pointRadius: 3,
      tension: 0.15,
      segment: { borderDash: (ctx) => (ctx.p1DataIndex > lastActualIdx ? [6, 6] : undefined) },
    }));
    chart.options.scales.y.title.text = m.label;
    chart.options.scales.y.beginAtZero = state.mode !== "index";
    chart.update();
  }

  // 2020年→2050年の比較表
  const i2020 = D.years.indexOf(2020), i2050 = D.years.indexOf(2050);
  const tbody = document.getElementById("summary");
  NAMES.forEach((n) => {
    const s = D.series[n];
    const rate = (s[i2050] / s[i2020] - 1) * 100;
    const peakYear = D.years[s.indexOf(Math.max.apply(null, s))];
    const tr = document.createElement("tr");
    tr.innerHTML =
      "<td>" + n + "</td><td>" + fmt(s[i2020]) + "</td><td>" + fmt(s[i2050]) + "</td>" +
      '<td class="' + (rate < 0 ? "neg" : "") + '">' + (rate > 0 ? "+" : "") + fmt(rate, 1) + "%</td>" +
      "<td>" + peakYear + "年</td>";
    tbody.appendChild(tr);
  });

  document.getElementById("source").textContent = D.source;
  update();
})();
