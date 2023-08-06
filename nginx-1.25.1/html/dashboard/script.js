document.addEventListener('DOMContentLoaded', () => {
  Promise.all([
    fetch('http://localhost:8080/api/end_year').then(response => response.json()),
    fetch('http://localhost:8080/api/intensity').then(response => response.json())
  ])
    .then(data => {
      console.log('Received endYearData:', data[0]);
      console.log('Received intensityData:', data[1]);

      const endYearData = parseEndYearData(data[0]);
      const intensityData = parseIntensityData(data[1]);

      console.log('Parsed endYearData:', endYearData);
      console.log('Parsed intensityData:', intensityData);

      if (endYearData.length === 0 || intensityData.length === 0) {
        console.error('Invalid data format or empty data.');
        return;
      }

      createCombinedChart(endYearData, intensityData);
    })
    .catch(error => console.error('Error fetching data:', error));
});

function parseEndYearData(data) {
  if (!Array.isArray(data)) {
    console.error('Invalid data format: Data must be an array.');
    return [];
  }
  return data.map(d => +d);
}

function parseIntensityData(data) {
  if (!Array.isArray(data)) {
    console.error('Invalid intensity data format: Data must be an array.');
    return [];
  }
  return data.map(d => +d);
}

function createCombinedChart(endYearData, intensityData) {
  const svgWidth = 1410;
  const svgHeight = 650;
  const margin = { top: 30, right: 30, bottom: 50, left: 50 };
  const chartWidth = svgWidth - margin.left - margin.right;
  const chartHeight = svgHeight - margin.top - margin.bottom;

  const svg = d3.select('#combinedChartContainer')
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight);

  const xScale = d3.scaleBand()
    .domain(endYearData.map(String))
    .range([margin.left, svgWidth - margin.right])
    .padding(0.1);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(intensityData)])
    .range([chartHeight, margin.top]);

  const data = d3.zip(endYearData, intensityData);

  svg.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => xScale(String(d[0])))
    .attr('y', d => yScale(d[1]))
    .attr('width', xScale.bandwidth())
    .attr('height', d => chartHeight - yScale(d[1]));

  svg.append('g')
    .attr('transform', `translate(0, ${chartHeight})`)
    .call(d3.axisBottom(xScale));

  svg.append('g')
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(yScale));

  svg.append('text')
    .attr('x', svgWidth / 2)
    .attr('y', svgHeight - 10)
    .attr('text-anchor', 'middle')
    .text('End Year');

  svg.append('text')
    .attr('x', -(svgHeight / 2))
    .attr('y', 20)
    .attr('transform', 'rotate(-90)')
    .attr('text-anchor', 'middle')
    .text('Intensity');
}
