import { useState, useEffect } from "react";
import { Container, Card, Stack, Text, Loader, ThemeIcon, Group, Button } from "@mantine/core";
import { IconCheck, IconX, IconClock } from "@tabler/icons-react";
import { Link } from "react-router-dom";

function StatusItem({ label, status, onRetry }) {
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

  return (
    <Group justify="space-between">
      <Group>
        <ThemeIcon color={color} variant="light">
          {icon}
        </ThemeIcon>
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

export default function WaitPage({ rosIP, rosStatus, boardIP, boardStatus, muRosIP, muRosStatus, reloadROS, reloadBoard, reloadMuRos }) {
  const [robotStatus, setRobotStatus] = useState("idle");

  useEffect(() => {
    setRobotStatus("loading");

    // TODO: replace with correct logic
    setTimeout(() => {
      setRobotStatus("ready");
    }, 1500);
  }, []);

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
          <StatusItem label="Robot Connection" status={robotStatus} />
          
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