import { useEffect, useRef } from "react";
import cloud from "d3-cloud";
import * as d3 from "d3";

const COLORS = [
  "#6366f1",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#f97316",
  "#8b5cf6",
];

export default function WordCloud({ answers = [], width = 600, height = 400 }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Hitung frekuensi tiap kata
    const freq = {};
    answers.forEach((word) => {
      freq[word] = (freq[word] || 0) + 1;
    });

    const words = Object.entries(freq).map(([text, count]) => ({
      text,
      size: Math.max(16, Math.min(72, count * 14 + 16)),
    }));

    // Clear SVG sebelum re-render
    d3.select(svgRef.current).selectAll("*").remove();

    cloud()
      .size([width, height])
      .words(words)
      .padding(6)
      .rotate(0)
      .font("sans-serif")
      .fontSize((d) => d.size)
      .on("end", (laidOut) => {
        d3.select(svgRef.current)
          .append("g")
          .attr("transform", `translate(${width / 2},${height / 2})`)
          .selectAll("text")
          .data(laidOut)
          .enter()
          .append("text")
          .style("font-size", (d) => `${d.size}px`)
          .style("font-family", "sans-serif")
          .style("fill", (_, i) => COLORS[i % COLORS.length])
          .attr("text-anchor", "middle")
          .attr("transform", (d) => `translate(${d.x},${d.y})`)
          .text((d) => d.text);
      })
      .start();
  }, [answers, width, height]);

  return <svg ref={svgRef} width={width} height={height} />;
}
