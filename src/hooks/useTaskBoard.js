import { use, useEffect, useState } from "react"

export function connectWebSocket(deviceIP, onRetry, setBoardStatus) {
  try {
    setBoardStatus("loading")
    const taskboard_ws_url = deviceIP ? "ws://" + deviceIP + "/ws" : '/ws';
    const taskboard_ws = new WebSocket(taskboard_ws_url);
    
    let didConnect = false;

    // sometimes the onerror is not called so this part of code is needed DX
    const timeout = setTimeout(() => {
      if (!didConnect) {
        console.warn("WebSocket connection timeout");
        setBoardStatus("error");
        taskboard_ws.close();
      }
    }, 3000);

    taskboard_ws.onclose = (event) => {
      console.warn("WebSocket closed.", event);
      setBoardStatus("error")
    };
    
    taskboard_ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      taskboard_ws.close();
      setBoardStatus("error")
    };

    taskboard_ws.onopen = (event) => {
      console.log("WebSocket connected to:", deviceIP);
      didConnect = true;
      setBoardStatus("ready")
    };
    return taskboard_ws;
  } catch (error) {
    setBoardStatus("error")
    console.error("WebSocket connection failed:", error);
    //setTimeout(() => onRetry(), 2000);
  }
}

export function useTaskBoard(deviceIP) {
  const [boardStatus, setBoardStatus] = useState('idle');
  const [ws, setWs] = useState(null)

  const connect = () => {
    if (!deviceIP) return;

    const retry = () => {
      connectWebSocket(deviceIP, retry, setBoardStatus);
    };

    const newWs = connectWebSocket(deviceIP, retry, setBoardStatus);
    setWs(newWs);
  };
  
  useEffect( () => {
    console.log(deviceIP)
    if (!deviceIP) {
      setBoardStatus('idle');
      return;
    }

    connect()

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [deviceIP]);

  return { ws, boardStatus, retryBoard: connect }
}