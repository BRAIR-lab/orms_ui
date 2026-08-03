import { use, useEffect, useState } from "react"

async function setMuIP(address, boardIP){
	const match = address.match(/^(\d{1,3}(?:\.\d{1,3}){3}):(\d{1,5})$/);
	if (!match) {
		return {}
	}
	const ip = match[1];
	const port = match[2];
	return fetch(`http://${boardIP}/microros`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				agent_ip: ip,
				agent_port: port
			})
	})
	.then(response => {
		if (!response.ok) {
			throw new Error("POST failed");
		}
		return response.json()
	});
}

export function useMuRos(boardIP, ws, muRosIP) {
  const [muRosStatus, setMuRosStatus] = useState('idle');

	const connect = () => {
		if (!muRosIP || !boardIP || !ws) return;
		ws.onmessage = (event) => {
			try {
				const msg = JSON.parse(event.data);
				if(msg.ws_data_type !== "system_status") return
				console.log(msg)
				if (msg.microros.connected) {
					setMuRosStatus("ready");
				} else {
					setMuRosStatus("error");
				}
			} catch (e) {
				console.error("Bad websocket message", e);
			}
		};
		setMuRosStatus("loading");
		setMuIP(muRosIP, boardIP)
		.then(data => {
			console.log(data);
		})
		.catch(error => {
			console.error(error);
			setMuRosStatus('error');
		});
	};

	useEffect(() => {
		console.log("handling")
		if (!ws || !muRosIP) return;
		console.log("setting handler")
		ws.onmessage = (event) => {
			try {
				const msg = JSON.parse(event.data);
				console.log(msg)
				if(msg.ws_data_type !== "system_status") return
				if (msg.microros.connected) {
					setMuRosStatus("ready");
				} else {
					setMuRosStatus("error");
				}
			} catch (e) {
				console.error("Bad websocket message", e);
			}
		};
		return () => {
			ws.onmessage = () => {}
		};
	}, [ws, muRosIP]);
  
	useEffect( () => {
		console.log(muRosIP)
		console.log(!ws)
		if (!muRosIP || !boardIP || !ws) {
		setMuRosStatus('idle');
		return;
		}
		connect()
	}, [muRosIP, boardIP, ws]);

  return { muRosStatus, retryMuRos: connect }
}