import { useState, useEffect } from "react";
import * as ROSLIB from "roslib";
import { toast } from "react-toastify";
import { useLocation } from 'react-router-dom';


function SingleTask( {name, color} ) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: color, display: "inline-block", }}/>
      <span>{name}</span>
    </div>
  )
}

function TaskCompleted({ ros, paramClient }) {
  const [isCompleted, setIsCompleted] = useState(false)
  const location = useLocation();
  const color = isCompleted ? "green" : "red";
  const text = isCompleted ? "Task completed" : "Task not completed";

  useEffect(() => {
    if (!paramClient) return;

    const request = {
      names: ['task.type', 'task.name']
    };
    let taskListener = null;
    paramClient.callService(request, function (result) {
      taskListener = new ROSLIB.Topic({ 
        ros: ros,
        name: result.values[1].string_value,
        messageType: result.values[0].string_value
      });

      taskListener.subscribe(function (message) {
        if (location.pathname !== "/executing") return;
        setIsCompleted(message.data)
        if (message.data)
          toast.success("Task completed", { icon: "✅" , toastId: 1},
        );
      })
    });
    return () => {
      if (taskListener) {
        taskListener.unsubscribe();
      }
    };
  }, [paramClient]);

  return (
    <SingleTask name={text} color={color} />
  );
}
