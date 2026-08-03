import { Button, Card, Modal, Select } from "@mantine/core";
import { useState } from 'react';
import ImageShower from "../components/ImageShower";
import BoardStatus from "../components/BoardStatus";
import APlot from '../components/APlot';
import AnotherPlot from '../components/AnotherPlot';
import ViewButtons from '../components/ViewButtons';
import Timer from "../components/Timer";
import CloseButton from "../components/CloseButton";
import TelemetryPlot from "../components/TelemetryPlot";
import TitledCounter from "../components/TitledCounter"
import { ChatToBaby } from "./chat";

const validSensors = ['FADER', 'DOOR_ANGLE', 'PROBE_GOAL_ANALOG', 'TEMPERATURE', 'BLUE_BUTTON_COUNTER', 'RED_BUTTON_COUNTER', 'ATTACHED_CABLE'] // 'FADER_BLUE_BUTTON',
//const telemetryModules = validSensors.map((sensor) => {return 'telemetry+' + sensor})
const all_modules = [ 'camera', 'boardStatus', 'analytics', 'timer', 'telemetry', 'chat'] //'cameraButtons', 'temperaturePlot'

const defaultLayout = [
    {"i":"boardStatus","x":3,"y":3,"w":3,"h":2, "moved":false,"static":false, "minW": 3, "minH":2, "maxW":3, "maxH":4},
	{"i":"camera/image","x":0,"y":0,"w":3,"h":2,"moved":false,"static":false,"isResizable":true, "minW": 3, "minH":2},
	{"i":"telemetry+FADER","x":3,"y":0,"w":3,"h":2,"moved":false,"static":false,"isResizable":true},
	{"i":"telemetry+DOOR_ANGLE","x":9,"y":4,"w":3,"h":2,"moved":false,"static":false,"isResizable":true},
	{"i":"telemetry+PROBE_GOAL_ANALOG","x":6,"y":4,"w":3,"h":2,"moved":false,"static":false,"isResizable":true},
	{"i":"telemetry+TEMPERATURE","x":0,"y":3,"w":2,"h":1,"moved":false,"static":false,"isResizable":true, "minW": 2, "minH":1, "maxW":3, "maxH":2},
	{"i":"telemetry+RED_BUTTON_COUNTER","x":4,"y":2,"w":2,"h":1,"moved":false,"static":false,"isResizable":true, "minW": 2, "minH":1, "maxW":3, "maxH":2},
	{"i":"telemetry+BLUE_BUTTON_COUNTER","x":0,"y":2,"w":2,"h":1,"moved":false,"static":false,"isResizable":true, "minW": 2, "minH":1, "maxW":3, "maxH":2},
	{"i":"telemetry+ATTACHED_CABLE","x":2,"y":2,"w":2,"h":1,"moved":false,"static":false,"isResizable":true, "minW": 2, "minH":1, "maxW":3, "maxH":2},
	{"i":"chat","x":6,"y":0,"w":6,"h":4,"moved":false,"static":false,"isResizable":true},
	{"i":"timer","x":0,"y":4,"w":3,"h":2,"minW":3,"minH":2,"maxH":3,"moved":false,"static":false}
];

export { all_modules, defaultLayout, getNamedModule}

