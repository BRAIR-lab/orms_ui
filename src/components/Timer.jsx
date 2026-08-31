import { useEffect, useRef, useState } from 'react'
import { Card, Text, Button, Group } from '@mantine/core'
import TitleTile from './TitleTile'
import * as ROSLIB from "roslib";

export default function Timer({ ros, paramClient, name, onClick, toggleIsRunning, telemetryUpdaters, allowChat, setAllowChat }) {
  const [time, setTime] = useState(0) // milliseconds
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)
  const [sendList, setSendList] = useState(null);
  const [stopTask, setStopTask] = useState(null);
  const [getFinalTime, setGetFinalTime] = useState(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTime(prev => prev + 50) // finer resolution for ms display
      }, 50)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  const formatTime = ms => {
    const minutes = String(Math.floor(ms / 60000)).padStart(2, '0')
    const seconds = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')
    const milliseconds = String(Math.floor((ms % 1000) / 10)).padStart(2, '0')
    return `${minutes}:${seconds}.${milliseconds}`
  }

  useEffect(() => {
    if (location.pathname !== "/executing") return;
    const updateTime = (json_data) => {
      if( json_data['ws_data_type'] != 'task_status') return;
      if(json_data["current_task"]) {
        if(!running){
          toggleIsRunning()
          setRunning(true)
        }
        console.log("current task found")
        console.log(json_data["current_task"])
        setTime(json_data["current_task"]["time"]*1000)
      } else {
        if(running){
          toggleIsRunning()
          setRunning(false)
          getFinalTime.callService({}, (result) => {
            if(result.success){
              setTime(result.time)
            }
          })
        }
      }
    }
    telemetryUpdaters["taskTime"] = updateTime
    return () => {
      delete telemetryUpdaters["taskTime"]
    }
  }, [telemetryUpdaters, running]);

  useEffect(() => {
    if (!ros) return;

    var setListSrv = new ROSLIB.Service({
      ros: ros,
      name: '/send_list',
      serviceType: 'simple_server/srv/StartTask'
    });
    setSendList(setListSrv);

    var stopTaskSrv = new ROSLIB.Service({
      ros: ros,
      name: '/abort_task',
      serviceType: 'simple_server/srv/StartTask'
    });
    setStopTask(stopTaskSrv);

    var getFinalTimeSrv = new ROSLIB.Service({
      ros: ros,
      name: '/finish_time',
      serviceType: 'simple_server/srv/FinishTime'
    });
    setGetFinalTime(getFinalTimeSrv)
  }, [ros]);

  const handleSendList = (useChat) => {
    if (!sendList) return;
    sendList.callService({interactive: useChat}, (result) => {
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleStopTask = () => {
    if (!stopTask) return;
    stopTask.callService({}, (result) => {})
  }

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <TitleTile text={name} onClick={onClick} />
      
      <Card.Section 
        inheritPadding 
        py="md" 
        style={{ 
          flex: 1, 
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60px'
        }}
      >
        <Text 
          size="xl" 
          fw={600}
          style={{
            fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
            fontVariantNumeric: 'tabular-nums'
          }}
        >
          {formatTime(time)}
        </Text>
      </Card.Section>
      
      <Group grow style={{ marginTop: 'auto', gap: '8px' }}>
        <Button 
          onClick={() => {
            if(!running) {
              handleSendList(allowChat)
            } else {
              handleStopTask()
            }
          }}
          color={running ? 'red' : 'green'}
          size="md"
          style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)', minHeight: '36px' }}
        >
          {running ? 'Stop' : 'Start'}
        </Button>

        <Button
          onClick={() => setAllowChat((allowChat) => !allowChat)}
          color={allowChat ? 'blue' : 'gray'}
          variant={allowChat ? 'filled' : 'outline'}
          size="md"
          style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)', minHeight: '36px' }}
          aria-pressed={allowChat}
          disabled={running}
        >
          {allowChat ? 'Use chat: On' : 'Use chat: Off'}
        </Button>
      </Group>
    </Card>
  )
}