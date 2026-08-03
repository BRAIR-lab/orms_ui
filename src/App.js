import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import "react-toastify/dist/ReactToastify.css";
import "./toast.css";
import { AppShell, Container, Button, Group, Tooltip } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useState } from "react"
import { IconExternalLink } from '@tabler/icons-react';

// Components import
import RobotSetup from "./views/RobotSetup";
import TaskSelector from './views/TaskSelector';
import ThemeToggle from './components/ThemeToggle';
import MainView from './views/MainView';
import WaitPage from './views/WaitPage';

// Functions import
import { useRos } from "./hooks/useRos";
import { useTaskBoard } from './hooks/useTaskBoard';
import { useMuRos } from './hooks/useMuRos';

function Navigation( {isRunning, taskboardIP} ) {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide nav on the picker page
  if (location.pathname === "/" || location.pathname === "/list") {
    return null;
  }

  const links = [
    { label: 'Select', path: '/', color: 'violet' },
    { label: 'Checks', path: '/check', color: 'violet' },
    { label: 'Tasks', path: '/list', color: 'violet' },
    { label: 'Robot', path: '/executing', color: 'cyan' },
    { label: 'Board', url: "http://" + taskboardIP, color: 'cyan', external: true  },
  ];

  return (
    <Container size="xl" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
      <Group gap="md">
        {links.map((link) => (
          <Tooltip 
            label="Tooltip for disabled button" 
            opened={ isRunning ? undefined : false}
            key={link.path}
          >
          <Button
            variant={location.pathname === link.path ? 'filled' : 'light'}
            color={link.color}
            onClick={() => {if (link.external) {
                  window.open(link.url, '_blank');
                } else {
                  navigate(link.path);
                }}}
            size="md"
            disabled={isRunning}
            rightSection={link.external ? <IconExternalLink size={16} /> : null}
          >
            {link.label}
          </Button>
          </Tooltip>
        ))}
      </Group>
    </Container>
  );
}


export default function All() {

  const [rosIP, setRosIP] = useState('')
  const [boardIP, setBoardIP] = useState('')
  const [muRosIP, setMuRosIP] = useState('')
  const { ros, status, paramClient, setViewSrv, retryRos } = useRos(rosIP)
  const { ws, boardStatus, retryBoard } = useTaskBoard(boardIP)
  const { muRosStatus, retryMuRos } = useMuRos(boardIP, ws, muRosIP)
  const [isRunning, setIsRunning] = useState(false)
  

  return (
    <BrowserRouter>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 0,
          breakpoint: 'sm',
          collapsed: { mobile: true },
        }}
      >
        <AppShell.Header withBorder>
          <Container size="xl" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Group gap='lg'>
              <Navigation isRunning={isRunning} taskboardIP={boardIP}/>
              <ThemeToggle />
            </Group>
          </Container>
        </AppShell.Header>
        <AppShell.Main>
          <Routes>
            <Route path="/" element={
              <RobotSetup 
                onRosIP={setRosIP} rosIP={rosIP} 
                onBoardIP={setBoardIP} boardIP={boardIP}
                onMuRosIP={setMuRosIP} muRosIP={muRosIP}
              />}
            />
            <Route path="/check" element={
              <WaitPage 
                rosIP={rosIP} boardIP={boardIP} muRosIP={muRosIP}
                rosStatus={status} boardStatus={boardStatus} muRosStatus={muRosStatus}
                reloadROS={retryRos} reloadBoard={retryBoard} reloadMuRos={retryMuRos}
              />} />
            <Route
              path="/executing"
              element={
                <MainView
                  paramClient={paramClient}
                  setViewSrv={setViewSrv}
                  ros={ros}
                  toggleRunning={ () => setIsRunning(!isRunning)}
                  taskboard_ws={ws}
                />
              }
            />
            <Route path="/list" element={<TaskSelector ros={ros} paramClient={paramClient}/>} />
          </Routes>
        </AppShell.Main>
      </AppShell>
    </BrowserRouter>
  )
}