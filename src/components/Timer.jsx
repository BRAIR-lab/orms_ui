import { useEffect, useRef, useState } from 'react'
import { Card, Text, Button, Group } from '@mantine/core'
import TitleTile from './TitleTile'

export default function Timer({ ros, paramClient, name, onClick, toggleIsRunning }) {
  const [time, setTime] = useState(0) // milliseconds
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTime(prev => prev + 10) // finer resolution for ms display
      }, 10)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  const formatTime = ms => {
    const minutes = String(Math.floor(ms / 60000)).padStart(2, '0')
    const seconds = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')
    const milliseconds = String((ms % 1000)/10).padStart(2, '0')
    return `${minutes}:${seconds}.${milliseconds}`
  }

  const handleReset = () => {
    if(running)
      toggleIsRunning()
    setRunning(false)
    setTime(0)
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
      
      <Group grow style={{ marginTop: 'auto' }}>
        <Button 
          onClick={() => {
            toggleIsRunning()
            setRunning(r => !r)
          }}
          color={running ? 'red' : 'green'}
          size="md"
          style={{
            fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
            minHeight: '36px'
          }}
        >
          {running ? 'Stop' : 'Start'}
        </Button>
        
        <Button 
          onClick={handleReset}
          color="gray"
          //variant="light"
          size="md"
          disabled={time === 0}
          style={{
            fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
            minHeight: '36px'
          }}
        >
          Reset
        </Button>
      </Group>
    </Card>
  )
}