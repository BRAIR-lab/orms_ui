/**
 * CloseButton.jsx
 * 
 * This component renders a close button that can be used to close a module or component.
 * It takes an onClick prop, which is a callback function that will be called when the button is clicked.
 * 
 * Props:
 * - onClick: a callback function to be called when the close button is clicked.
 */
import { Button } from '@mantine/core';

export default function CloseButton({ onClick }) {
	return <Button onClick={onClick} style={{ background: 'none', border: 'none', color: 'red', fontSize: '20px', cursor: 'pointer' }}>✕</Button>
}