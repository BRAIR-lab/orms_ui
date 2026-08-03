// https://blog.logrocket.com/using-chart-js-react/
// https://github.com/ludusrusso/rosgraph_web_visualizer

import { useEffect, useRef } from "react";
import * as ROSLIB from "roslib";
import { Chart } from "chart.js/auto";
import { Card } from '@mantine/core';
import TitleTile from './TitleTile';

function AnotherPlot( { ros, paramClient, name, onClick } ) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {

	if(!ros) return;

	var tempListener = new ROSLIB.Topic({
		ros: ros,
		name: 'gr_temp',
		messageType: 'std_msgs/Int16'
	})

	chartRef.current = new Chart(canvasRef.current, {
	  type: "line",
	  data: {
		labels: [1],
		datasets: [
		  {
			label: "Temperature Gripper",
			data: [12],
			borderWidth: 1,
		  },
		  {
			label: "Temperature Arm",
			data: [7],
			borderWidth: 1,
		  },
		],
	  },
	  options: {
		animation: false,
		responsive: true,
		maintainAspectRatio: false,
		scales: {
		  y: {
			beginAtZero: true,
		  },
		},
	  },
	});

	tempListener.subscribe(function(message) {
		updateChart(message.data)
	})

	// cleanup on unmount
	return () => {
		chartRef.current.destroy();
		tempListener.unsubscribe();
	}
  }, [ros]);

  function updateChart(number) {
	if (!chartRef.current) return;

	let len = chartRef.current.data.datasets[0].data.length
	let lastidx = chartRef.current.data.labels[len -1]
	let last = chartRef.current.data.datasets[0].data[len - 1] 

	if (((last + number) > 10) && ((last + number )< 50))
		chartRef.current.data.datasets[0].data.push(last + number);
	else 
		chartRef.current.data.datasets[0].data.push(last - number);
	const arm = (Math.random() * (50 - 10 + 1)) + 10;
	chartRef.current.data.datasets[1].data.push(arm);

	chartRef.current.data.labels.push(lastidx + 1)
	chartRef.current.update();

	if (len + 1 > 50){
		// Improve ogic to remove unwanted misses
		chartRef.current.data.datasets[0].data.splice(0, 1);
		chartRef.current.data.datasets[1].data.splice(0, 1);
		chartRef.current.data.labels.splice(0, 1)
		chartRef.current.update();
	}
  }

  return (
	<Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
	<TitleTile text={name} onClick={onClick}/>
	<div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', minHeight: 0, width: '100%' }}>
		<canvas ref={canvasRef} />
	</div>
	</Card>
  );
}

export default AnotherPlot;
