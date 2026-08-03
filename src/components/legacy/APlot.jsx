// https://blog.logrocket.com/using-chart-js-react/
// https://github.com/ludusrusso/rosgraph_web_visualizer

import { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js/auto";
import { Card, Button } from '@mantine/core';
import TitleTile from './TitleTile';

function APlot({ ros, paramClient, name, onClick }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels: ["Press red button", "Press blue button", "Remove batteries", "Check batteries", "Order Cable", "Slide"],
        datasets: [
          {
            label: "# of Successes",
            data: [12, 19, 3, 5, count, 3],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
				maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    // cleanup on unmount
    return () => chartRef.current.destroy();
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;

    chartRef.current.data.datasets[0].data[4] = count;
    chartRef.current.update();
  }, [count]);

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
    <TitleTile text={name} onClick={onClick}/>
      <div style={{ flex: 1, position: 'relative', minHeight: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }}/>
      </div>
    <Button size='sm' onClick={() => {setCount(c => c + 1)}}>Increment</Button>
    </Card>
  );
}


export default APlot;
