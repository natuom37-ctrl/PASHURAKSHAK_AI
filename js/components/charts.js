/**
 * PashuRakshak AI - Responsive Chart Visualizer
 * High-performance, zero-dependency Canvas & SVG chart engine matching design tokens
 */

export const ChartRenderer = {
  /**
   * Render Activity Trend Line Chart
   */
  renderActivityChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 500;
    const height = rect.height || 240;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const padding = { top: 25, right: 20, bottom: 35, left: 35 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const labels = data.labels || [];
    const values = (data.datasets && data.datasets[0] ? data.datasets[0].data : []) || [];
    const maxVal = Math.max(...values, 10);

    // Draw grid lines
    ctx.strokeStyle = '#e6ece9';
    ctx.lineWidth = 1;
    const gridLines = 4;
    ctx.fillStyle = '#7a8a84';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'right';

    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartH / gridLines) * i;
      const val = Math.round(maxVal - (maxVal / gridLines) * i);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();
      ctx.fillText(val.toString(), padding.left - 8, y + 4);
    }

    if (values.length < 2) return;

    const stepX = chartW / (values.length - 1);
    const points = values.map((val, idx) => ({
      x: padding.left + idx * stepX,
      y: padding.top + chartH - (val / maxVal) * chartH
    }));

    // Draw gradient area
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    gradient.addColorStop(0, 'rgba(21, 95, 70, 0.28)');
    gradient.addColorStop(1, 'rgba(21, 95, 70, 0.01)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
    ctx.lineTo(points[0].x, padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.strokeStyle = '#155f46';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw points & x labels
    ctx.textAlign = 'center';
    points.forEach((p, idx) => {
      // Circle
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.strokeStyle = '#155f46';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#53635d';
      ctx.fillText(labels[idx] || '', p.x, height - 10);
    });
  },

  /**
   * Render Doughnut Chart (Disease Distribution)
   */
  renderDonutChart(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const counts = data.counts || [1, 0, 0];
    const colors = data.colors || ['#155f46', '#e09f3e', '#d9534f'];
    const labels = data.labels || ['Healthy', 'Lumpy', 'FMD'];
    const total = counts.reduce((a, b) => a + b, 0) || 1;

    let currentAngle = -0.5 * Math.PI;
    const slicesSvg = counts.map((count, i) => {
      const percent = count / total;
      const angle = percent * Math.PI * 2;
      const start = currentAngle;
      const end = currentAngle + angle;
      currentAngle = end;

      if (count === 0) return '';

      const x1 = 90 + 70 * Math.cos(start);
      const y1 = 90 + 70 * Math.sin(start);
      const x2 = 90 + 70 * Math.cos(end);
      const y2 = 90 + 70 * Math.sin(end);
      const largeArc = angle > Math.PI ? 1 : 0;

      const pathData = `M ${x1} ${y1} A 70 70 0 ${largeArc} 1 ${x2} ${y2}`;

      return `<path d="${pathData}" fill="none" stroke="${colors[i]}" stroke-width="26" stroke-linecap="round"/>`;
    }).join('');

    const legendHtml = labels.map((lbl, i) => `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; font-size:13px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="width:10px; height:10px; border-radius:50%; background:${colors[i]}; display:inline-block;"></span>
          <span style="color:#2f3d38;">${lbl}</span>
        </div>
        <strong style="color:#101917;">${counts[i]} (${Math.round((counts[i]/total)*100)}%)</strong>
      </div>
    `).join('');

    container.innerHTML = `
      <div style="display:flex; align-items:center; gap:24px; flex-wrap:wrap; justify-content:center;">
        <div style="position:relative; width:180px; height:180px; flex:none;">
          <svg viewBox="0 0 180 180" style="transform:rotate(0deg); width:100%; height:100%;">
            ${slicesSvg}
          </svg>
          <div style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;">
            <span style="font-size:24px; font-weight:800; color:#155f46;">${total}</span>
            <span style="font-size:11px; color:#687570; font-weight:600; text-transform:uppercase;">Total</span>
          </div>
        </div>
        <div style="flex:1; min-width:180px;">
          ${legendHtml}
        </div>
      </div>
    `;
  },

  /**
   * Render Bar Chart (Healthy vs Needs Attention)
   */
  renderComparisonBar(containerId, healthyCount, attentionCount) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const total = healthyCount + attentionCount || 1;
    const hPercent = Math.round((healthyCount / total) * 100);
    const aPercent = 100 - hPercent;

    container.innerHTML = `
      <div style="margin-bottom:12px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:13px;">
          <span style="color:#155f46; font-weight:700;">🟢 Healthy Cattle (${healthyCount})</span>
          <strong style="color:#155f46;">${hPercent}%</strong>
        </div>
        <div style="background:#e4ece8; height:10px; border-radius:6px; overflow:hidden;">
          <div style="background:#155f46; width:${hPercent}%; height:100%; border-radius:6px; transition: width 0.6s ease;"></div>
        </div>
      </div>
      <div>
        <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:13px;">
          <span style="color:#b3392f; font-weight:700;">🔴 Needs Attention (${attentionCount})</span>
          <strong style="color:#b3392f;">${aPercent}%</strong>
        </div>
        <div style="background:#e4ece8; height:10px; border-radius:6px; overflow:hidden;">
          <div style="background:#b3392f; width:${aPercent}%; height:100%; border-radius:6px; transition: width 0.6s ease;"></div>
        </div>
      </div>
    `;
  },

  /**
   * Render Animal Type Breakdown
   */
  renderAnimalBreakdown(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const labels = data.labels || [];
    const counts = data.counts || [];
    const colors = data.colors || ['#187052', '#35649a', '#8a508f', '#b08968'];
    const total = counts.reduce((a, b) => a + b, 0) || 1;

    const html = labels.map((lbl, i) => {
      const p = Math.round((counts[i] / total) * 100);
      return `
        <div style="margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px; color:#3a4a44;">
            <span><strong>${lbl}</strong> (${counts[i]} animals)</span>
            <span>${p}%</span>
          </div>
          <div style="background:#e6eee9; height:8px; border-radius:4px; overflow:hidden;">
            <div style="background:${colors[i]}; width:${p}%; height:100%; border-radius:4px; transition:width .6s ease;"></div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
  }
};
