import React, { useEffect, useRef } from "react";
import cloud from "d3-cloud";

const WordCloudComponent = ({ words }) => {
  const svgRef = useRef();

  useEffect(() => {
    const layout = cloud()
      .size([400, 200])
      .words(words.map(d => ({ text: d.text, size: d.value })))
      .padding(5)
      .rotate(() => ~~(Math.random() * 2) * 90)
      .font("Impact")
      .fontSize(d => d.size)
      .on("end", draw);

    layout.start();

    function draw(words) {
      const svg = svgRef.current;
      if (!svg) return;
      svg.innerHTML = ""; // Clear previous
      const xmlns = "http://www.w3.org/2000/svg";
      const svgElem = document.createElementNS(xmlns, "svg");
      svgElem.setAttribute("width", 400);
      svgElem.setAttribute("height", 200);

      words.forEach(word => {
        const textElem = document.createElementNS(xmlns, "text");
        textElem.setAttribute("text-anchor", "middle");
        textElem.setAttribute("transform", `translate(${word.x + 200},${word.y + 100}) rotate(${word.rotate})`);
        textElem.setAttribute("font-size", word.size);
        textElem.setAttribute("font-family", "Impact");
        textElem.setAttribute("fill", "#6366f1");
        textElem.textContent = word.text;
        svgElem.appendChild(textElem);
      });
      svg.appendChild(svgElem);
    }
  }, [words]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Word Cloud of Most Used Words</h3>
      <div ref={svgRef}></div>
    </div>
  );
};

export default WordCloudComponent;
