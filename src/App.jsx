import { useMemo, useState } from "react";
import * as d3 from "d3";

const rawData = [
  { country: "United States", students: 68, continent: "Americas", flag: "🇺🇸" },
  { country: "France", students: 21, continent: "Europe", flag: "🇫🇷" },
  { country: "United Kingdom", students: 21, continent: "Europe", flag: "🇬🇧" },
  { country: "Germany", students: 20, continent: "Europe", flag: "🇩🇪" },
  { country: "Switzerland", students: 13, continent: "Europe", flag: "🇨🇭" },
  { country: "Spain", students: 10, continent: "Europe", flag: "🇪🇸" },
  { country: "Netherlands", students: 9, continent: "Europe", flag: "🇳🇱" },
  { country: "India", students: 9, continent: "Asia", flag: "🇮🇳" },
  { country: "Singapore", students: 8, continent: "Asia", flag: "🇸🇬" },
  { country: "Ireland", students: 8, continent: "Europe", flag: "🇮🇪" },
  { country: "Sweden", students: 7, continent: "Europe", flag: "🇸🇪" },
  { country: "Australia", students: 7, continent: "Oceania", flag: "🇦🇺" },
  { country: "Canada", students: 6, continent: "Americas", flag: "🇨🇦" },
  { country: "Finland", students: 5, continent: "Europe", flag: "🇫🇮" },
  { country: "Mexico", students: 4, continent: "Americas", flag: "🇲🇽" },
  { country: "Brazil", students: 4, continent: "Americas", flag: "🇧🇷" },
  { country: "Saudi Arabia", students: 3, continent: "Asia", flag: "🇸🇦" },
  { country: "Romania", students: 3, continent: "Europe", flag: "🇷🇴" },
  { country: "Philippines", students: 3, continent: "Asia", flag: "🇵🇭" },
  { country: "New Zealand", students: 3, continent: "Oceania", flag: "🇳🇿" },
];

const continentColors = {
  Americas: "#e66101",
  Europe: "#fdb863",
  Asia: "#b2abd2",
  Oceania: "#5e3c99",
};

const continentOrder = ["Americas", "Europe", "Asia", "Oceania"];

