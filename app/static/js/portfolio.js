export function renderPortfolioChart(svgSelector) {
  const svg = d3.select(svgSelector);

  const width = svg.node().clientWidth;
  const height = svg.node().clientHeight;

  const margin = { top: 10, right: 10, bottom: 10, left: 10 };

  const data = generateSampleMonthData();

  svg.selectAll("*").remove();

  // --- SCALES ---
  const x = d3.scaleTime()
    .domain(d3.extent(data, d => d.timestamp))
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain([
      d3.min(data, d => d.price) - 500,
      d3.max(data, d => d.price) + 500
    ])
    .range([height - margin.bottom, margin.top])
    .nice();

  // --- LINE GENERATOR ---
  const line = d3.line()
    .x(d => x(d.timestamp))
    .y(d => y(d.price))
    .curve(d3.curveMonotoneX);

  // --- BASELINE (subtle dotted line) ---
  svg.append("line")
    .attr("x1", margin.left)
    .attr("x2", width - margin.right)
    .attr("y1", y(data[0].price))
    .attr("y2", y(data[0].price))
    .attr("stroke", "#999")
    .attr("stroke-dasharray", "3,3")
    .attr("opacity", 0.4);

  // --- MAIN LINE ---
  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .attr("d", line);

  // --- ENDPOINT DOT ---
  const last = data[data.length - 1];
  svg.append("circle")
    .attr("cx", x(last.timestamp))
    .attr("cy", y(last.price))
    .attr("r", 4)
    .attr("fill", "black");

  // --- HOVER ELEMENTS ---
const hoverLine = svg.append("line")
  .attr("stroke", "#aaa")
  .attr("stroke-width", 1)
  .attr("y1", margin.top)
  .attr("y2", height - margin.bottom)
  .style("opacity", 0);

const hoverDot = svg.append("circle")
  .attr("r", 4)
  .attr("fill", "black")
  .style("opacity", 0);

const hoverPrice = svg.append("text")
  .attr("fill", "black")
  .attr("font-size", "12px")
  .attr("font-weight", "bold")
  .style("opacity", 0);

const hoverDate = svg.append("text")
  .attr("fill", "#555")
  .attr("font-size", "11px")
  .style("opacity", 0);

// --- INTERACTION LAYER ---
svg.append("rect")
  .attr("fill", "transparent")
  .attr("x", margin.left)
  .attr("y", margin.top)
  .attr("width", width - margin.left - margin.right)
  .attr("height", height - margin.top - margin.bottom)
  .on("mousemove", (event) => {
    const [mx] = d3.pointer(event);
    const date = x.invert(mx);

    // find nearest data point
    const i = d3.bisector(d => d.timestamp).left(data, date);
    const d0 = data[i - 1];
    const d1 = data[i];
    const d = !d0 ? d1 : !d1 ? d0 : (date - d0.timestamp > d1.timestamp - date ? d1 : d0);

    const px = x(d.timestamp);
    const py = y(d.price);

    hoverLine
      .attr("x1", px)
      .attr("x2", px)
      .style("opacity", 1);

    hoverDot
      .attr("cx", px)
      .attr("cy", py)
      .style("opacity", 1);

    hoverPrice
      .attr("x", px + 8)
      .attr("y", py - 10)
      .text(`$${Math.round(d.price).toLocaleString()}`)
      .style("opacity", 1);

    hoverDate
      .attr("x", px + 8)
      .attr("y", py + 6)
      .text(formatDate(d.timestamp))
      .style("opacity", 1);
  })
  .on("mouseleave", () => {
    hoverLine.style("opacity", 0);
    hoverDot.style("opacity", 0);
    hoverPrice.style("opacity", 0);
    hoverDate.style("opacity", 0);
  });

  // --- DATE FORMATTER ---
  function formatDate(date) {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });
  }

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
