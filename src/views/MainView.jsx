import React, { useEffect, useState } from 'react';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GridLayout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { AddModule } from '../modularInterface/modules';

import { useDisclosure } from '@mantine/hooks';
import { Drawer, Button } from '@mantine/core';

import { defaultLayout, getNamedModule, all_modules } from '../modularInterface/modules';

const telemetryRegister = {}

function MainView({ paramClient, setViewSrv, ros, toggleRunning, taskboard_ws }) {
  const getInitialLayout = () => {
    const saved = localStorage.getItem('layout');
    return saved ? JSON.parse(saved) : defaultLayout;
  };
  const saveLayout = (layout) => {
    localStorage.setItem('layout', JSON.stringify(layout));
  };
  // Reshape the layout 
  const [layout, setLayout] = React.useState(getInitialLayout());
  const additionalModules = React.useMemo(() => {
    return all_modules.filter(name => !layout.some(item => item.i === name));
  }, [layout]);
  // Reshape the window
  const [width, setWidth] = React.useState(window.innerWidth - 64);
  // show/hide the menu
  const [opened, { open, close }] = useDisclosure(false);
  // an array of function to call when there is an update from the taskboard

  function addElement(name){
    const defaultElement = defaultLayout.find(item => item.i === name);
    const newElement = defaultElement ? { ...defaultElement, static: false } : { x: 0, y: 0, w:3, h: 2, i: name, static: false, isResizable: true };
    setLayout([...layout, newElement])
  }

  function updateTelemetry(json_data){
    for(var key in telemetryRegister){
      telemetryRegister[key](json_data)
    }
  }
  
  // send the data from the taskboard to who registered
  useEffect(() => {
    if(!taskboard_ws) return;
    taskboard_ws.onmessage = function(event) {
      try {
        const data = JSON.parse(event.data);
        updateTelemetry(data)
      } catch (error) {
        console.error('Error parsing WebSocket data:', error);
      }
    };
  }, [taskboard_ws])
  

  function removeElement(name) {
    setLayout(layout.filter(item => item.i !== name));
  }

  // resize the window
  React.useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth - 64);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
    saveLayout(layout)
  };

  // load the names of the topics for images
  const [imageNames, setImageNames] = useState([])
  const [imageType, setImageType] = useState(null)
  useEffect(() => {
      if (!paramClient) return;
      paramClient.callService({ names: ['stream.type', 'stream.names'] }, function (result) {
        console.log('Received parameters: ', result.values);
        setImageNames(result.values[1].string_array_value)
        setImageType(result.values[0].string_value)
      });
    }, [paramClient]);

  return (
    <div style={{ padding: '16px', width: '100vw', height: '100vh' }}>
      <ToastContainer />
      <Drawer offset={8} radius="md" opened={opened} onClose={close} title="Additional Elements">
       {
        additionalModules.map((name) => (
          <div key={name} style={{ marginBottom: '12px' }}>
            <AddModule 
              name={name} 
              addElement={addElement} 
              layout={layout}
              imgTopics={imageNames}
            />
          </div>
        ))
      }
      </Drawer>
      <Button variant="default" onClick={open}>
        Open Drawer
      </Button>
      <GridLayout
        className="layout"
        layout={layout}
        onLayoutChange={handleLayoutChange}
        cols={12}
        rowHeight={15}
        width={width}
        isDraggable={true}
        isResizable={true}
        compactType="vertical"
        preventCollision={false}
        containerPadding={[0, 0]}
        margin={[0, 16]}
      >
        {layout.map((moduleName) => (
          <div key={moduleName['i']}>
            {
              getNamedModule({
                name: moduleName['i'],
                ros: ros,
                paramClient: paramClient,
                setViewSrv: setViewSrv,
                toggleIsRunning: toggleRunning,
                onClose: () => removeElement(moduleName['i']),
                telemetryUpdaters: telemetryRegister
              })
            }
          </div>
        ))}
      </GridLayout>
    </div>
  );
}

export default MainView;