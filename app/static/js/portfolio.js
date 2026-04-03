export function renderPortfolioChart(svgSelector) {
  const svg = d3.select(svgSelector);

  const width = svg.node().clientWidth;
  const height = svg.node().clientHeight;

  const margin = { top: 20, right: 20, bottom: 20, left: 40 };

  const data = generateSampleMonthData();

  svg.selectAll("*").remove();

  const x = d3.scaleTime()
    .domain(d3.extent(data, d => d.timestamp))
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain([
      d3.min(data, d => d.price) - 1000,
      d3.max(data, d => d.price) + 1000
    ])
    .range([height - margin.bottom, margin.top])
    .nice();

  const line = d3.line()
    .x(d => x(d.timestamp))
    .y(d => y(d.price))
    .curve(d3.curveMonotoneX);

  // gridlines
  svg.append("g")
    .attr("stroke", "#e0e0e0")
    .selectAll("line")
    .data(y.ticks(5))
    .join("line")
    .attr("x1", margin.left)
    .attr("x2", width - margin.right)
    .attr("y1", d => y(d))
    .attr("y2", d => y(d));

  // y labels
  svg.append("g")
    .selectAll("text")
    .data(y.ticks(5))
    .join("text")
    .attr("x", margin.left - 10)
    .attr("y", d => y(d))
    .attr("text-anchor", "end")
    .attr("dominant-baseline", "middle")
    .attr("fill", "#555")
    .attr("font-size", "10px")
    .text(d => `$${Math.round(d).toLocaleString()}`);

  // main line
  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .attr("d", line);

  // endpoint dot
  const last = data[data.length - 1];
  svg.append("circle")
    .attr("cx", x(last.timestamp))
    .attr("cy", y(last.price))
    .attr("r", 4)
    .attr("fill", "black");
}

function generateSampleMonthData() {
  const data = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);

    data.push({
      timestamp: date,
      price: 30000 + Math.sin(i / 5) * 2000 + Math.random() * 500
    });
  }

  return data;
}
