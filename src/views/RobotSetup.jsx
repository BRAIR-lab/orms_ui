import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Card, Stack, Select, TextInput, Button, Title, Loader, Group, Alert, Image} from "@mantine/core";
import { isValidAddress } from "../hooks/useRos"

function RobotSetup({ onRosIP, rosIP, onBoardIP, boardIP, onMuRosIP, muRosIP }) {
  const [robotType, setRobotType] = useState("");
  const [algorithm, setAlgorithm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Load saved configuration on mount
  useEffect(() => {
    function loadConfig() {
      try {
        const storedConfig = localStorage.getItem("appConfig");

        if (storedConfig) {
          const config = JSON.parse(storedConfig);

          setRobotType(config.robotType || "");
          setAlgorithm(config.algorithm || "");
          onRosIP(config.rosIP || "");
          onBoardIP(config.boardIP || "");
          onMuRosIP(config.muRosIP || "");
        }
      } catch (error) {
        console.log("Could not load configuration:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadConfig();
  }, []);

  // Save configuration whenever it changes
  useEffect(() => {
    function saveConfig() {
      if (!isLoading) {
        try {
          if (!algorithm)
            setAlgorithm("v1");
          const config = {
            robotType,
            algorithm,
            rosIP,
            boardIP,
            muRosIP,
          };

          localStorage.setItem("appConfig", JSON.stringify(config));
        } catch (error) {
          console.error("Failed to save configuration:", error);
        }
      }
    }
    saveConfig();
  }, [robotType, algorithm, rosIP, boardIP, muRosIP, isLoading]);

  const canExecute = robotType && algorithm && isValidAddress(boardIP, true) && isValidAddress(rosIP) && isValidAddress(muRosIP);

  if (isLoading) {
    return (
      <Container size="md" py="xl">
        <Group justify="center" py="xl">
          <Loader size="lg" />
        </Group>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Group>
      <Card shadow="none" padding="xl" radius="md" style={{ flex: 1, backgroundColor: 'transparent'}}>
        <Stack gap="md">
        <Card shadow="lg" padding="xl" radius="md" withBorder style={{ flex: 1 }}>
        <Card.Section withBorder inheritPadding py="md">
          <Title order={1} size="h2">
            Robot Setup
          </Title>
        </Card.Section>

        <Card.Section inheritPadding py="xl">
          <Stack gap="lg">
            {/* Robot type selection */}
            <Select
              label="Robot Platform"
              placeholder="Select a robot"
              value={robotType}
              onChange={(value) => setRobotType(value || "")}
              data={[
                { value: "ur5", label: "UR5 + Robotiq HandE" },
                { value: "franka", label: "Franka Emika + Franka Hand" },
              ]}
              size="md"
            />

            <TextInput
              label="ROS Address"
              placeholder="192.168.1.1:9090"
              value={rosIP}
              onChange={(event) => onRosIP(event.currentTarget.value) }
              size="md"
              error={
                rosIP && !isValidAddress(rosIP)
                  ? "Invalid format (expected: host:port)"
                  : null
              }
            />
            </Stack>
            </Card.Section>
            {/* </Card>

            <Card shadow="lg" padding="xl" radius="md" withBorder style={{ flex: 1 }}> */}
            <Card.Section inheritPadding py="xl">
              <Stack gap="lg">
            <Card.Section withBorder inheritPadding py="md">
              <Title order={1} size="h2">
                Board Setup
              </Title>
            </Card.Section>

            {/* Algorithm selection */}
            <Select
              label="Task board"
              placeholder="Select a task board version"
              searchable
              clearable
              value={algorithm}
              disabled={true}
              defaultValue={"v1"}
              onChange={(value) => setAlgorithm(value || "")}
              data={[
                { value: "v1", label: "Task board V1.0" },
              ]}
              size="md"
            />

            <TextInput
              label="Task Board Address"
              placeholder="192.168.1.1"
              value={boardIP}
              onChange={(event) => onBoardIP(event.currentTarget.value) }
              size="md"
              error={
                boardIP && !isValidAddress(boardIP, true)
                  ? "Invalid format (expected: host)"
                  : null
              }
            />

            <TextInput
              label="MuROS Address"
              placeholder="192.168.1.1:8367"
              value={muRosIP}
              onChange={(event) => onMuRosIP(event.currentTarget.value) }
              size="md"
              error={
                muRosIP && !isValidAddress(muRosIP)
                  ? "Invalid format (expected: host:port)"
                  : null
              }
            />

            {/* Info alert */}
            {canExecute && (
              <Alert
                title="Configuration Ready"
                color="green"
                icon={null}
              >
                Robot: <strong>{robotType.toUpperCase()}</strong> | Task board: <strong>{algorithm.replace(/_/g, " ")}</strong>
              </Alert>
            )}

            {/* Execute button */}
            <Group justify="flex-start" pt="lg">
              <Link to="/check" style={{ textDecoration: "none" }}>
                <Button
                  disabled={!canExecute}
                  variant="gradient"
                  gradient={{ from: 'green', to: 'teal', deg: 90 }}
                  size="lg"
                  radius="md"
                  fw={600}
                >
                  Select
                </Button>
              </Link>
            </Group>
          </Stack>
        </Card.Section>
        </Card>
        </Stack>
      </Card>
      <Card shadow="lg" padding="xl" radius="md">
        <Image
          src={robotType == 'ur5' ? "ur5.jpeg" : "franka.jpg"}
          alt="Example image"
          height={160}
          fit="cover"
        />
      </Card>
      </Group>
    </Container>
  );
}

export default RobotSetup;
