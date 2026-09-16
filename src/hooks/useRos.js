import { useEffect, useState } from "react";
import * as ROSLIB from "roslib";

export function useRos(rosIP) {
	const [ros, setRos] = useState(null);
	const [status, setStatus] = useState('idle');
	const [setViewSrv, setSetVewSrv] = useState(null);
	const [paramClient, setParamClient] = useState(null);
	const [retryCount, setRetryCount] = useState(0);

	useEffect(() => {
		let timeoutId;
		let isCancelled = false; // Flag to prevent state updates if the user keeps typing
		let rosInstance = null;

		if (!isValidAddress(rosIP)) {
			setStatus("idle");
			return;
		}

		setStatus("loading");
		rosInstance = new ROSLIB.Ros({
			url: 'ws://' + rosIP
		});

		// Helper to schedule a retry safely
		const scheduleRetry = () => {
			if (isCancelled) return;
			
			// Clear any existing timeout so we don't trigger multiple retries 
			// if both 'error' and 'close' fire sequentially
			clearTimeout(timeoutId);
			
			timeoutId = setTimeout(() => {
				if (!isCancelled) {
					setRetryCount(prev => prev + 1);
				}
			}, 1000); // Wait 1 second before retrying
		};

		rosInstance.on('connection', () => {
			if (isCancelled) return;
			console.log('Connected to websocket server.');
			setStatus("ready");
		});
		rosInstance.on('error', (error) => {
			if (isCancelled) return;
			console.log('Error connecting to websocket server: ', error);
			setStatus("error");
			scheduleRetry();
		});
		rosInstance.on('close', () => {
			if (isCancelled) return;
			console.log("Disconnected from ROS");
			setStatus("error");
			scheduleRetry();
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
		setSetVewSrv(setSetVewSrv);

		// CLEANUP FUNCTION: This is where the magic happens.
		// If rosIP changes (user typed a character) OR the component unmounts,
		// this block executes immediately, killing the old attempt.
		return () => {
			isCancelled = true;
			clearTimeout(timeoutId);
			if (rosInstance) {
				rosInstance.close();
			}
		};
		
	// Adding retryCount triggers a fresh run of this entire block 1 second after a failure
	}, [rosIP, retryCount]); 

	const retryRos = () => {
		// Manually trigger a fresh reconnect cycle
		setRetryCount(prev => prev + 1); 
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
}