function getNamedModule({name, ros, paramClient, setViewSrv, onClose, toggleIsRunning, telemetryUpdaters}) {
	const match = name.match(/^camera(.+)$/);
	if (match) {
		name = 'camera'
	}
	switch(name) {
		case 'camera':
			return (
				<ImageShower paramClient={paramClient} ros={ros} name={'Camera Stream'} onClick={onClose} topic={match[1]} />
			);
		case 'cameraButtons':
			return (
				<Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: '100%' }}>
				<Card.Section withBorder inheritPadding py="md" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<h3 style={{ margin: 0 }}>Camera View</h3>
					<CloseButton onClick={onClose} />
				</Card.Section>
				<Card.Section inheritPadding py="md">
					<ViewButtons setViewSrv={setViewSrv} />
				</Card.Section>
				</Card>
			);
		case 'boardStatus':
			return (
				<BoardStatus ros={ros} paramClient={paramClient} name={'Task Status'} onClick={onClose} telemetryUpdaters={telemetryUpdaters}/>
			)
		case 'analytics':
			return (
				<APlot ros={ros} paramClient={paramClient} name={'Analytics'} onClick={onClose}/>
			)
		case 'temperaturePlot':
			return (
				<AnotherPlot ros={ros} paramClient={paramClient} name={'Temperature Plot'} onClick={onClose}/>
			)
		case 'timer':
			return (
				<Timer ros={ros} paramClient={paramClient} name={'Execution Time'} onClick={onClose} toggleIsRunning={toggleIsRunning} />
			)
		case 'chat':
			return (
				<ChatToBaby name={'FrankChat'} onClick={onClose} ros={ros}/>
			)
		default:
			if(name.includes('telemetry')){
				var sensor = name.split('+')[1]
				if(name.includes('COUNTER')){
					return (
						<TitledCounter
							name={sensor.charAt(0) + sensor.substring(1).toLowerCase().replace(/_/g, ' ')}
							onClick={onClose} 
							telemetryUpdaters={telemetryUpdaters} 
							field={sensor}
							unit="Clicks"
						/>
					)
				}
				if(name.includes('ATTACHED_CABLE')){
					return (
						<TitledCounter
							name={sensor.charAt(0) + sensor.substring(1).toLowerCase().replace(/_/g, ' ')}
							onClick={onClose} 
							telemetryUpdaters={telemetryUpdaters} 
							field={sensor}
							isbool={true}
							unit=""
						/>
					)
				}
				if(name.includes('TEMP')){
					return (
						<TitledCounter
							name={sensor.charAt(0) + sensor.substring(1).toLowerCase().replace(/_/g, ' ')}
							onClick={onClose} 
							telemetryUpdaters={telemetryUpdaters} 
							field={sensor}
							unit="°C"
						/>
					)
				}
				var min = 0
				var max = 1
				if(name.includes('TEMPERATURE')){
					max = 70
					min = 20
				}
				return (
					<TelemetryPlot 
						name={sensor.charAt(0) + sensor.substring(1).toLowerCase().replace(/_/g, ' ')} 
						onClick={onClose} 
						telemetryUpdaters={telemetryUpdaters} 
						field={sensor}
						min_show={min}
						max_show={max}
					/>
				)
			} else {
				return (
					<div>unknown {name} element</div>
				)
			}
		}
}


export function AddModule({name, addElement, layout, imgTopics}){

	const [telemetryOpened, setTelemetryOpened] = useState(false);
	const [selectedSensor, setSelectedSensor] = useState(null);
	const [cameraOpened, setCameraOpened] = useState(false);
	const [selectedCamera, setSelectedCamera] = useState(null)

	const usedSensors = layout
		.filter(item => item.i.startsWith('telemetry+'))
		.map(item => item.i.replace('telemetry+', ''));
	const availableSensors = validSensors.filter(sensor => !usedSensors.includes(sensor));

	const usedCameras = layout
		.filter(item => item.i.startsWith('camera'))
		.map(item => item.i.replace('camera', ''));
	const availableCameras = imgTopics.filter( topic => !usedCameras.includes(topic));

	const handleAddClick = () => {
		if (name === "telemetry") {
			setTelemetryOpened(true);
		} else if (name === "camera") {
			setCameraOpened(true);
		} else {
			addElement(name);
		}
	};

	const handleConfirm = () => {
		if (selectedSensor) {
			addElement(`telemetry+${selectedSensor}`);
			setSelectedSensor(null);
			setTelemetryOpened(false);
		}
	};

	const handleCameraConfirm = () => {
		if (selectedCamera) {
			addElement(`camera${selectedCamera}`);
			setSelectedCamera(null);
			setCameraOpened(false);
		}
	};

	return (
		<>
		<Card shadow="sm" padding="lg" radius="md" withBorder>
			<Card.Section withBorder inheritPadding py="md">
			<h3 style={{ margin: 0 }}>{name}</h3>
			</Card.Section>
			<Card.Section inheritPadding py="md">
			<Button 
				onClick={handleAddClick} 
				fullWidth
				disabled={
					(name === "telemetry" && availableSensors.length === 0) ||
    				(name === "camera" && availableCameras.length === 0)
				}
			> 
				ADD
			</Button>
			</Card.Section>
		</Card>

		<Modal opened={telemetryOpened} onClose={() => setTelemetryOpened(false)} title="Select Sensor" centered>
			<Select label="Sensor Type" placeholder="Choose a sensor" 
				data={availableSensors} value={selectedSensor}
				onChange={setSelectedSensor} searchable clearable
			/>
			<Button onClick={handleConfirm} fullWidth mt="md" disabled={!selectedSensor} >
				Confirm
			</Button>
		</Modal>
		<Modal opened={cameraOpened} onClose={() => setCameraOpened(false)} title="Select Camera" centered >
			<Select label="Camera" placeholder="Choose a camera"
				data={availableCameras} value={selectedCamera}
				onChange={setSelectedCamera} searchable clearable
			/>
  		<Button mt="md" fullWidth onClick={handleCameraConfirm} disabled={!selectedCamera} >
    		Confirm
  		</Button>
		</Modal>
		</>

	)
}
