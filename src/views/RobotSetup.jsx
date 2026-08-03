import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Card, Stack, Select, TextInput, Button, Title, Loader, Group, Alert, Image} from "@mantine/core";
import { isValidAddress } from "../hooks/useRos"

const API_URL = "http://localhost:3001/api/config";

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
          src={robotType == 'ur5' ? "https://www.wiredworkers.io/wp-content/uploads/2019/06/ur5-300x263.png" : "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxITERAREhQSEhESEBUZGRMQFhIWGBUSFxUWFxUSExUYHSgjGBomHRcTITEhJSkrLi4uGR81ODMtNygtLisBCgoKDQ0NDg0NDjcZFRkrKys3KysrKysrKysrKystLSsrKysrLSsrKysrKysrKysrKysrKysrKysrKysrKysrK//AABEIAOEA4QMBIgACEQEDEQH/xAAcAAEAAgMBAQEAAAAAAAAAAAAABAYDBQcCAQj/xABAEAACAQIDBAYGCAUDBQAAAAAAAQIDEQQSIQUxQVEGEyJhgaEHMnGRscEUIzNCYnLR8FKCkrLhNENzFSRTotL/xAAVAQEBAAAAAAAAAAAAAAAAAAAAAf/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AO4gAAAABhxWKjTScr3bsoxTlKT5RitX8lq9DMRpazdnaySvpzu9/gBg6/Ey9WlTpx51ql5L+Smmn/WSaKqJdtwk/wAEXG3vk7mZsXAJ8T6a/am1adCE6k/VpxvJrdFcE+96JJa6o5D0k6Z18ZOSjKVHDp6U4NpyXOrJetfluXmB21M+nGej3QHE16ccRTqLCqSvTmnNTknumslnGL4O93y3Fp2P0lxODrRwe1ctp6UsYvUn+GpKy13atJrS+/MwvoAAAAAAAAAAAAAAAAAAAAAAAAAAAAARE/rJ+1f2olkKbtUkuaT+XyAkNnh1rKXcjHVbsV3bWJqRjKza0KK76SsZJ7NwjWnX1c8++Tpykk+7V/0rkcrUtNb2425cbHU4UVjtnfRZNRrUrODe5VIerfuabXskc0xOFnSnKnUi4TjvjL4rmu9aBH6TpTjljktkyrLbdltpbutYgbc2XSxVGVCtHNCXHjGXCcXwa/ehyzov6Q6mGpRoVafX0oK0GpZZwit0HdNSity3WXPhuX6Vqd/9LO3PrY392X5hUaltTaOyqqw1vpmHyOUItSzdXFpNQkruNs0FZqSV1axbtgekPA4m0XPqKj+5XtFN/hqeq/ZdPuNQukezdoRhCpN0KsXeHXPqpRk9OxVi7a8s13yIG3OhdR62hiFdPM0qdbLmTa6yCSqaJrtLi9b6gdSTPpw7DY3G4CUVhalZrMl9ExMG+DfZSbjKKtq6bi9V32u3RT0j08TUjQrUnRrvRWd4ykt6V7OL0ej97IL2DxCqn+j0PYAAAAAAAAAAAAAAAAAAAAAAK5tLa+XFSo5FL6uPak9LO7tlS148UWGrNRi5PdFNv2LU5lsba0sZWji8jj1tO+VXeWKq1YQTfPLFXAt9TatS6Vqf9Mv/AKNNtXaFRz6pxg1OPKS9q3slYuhVs3CLzZXa6W/lq0aDBUsbmzYxUrqfZVFJpR1XalfV+G7jfRVG9wfROUIqVOUJOUU7vNCS42usyl7keMT0LnXssRUp5FuUYZpeEper7i24H7On/wAcfgjORVZwHQHZ1JfYRqPnXbqX/ll2V4ImYnolgJxyywmHtbfCnCDXslBJrwZugBzPbfong7ywlVwf/jr9qPsU1qvG5U3Dauy3b62nTvu0q0JexO6j/wCrO8Gq6UUHPC1Ut/ZfgppvyuBzfAekuDt9Kw3aX38M07v/AI5tW/qZUdrbRWI2gq+Hi6eevS6uLSUs6cEm0m1dyVy7S6KYXEb06NR/epaa98XozY9GvR3Tw1fr51OucLdWsuXLLW85au75ct++1qi90Zp6cGe8Onki09XFb9VuNe5OKdt+5fmeiXvsTaUrJJbkreCIrMp8Ho/L3nsw5rnqjLf3O3z+YGQAAAAAAAAAAAAAAAAAAfJRTTT3NeRoIdD8NFRVNTpxjbLCnNqMUtbKK0t8SwADVx2MtLzbt+GJ9obEpqWeV5vlNRt7rGzAAAAAAAPkoppp6pqzT5H0AVrE7ClTeal24/wv1l7P4l5+0k4HHfdlpJcJaP3M3hjr4eE1acYyX4kmBroxzWyWSju5OXF99k34vuJ8aZW+lWMpYKEKrqyppyfYco5XGKcpu8k3ololdtuKS1usb29JWlTqRcbXcZ2eWO9tNK78WUWtUz5Qas2tU5Py0+RUdr7cqU8LLFYibpwulCjQSjOrJ3tGdSWbLubeWzST1Zz3A7Yx+JqRpUKtWLnJuNKhKUEr6ylKV723tuTfyIO6AouD2ZtnDxVSOJo4uyu8PWv2uahWavm5XsuZadgbYhiqKqwUoNScZ056TpVYu06c1waflZ8QNiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADlPpxpKtPZmG+9OpVlflCMYKXx8iNsjD5qkb7k07cL30du42XpaoOOK2ZiP9u9WlJ8FKai4e+0/cNlYOSlFu+/47k/3yKjU+lzESy4GC9T61tfiSppeTl7z36F5R+kYm9s6oRy88uft28erNv6Qtj9bg3OK+soPPbnBJqat7Hf+U5nsLatXDVo16Vozg3v1jODWsZLin8VdbkwP0fKoV/Yby7S2jCPqTo4WrJLd10uupyftcadP3FWl6VqXV/6ar1tvVzQ6u/5/Wt/KWX0fYWr1NTGYj7fGzVRpK2WkoqNGCXJR1X5tdbkVagAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQNt7IpYqjPD1o5qc1w0cWt0ovg0/wB2KtR2bjcHCSl1eLoQi7VHLq6qgtyqQkss7fxKV3ybLwanbEusi6K1Tfat3ape/wCAFUpTlKMnJ3bXE5NtXATpVZRjG8MztbelfRHdHszKrcbeRoNq7AT7RUULot0QxONzLJUo07pda1FRWqzvV3bUb2Si7u13FHf6VNRjGMVaMUklySVkil9E81Kqoq+SWjXwftv8WXcigAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAR69bXIt9k37G2l8H7gPOJrP1Y+L+S/f8AjHSwUUr2s+a0fvRno0bHyrICFXndJSXGybVvB8n37n3bjFOjclzSaaeqZghqst7tSVrcddL+5p+xlR52bhLS3bne/dw8/gbgx0KWVW48X3mQigAAAAAAAAAAAAAAAAAAAAAAAAAAA81Kiirt2XeQ/wDqSb7MJvv7CXm7+QE1sxxhrd72eIXl2nouEV8W+JlVwPk58CPOR6xE7byFKsUZ2yRhsPbtP1n5LV282fMLR+9LfwXL/JJIAAAAAAAAAAAAAAAAAAAAAAAAAAAGLE1lCEpvdFN/4RlIO24N0KluSfgpJvyTA03Wyn25u7avbhFfwxJtCG5EShHNDTjH5E2nB3T4X8rbyo2FGWplU9WiNSVjK5BXnEpNNGu2RQcpSct0JNLva3P3WJtRkjDQtFL966gZQAQAAAAAAAAAAAAAAAAAAAAAAAAAAAPjV9HuPoA0aoqk3Fbot2/K9UvC9vAwPa8IycZ9hcG7Wfcv0NntKn2ovmvg/wDJqNq7LVSLRUZY9IqF7Oauu5knC7S6z7ODqK/rJpJeLKTHY7hLW9i09FHknOHCUU17Yuz+PkBYKdLjK1+S18zMARQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEPaS7MXymvNNfGxipRvozPtH1P5o/3I8QKPNTDxfBGmxVPqpqpDRxd+580/aro3cka/HU7gbqhVUoxkt0opr2NXPZH2f8AZU/yL4EggAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAjbQ+zf5o/3I8UyveketiVQw1LCTdOtiMbCmpaer1dWbu2nZLIm2lfQoXSjau1sJKm54j6upFqM6UWoylT7M80akbxnfV8HfTkqOuXd3pa3HTUjYvc9LnG8D0q2jVzf99Cla327pwvdSfZ+re7Lr3yjzMtfa+Psm9p4V3e6NaF1qld2p7tb+xP2BHb8B9nD8qM5UPRttadahUpVa9LE1aM9alGWZOnO7gn2Y6pqa3bki3kUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABoemU406NPEuMpfRcRCpaGslGSlRqSS4tU6tSVu45v0o2lDaDweBwUZVMs3KVWVN07zas5yjljbfKUnlSu9LnVtrf7S51PJRl87HulCyKOdR9FdKyvWqN8bKKV+5WFT0W0LO1Wo5Lh2fkjo9j1RppNysrtavi7cwKV0O2JDAVakoqUlVioybbbSi200tz3vv5cnfYSTSad0+KNPT7STfIyYeTpvT1Xvj80BtQAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGvx+tSmuUZP3uKXwZIpox1MNJ1HPRqyS1d7Lw5tmaN191+GX9QFjzOTUZNK7UW0lbV23anqd7aJ38PPUx0FPLaaWZp3cbW8LtgVjFfTJSjCi4U012lUV7RdOd8rW+Wdw7rIk9EsDiIYWlHE6Vbax07Lbbto38WbueEelnLT8v6H3qKn8Xn+iKJNLcvYeyHTwsk755b9zba9xMIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//2Q=="}
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
