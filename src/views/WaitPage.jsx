import { useState, useEffect } from "react";
import * as ROSLIB from "roslib";
import { Container, Card, Stack, Text, Loader, ThemeIcon, Group, Button, Tooltip } from "@mantine/core";
import { IconCheck, IconX, IconClock } from "@tabler/icons-react";
import { Link } from "react-router-dom";

function StatusItem({ label, status, onRetry, errorMessage }) {
  let icon;
  let color;

  if (status === "loading") {
    icon = <Loader size="sm" />;
    color = "blue";
  } else if (status === "ready") {
    icon = <IconCheck size={16} />;
    color = "green";
  } else if (status === "error") {
    icon = <IconX size={16} />;
    color = "red";
  } else {
    icon = <IconClock size={16} />;
    color = "gray";
  }

  const iconElement = (
    <ThemeIcon color={color} variant="light">
      {icon}
    </ThemeIcon>
  );

  return (
    <Group justify="space-between">
      <Group>
        {/* Wrap in Tooltip only if it's an error and we have a message */}
        {status === "error" && errorMessage ? (
          <Tooltip label={errorMessage} withArrow position="top">
            {iconElement}
          </Tooltip>
        ) : (
          iconElement
        )}
        <Text>{label}</Text>
      </Group>

      {status === "error" && (
        <Button size="xs" variant="light" color="red" onClick={onRetry}>
          Retry
        </Button>
      )}
    </Group>
  );
}

export default function WaitPage({ rosIP, rosStatus, boardIP, boardStatus, muRosIP, muRosStatus, reloadROS, reloadBoard, reloadMuRos, ros, robotName }) {
  const [robotStatus, setRobotStatus] = useState("idle");
  const [robotErrorMessage, setRobotErrorMessage] = useState("");

  const selectRobot = () => {
    if (!ros || !ros.isConnected) {
      setRobotStatus("error");
      setRobotErrorMessage("ROS is not connected");
      return;
    }

    setRobotStatus("loading");
    setRobotErrorMessage("");

    const selectRobotClient = new ROSLIB.Service({
      ros: ros,
      name: "/select_robot",
      // Note: Replace 'your_package_msgs' with the actual package that defines SetString
      serviceType: "agent_server/srv/SetString" 
    });

    selectRobotClient.callService(
      { data: robotName },
      (result) => {
        if (result.success) {
          setRobotStatus("loading");
        } else {
          setRobotStatus("error");
          setRobotErrorMessage(result.message || "Robot selection refused by server.");
        }
      },
      (error) => {
        setRobotStatus("error");
        setRobotErrorMessage(error || "Service call failed.");
      }
    );
  };

  useEffect(() => {
    let listener = new ROSLIB.Topic({
      ros: ros,
      name: '/ros_status',
      messageType: 'agent_server_interfaces/msg/RosStatus'
    });

    listener.subscribe(function (message) {
      
      for(var i = 0; i < message.names.length; i++){
        switch(message.names[i]){
          case "robot":
            setRobotStatus("ready")
        }
      }
    });

    return () => {
      if (listener){
        listener.unsubscribe();
      }
    }
  }, [ros])
  
  useEffect(() => {
    // Only attempt the call if ROS is fully ready
    if (rosStatus === "ready" && robotName) {
      selectRobot();
    } else if (rosStatus === "error") {
      setRobotStatus("error");
      setRobotErrorMessage("Waiting for ROS connection...");
    }
  }, [rosStatus, robotName]);

  const canExecute = rosStatus === "ready" && boardStatus === "ready" && robotStatus === "ready"

  return (
    <Container size="sm" mt="xl">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack>
          <Text size="lg" fw={600}>
            System Status
          </Text>

          <StatusItem label={`ROS (${rosIP || "not set"})`} status={rosStatus} onRetry={reloadROS}/>
          <StatusItem label={`Board (${boardIP || "not set"})`} status={boardStatus} onRetry={reloadBoard}/>
          <StatusItem label={`MuRos (${muRosIP || "not set"})`} status={muRosStatus} onRetry={reloadMuRos}/>
          <StatusItem label={`Robot (${robotName}) Connection`} status={robotStatus} errorMessage={robotErrorMessage} onRetry={selectRobot}/>

          {/* Execute button */}
            <Group justify="flex-start" pt="lg">
              <Link to="/list" style={{ textDecoration: "none" }}>
                <Button
                  disabled={!canExecute}
                  variant="gradient"
                  gradient={{ from: 'green', to: 'teal', deg: 90 }}
                  size="lg"
                  radius="md"
                  fw={600}
                >
                  Continue
                </Button>
              </Link>
            </Group>
        </Stack>
      </Card>
    </Container>
  );
}