export default function App() {
  const [activeContinent, setActiveContinent] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  const totalStudents = d3.sum(rawData, (d) => d.students);

  const data = useMemo(
    () =>
      rawData.map((d) => ({
        ...d,
        share: (d.students / totalStudents) * 100,
      })),
    [totalStudents],
  );

  const totalCountries = data.length;
  const totalContinents = new Set(data.map((d) => d.continent)).size;

  const width = 980;
  const height = 720;
  const margin = { top: 120, right: 120, bottom: 90, left: 220 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const yScale = d3
    .scaleBand()
    .domain(data.map((d) => d.country))
    .range([0, innerHeight])
    .padding(0.22);

  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.students)])
    .range([0, innerWidth])
    .nice();

  const xTicks = xScale.ticks(7);

  function handleLegendClick(continent) {
    setActiveContinent((current) => (current === continent ? null : continent));
  }

  function showTooltip(event, d) {
    setTooltip({
      x: event.clientX + 16,
      y: event.clientY - 18,
      country: d.country,
      flag: d.flag,
      share: d.share,
    });
  }

  function hideTooltip() {
    setTooltip(null);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #fffaf5 0%, #fffdf9 45%, #ffffff 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "32px 24px 40px",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: "#231f20",
      }}
    >
      <div style={{ position: "relative" }}>
        <svg width={width} height={height}>
          <text
            x={margin.left}
            y={42}
            textAnchor="start"
            fontSize="30"
            fontWeight="700"
            fill="#1f1a17"
          >
            Where Are D3 ♥ React Course Students From?
          </text>

          <text
            x={margin.left}
            y={74}
            textAnchor="start"
            fontSize="15"
            fontStyle="italic"
            fill="#6b625b"
          >
            {`There are ${totalStudents} total students across ${totalCountries} countries and ${totalContinents} continents`}
          </text>

          <g transform={`translate(${margin.left},${margin.top})`}>
            {xTicks.map((tick) => (
              <line
                key={tick}
                x1={xScale(tick)}
                x2={xScale(tick)}
                y1={0}
                y2={innerHeight}
                stroke="#efe7df"
                strokeWidth={1}
              />
            ))}

            {xTicks.map((tick) => (
              <text
                key={`tick-${tick}`}
                x={xScale(tick)}
                y={innerHeight + 24}
                textAnchor="middle"
                fontSize="12"
                fill="#7b7068"
              >
                {tick}
              </text>
            ))}

            <line
              x1={0}
              x2={innerWidth}
              y1={innerHeight}
              y2={innerHeight}
              stroke="#cfc2b8"
              strokeWidth={1.2}
            />

            {data.map((d) => {
              const y = yScale(d.country);
              const barHeight = yScale.bandwidth();
              const barWidth = xScale(d.students);
              const isHighlighted =
                activeContinent === null || activeContinent === d.continent;

              return (
                <g key={d.country}>
                  <text
                    x={-14}
                    y={y + barHeight / 2}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fontSize="13.5"
                    fontWeight="500"
                    fill={isHighlighted ? "#2c2521" : "#b8aea7"}
                  >
                    {d.country}
                  </text>

                  <rect
                    x={0}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx={6}
                    fill={continentColors[d.continent]}
                    opacity={isHighlighted ? 0.95 : 0.18}
                    onMouseEnter={(event) => showTooltip(event, d)}
                    onMouseMove={(event) => showTooltip(event, d)}
                    onMouseLeave={hideTooltip}
                    style={{
                      cursor: "pointer",
                      transition: "opacity 160ms ease",
                    }}
                  />

                  <text
                    x={barWidth + 8}
                    y={y + barHeight / 2}
                    textAnchor="start"
                    dominantBaseline="middle"
                    fontSize="13"
                    fontWeight="600"
                    fill={isHighlighted ? "#3d342f" : "#c0b5ae"}
                  >
                    {d.students}
                  </text>
                </g>
              );
            })}

            <g
              transform={`translate(${innerWidth - 135}, ${innerHeight - 108})`}
            >
              {continentOrder.map((continent, i) => {
                const y = i * 28;
                const isActive = activeContinent === continent;
                const isDimmed = activeContinent && !isActive;

                return (
                  <g
                    key={continent}
                    transform={`translate(0, ${y})`}
                    onClick={() => handleLegendClick(continent)}
                    style={{ cursor: "pointer" }}
                  >
                    <rect
                      x={0}
                      y={-10}
                      width={16}
                      height={16}
                      rx={3}
                      fill={continentColors[continent]}
                      opacity={isDimmed ? 0.35 : 1}
                    />
                    <text
                      x={24}
                      y={2}
                      textAnchor="start"
                      fontSize="14"
                      fontWeight={isActive ? "700" : "500"}
                      fill={isDimmed ? "#b3aaa3" : "#3b322d"}
                    >
                      {continent}
                    </text>
                  </g>
                );
              })}
            </g>

            <text
              x={innerWidth / 2}
              y={innerHeight + 56}
              textAnchor="middle"
              fontSize="14"
              fontWeight="500"
              fill="#5f544d"
            >
              Number of Students
            </text>
          </g>
        </svg>

        {tooltip && (
          <div
            style={{
              position: "fixed",
              left: tooltip.x,
              top: tooltip.y,
              background: "rgba(33, 27, 24, 0.96)",
              color: "#fffaf7",
              padding: "12px 14px",
              borderRadius: "10px",
              pointerEvents: "none",
              boxShadow: "0 12px 28px rgba(0, 0, 0, 0.18)",
              minWidth: "190px",
              border: "1px solid rgba(255,255,255,0.08)",
              textAlign: "left",
            }}
          >
            <div
              style={{
                fontSize: "15px",
                fontWeight: 650,
                marginBottom: "4px",
                lineHeight: 1.2,
              }}
            >
              {tooltip.flag} {tooltip.country}
            </div>
            <div
              style={{
                fontSize: "13px",
                color: "#e8dcd2",
                lineHeight: 1.3,
              }}
            >
              {tooltip.share.toFixed(1)}% of the total cohort
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
