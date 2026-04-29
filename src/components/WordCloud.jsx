import { useEffect, useRef, useState } from "react";
import cloud from "d3-cloud";
import * as d3 from "d3";

const COLORS = [
  "#d94340",
  "#e78a31",
  "#793486",
  "#ddde68",
  "#a5b2eb",
  "#da935d",
];

export default function WordCloud({ answers = [], height = 300 }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height });

  // 1. DETEKSI UKURAN RESPONSIVE
  useEffect(() => {
    const observeTarget = containerRef.current;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: height,
        });
      }
    });

    if (observeTarget) resizeObserver.observe(observeTarget);
    return () => resizeObserver.disconnect();
  }, [height]);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    const { width, height: h } = dimensions;
    const freq = {};
    answers.forEach((word) => {
      freq[word] = (freq[word] || 0) + 1;
    });

    const words = Object.entries(freq).map(([text, count]) => ({
      text,
      size: Math.max(18, Math.min(80, count * 15 + 18)),
    }));

    const svg = d3.select(svgRef.current);

    let g = svg.select("g.main-group");
    if (g.empty()) {
      g = svg.append("g").attr("class", "main-group");
    }

    g.attr("transform", `translate(${width / 2},${h / 2})`);

    cloud()
      .size([width - 40, h - 40])
      .words(words)
      .padding(10)
      .rotate(0)
      .font("AGFatumCBold")
      .fontSize((d) => d.size)
      .on("end", (laidOut) => {
        // --- ANIMASI ENTER-UPDATE-EXIT ---
        const textNodes = g.selectAll("text").data(laidOut, (d) => d.text);

        textNodes
          .exit()
          .transition()
          .duration(500)
          .style("opacity", 0)
          .attr("font-size", "0px")
          .remove();

        textNodes
          .transition()
          .duration(800)
          .attr("transform", (d) => `translate(${d.x},${d.y})`)
          .style("font-size", (d) => `${d.size}px`);

        const enterNodes = textNodes
          .enter()
          .append("text")
          .text((d) => d.text)
          .style("font-family", "AGFatumCBold")
          .style("fill", (_, i) => COLORS[i % COLORS.length])
          .attr("text-anchor", "middle")
          .style("font-size", "0px")
          .style("opacity", 0)
          .attr("transform", (d) => `translate(${d.x},${d.y})`);

        enterNodes
          .transition()
          .duration(800)
          .style("font-size", (d) => `${d.size}px`)
          .style("opacity", 1);

        // --- MOUSE SCATTERING FLUID LOGIC ---
        svg.on("mousemove", (event) => {
          const [mx, my] = d3.pointer(event, g.node());
          const repelRadius = 120;
          const repelStrength = 15; // Sedikit dilembutkan agar tidak terlalu liar

          let isMoved = false; // Optimasi: Cek apakah ada yang tersentuh

          // 1. Beri dorongan jika kena mouse
          laidOut.forEach((d) => {
            const dx = d.x - mx;
            const dy = d.y - my;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < repelRadius && dist > 0) {
              const force = (repelRadius - dist) / repelRadius;
              d.x += (dx / dist) * force * repelStrength;
              d.y += (dy / dist) * force * repelStrength;
              isMoved = true;
            }
          });

          // HENTIKAN proses jika kursor bergerak di area kosong (inilah yang bikin performa jadi mulus)
          if (!isMoved) return;

          // 2. Collision Detection
          for (let iter = 0; iter < 3; iter++) {
            for (let i = 0; i < laidOut.length; i++) {
              for (let j = i + 1; j < laidOut.length; j++) {
                const n1 = laidOut[i];
                const n2 = laidOut[j];
                const dx = n1.x - n2.x;
                const dy = n1.y - n2.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const minDist = (n1.size + n2.size) * 0.75;

                if (dist < minDist) {
                  const overlap = minDist - dist;
                  const nx = (dx / dist) * overlap * 0.5;
                  const ny = (dy / dist) * overlap * 0.5;
                  n1.x += nx;
                  n1.y += ny;
                  n2.x -= nx;
                  n2.y -= ny;
                }
              }
            }
          }

          // 3. Jaga agar tetap di dalam kotak biru
          laidOut.forEach((d) => {
            const wordHalfWidth = d.text.length * d.size * 0.28;
            const wordHalfHeight = d.size * 0.5;

            const maxX = width / 2 - wordHalfWidth - 5;
            const maxY = h / 2 - wordHalfHeight - 5;

            d.x = Math.max(-maxX, Math.min(maxX, d.x));
            d.y = Math.max(-maxY, Math.min(maxY, d.y));
          });

          // 4. Animasi pergeseran
          g.selectAll("text")
            .data(laidOut, (d) => d.text)
            // .interrupt() <-- DIHAPUS agar tidak patah-patah
            .transition()
            .duration(400) // Waktu meluncur
            .ease(d3.easeCubicOut) // Efek melambat di ujung pergerakan
            .attr("transform", (d) => `translate(${d.x},${d.y})`);
        });
      })
      .start();
  }, [answers, dimensions]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", minHeight: height }}
    >
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ display: "block", cursor: "crosshair", overflow: "visible" }}
      />
    </div>
  );
}
