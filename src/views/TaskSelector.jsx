import { useState, useEffect } from "react";
import * as ROSLIB from "roslib";
import { ToastContainer, toast } from "react-toastify";
import { Button, Container, Group, Paper, Text, SimpleGrid, Stack, Title, CloseButton, Center } from "@mantine/core";
import { Link } from "react-router-dom";

function TaskSelector({ ros, paramClient }) {
  const [availableTasks, setAvailableTasks] = useState(["waiting for Ros"]);
  const [executionTasks, setExecutionTasks] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [sendList, setSendList] = useState(null);

  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  useEffect(() => {
    if (!ros) return;

    var setListSrv = new ROSLIB.Service({
      ros: ros,
      name: '/set_list',
      serviceType: 'simple_server/srv/SetList'
    });
    setSendList(setListSrv);
  }, [ros]);

  useEffect(() => {
    if (!paramClient) return;
    paramClient.callService({ names: ['board.list'] }, function (result_all) {
      paramClient.callService({ names: ['board.selected_list'] }, function (result_sel) {
        console.log(result_sel.values[0].string_array_value)
        if(result_sel.values[0].string_array_value.length == 1 && result_sel.values[0].string_array_value == "")
          setExecutionTasks([]);  
        else
          setExecutionTasks(result_sel.values[0].string_array_value || []);
        for (const element of result_sel.values[0].string_array_value) {
          const index = result_all.values[0].string_array_value.indexOf(element);
          if (index > -1) {
            result_all.values[0].string_array_value.splice(index, 1);
          }
        }
        setAvailableTasks(result_all.values[0].string_array_value || []);
      });
    });
  }, [paramClient]);

  const moveToExecution = (task, index) => {
    const newAvailable = [...availableTasks];
    newAvailable.splice(index, 1);
    setAvailableTasks(newAvailable);
    setExecutionTasks([...executionTasks, task]);
  };

  const moveToAvailable = (task, index) => {
    const newExecution = [...executionTasks];
    newExecution.splice(index, 1);
    setExecutionTasks(newExecution);
    setAvailableTasks([...availableTasks, task]);
  };

  const onDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const onDrop = (e, dropIndex) => {
    e.preventDefault();
    setDragOverIndex(null);
    
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newTasks = [...executionTasks];
    const draggedTask = newTasks[draggedIndex];
    
    newTasks.splice(draggedIndex, 1);
    const adjustedDropIndex = dropIndex > draggedIndex ? dropIndex - 1 : dropIndex;
    newTasks.splice(adjustedDropIndex, 0, draggedTask);

    setExecutionTasks(newTasks);
    setDraggedIndex(null);
  };

  const handleSendList = () => {
    if (!sendList) return;
    
    sendList.callService({ data: executionTasks }, (result) => {
      setIsReady(result.success);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Container size="lg" py="xl">
      <SimpleGrid cols={2} spacing="lg" breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
        
        {/* Left Column: Available Tasks */}
        <div>
          <Title order={3} mb="md">Available Tasks</Title>
          <Stack gap="sm">
            {availableTasks.map((task, index) => (
              <Paper key={`avail-${task}-${index}`} shadow="sm" p="md" withBorder>
                <Group justify="space-between">
                  <Text fw={500}>{task}</Text>
                  <Button variant="light" size="xs" onClick={() => moveToExecution(task, index)}>
                    Add
                  </Button>
                </Group>
              </Paper>
            ))}
            {availableTasks.length === 0 && (
              <Center p="xl">
                <Text c="dimmed">No more tasks available</Text>
              </Center>
            )}
          </Stack>
        </div>

        {/* Right Column: Tasks to Execute */}
        <div>
          <Title order={3} mb="md">Tasks to Execute</Title>
          <Stack gap="sm">
            {executionTasks.map((task, index) => (
              <Paper
                key={`exec-${task}-${index}`}
                shadow="sm"
                p="md"
                withBorder
                draggable
                onDragStart={(e) => onDragStart(e, index)}
                onDragOver={(e) => {
                  e.preventDefault(); // Required to allow dropping
                  setDragOverIndex(index); // Continuous firing prevents flickering
                }}
                onDrop={(e) => onDrop(e, index)}
                onDragEnd={onDragEnd}
                style={{
                  cursor: 'grab',
                  opacity: draggedIndex === index ? 0.4 : 1,
                  // The simple visual indicator:
                  borderTop: dragOverIndex === index && draggedIndex !== index 
                    ? '3px solid var(--mantine-color-blue-filled)' 
                    : undefined,
                  transition: 'opacity 0.2s ease'
                }}
              >
                <Group justify="space-between">
                  <Group>
                    <Text c="dimmed" size="lg" title="Drag to reorder">☰</Text>
                    <Text fw={500}>{task}</Text>
                  </Group>
                  <CloseButton onClick={() => moveToAvailable(task, index)} title="Remove task" />
                </Group>
              </Paper>
            ))}

            {/* Bottom drop zone to move items to the very end */}
            {executionTasks.length > 0 && (
              <div
                onDragOver={(e) => { 
                  e.preventDefault(); 
                  setDragOverIndex(executionTasks.length); 
                }}
                onDrop={(e) => onDrop(e, executionTasks.length)}
                style={{ 
                  height: '20px', 
                  marginTop: '-8px',
                  borderTop: dragOverIndex === executionTasks.length && draggedIndex !== executionTasks.length - 1
                    ? '3px solid var(--mantine-color-blue-filled)' 
                    : '3px solid transparent'
                }}
              />
            )}

            {executionTasks.length === 0 && (
              <Center p="xl">
                <Text c="dimmed">Add tasks from the left panel</Text>
              </Center>
            )}
          </Stack>
        </div>
        
      </SimpleGrid>

      <Group justify="flex-end" mt="xl">
        <ToastContainer />
        <Button onClick={handleSendList} variant="outline">
          Send List
        </Button>
        <Button component={Link} to="/executing" disabled={!isReady}>
          Start
        </Button>
      </Group>
    </Container>
  );
}

export default TaskSelector;