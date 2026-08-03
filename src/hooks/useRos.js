import { useEffect, useState } from "react";
import * as ROSLIB from "roslib";

export function useRos(rosIP) {
	const [ros, setRos] = useState(null);
	const [status, setStatus] = useState('idle');
	const [setViewSrv, setSetVewSrv] = useState(null);
	const [paramClient, setParamClient] = useState(null);

	const connect = () => {
		if (!isValidAddress(rosIP)) {
			console.log("Invalid ROS address:", rosIP);
			setStatus("idle");
			return;
		}

		setStatus("loading");
		const rosInstance = new ROSLIB.Ros({
			url: 'ws://' + rosIP
		});
		rosInstance.on('connection', () => {
			console.log('Connected to websocket server.');
			setStatus("ready");
		});
		rosInstance.on('error', (error) => {
			console.log('Error connecting to websocket server: ', error);
			setStatus("error");
		});
		rosInstance.on('close', () => {
			console.log("Disconnected from ROS");
			setStatus("error");
		});

		setRos(rosInstance);

		const paramCl = new ROSLIB.Service({
			ros: rosInstance,
			name: '/config_node/get_parameters',
			serviceType: 'rcl_interfaces/srv/GetParameters'
		});
		setParamClient(paramCl);

		const setViewService = new ROSLIB.Service({
			ros: rosInstance,
			name: '/set_view',
			serviceType: 'simple_server/srv/SetInt'
		});
		setSetVewSrv(setViewService);

		return rosInstance;
	};

	useEffect(() => {
		const rosInstance = connect();

		return () => {
			if (rosInstance) rosInstance.close();
		};
	}, [rosIP]);

	const retryRos = () => {
		if (ros) ros.close(); // clean previous connection
		connect();
	};

  	return { ros, status, paramClient, setViewSrv, retryRos };
}

export function isValidAddress(input, noPort=false) {
	if (!input) return false;

	const ipv4Regex =
		/^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

	if(noPort){
		const host = input
		if (host === "localhost") return true;
		return ipv4Regex.test(host);
	} else {
		const [host, port] = input.split(":");

		if (!host || !port) return false;
		const portNum = Number(port);
		if (!Number.isInteger(portNum) || portNum < 1 || portNum > 65535) {
			return false;
		}
		if (host === "localhost") return true;
		return ipv4Regex.test(host);
	}
};