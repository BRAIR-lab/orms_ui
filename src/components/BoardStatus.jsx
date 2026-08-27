/**
 * BoardStatus.jsx
 * 
 * This component shows the status of the current task in execution.
 * It gets the informations directly from the taskboard through a websocket to which it subscribes using the telemetryUpdaters prop.
 * 
 * Props:
 * - ros: (not used) the ROSLIB.Ros instance to communicate with ROS.
 * - paramClient: the ROSLIB.ParamClient instance to get the list of tasks from ROS.
 * - name: the name of the component, used for display purposes.
 * - onClick: a callback function to be called when the close button is clicked.
 * - telemetryUpdaters: an object that holds the telemetry update functions for different data types. The component adds its own update function for 'taskStat' data type.
 * 
 * State:
 * - isCompleted: the number of tasks completed so far.
 * - items: the list of tasks to be displayed.
 * 
 * The component subscribes to the 'taskStat' data type in the telemetryUpdaters prop and updates the isCompleted state accordingly. It also shows a toast notification when a task is completed.
 * 
 * The component cleans up the subscription and dismisses the toast notification when the component unmounts or when the location changes.
 */

import { useState, useEffect, useRef } from "react";
import * as ROSLIB from "roslib";
import { toast } from "react-toastify";
import { useLocation } from 'react-router-dom';
import { Card } from '@mantine/core';
import TitleTile from "./TitleTile";

function SingleTask( {name, color} ) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: color, display: "inline-block", }}/>
      <span>{name}</span>
    </div>
  )
}

function BoardStatus({ ros, paramClient, name, onClick, telemetryUpdaters }) {
  const [isCompleted, setIsCompleted] = useState(0);
  const taskListenerRef = useRef(null);
  const location = useLocation();
  const [items, setItems] = useState([])

  useEffect(() => {
    // Cleanup function that runs when location changes or component unmounts
    return () => {
      if (taskListenerRef.current) {
        taskListenerRef.current.unsubscribe();
        taskListenerRef.current = null;
      }
      // Dismiss the specific toast when leaving the route
      toast.dismiss(1);
    };
  }, [location.pathname]);


  useEffect(() => {
    if (!paramClient) return;
    paramClient.callService({names:['board.selected_list']}, function (result) {
      setItems(result.values[0].string_array_value)
    });
  }, [paramClient]);

  useEffect(() => {
      if (location.pathname !== "/executing") return;
      const updateDots = (json_data) => {
        if( json_data['ws_data_type'] != 'task_status') return;
        let tot_completed = 0;
        if(!json_data["current_task"]) {
          // there are no info
          if(items.length == isCompleted + 1){ // only one task was missing
            tot_completed = items.length
          }
        } else {
          for(var i = 0; i < json_data["current_task"]["steps"].length; i++){
            if(json_data["current_task"]["steps"][i]["done"] == true){
              tot_completed++
            }
          }
        }
        if (tot_completed > isCompleted) {
          toast.success("Task "+ items[tot_completed - 1] + " completed", { icon: "✅", toastId: tot_completed });
        }
        setIsCompleted(tot_completed);
      }

      telemetryUpdaters["taskStat"] = updateDots

      return () => {
        delete telemetryUpdaters["taskStat"]
      }
    }, [telemetryUpdaters, isCompleted, items]);

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: '100%' }}>
      <TitleTile text={name} onClick={onClick} />
      <Card.Section inheritPadding py="md">
        {items.map((text, index) => (
          <div key={index}>
            <SingleTask name={text} color={isCompleted > index ? 'green' : isCompleted == index ? 'blue' : 'red'} />
          </div>
        ))}
      </Card.Section>
    </Card>
  );
}

export default BoardStatus;