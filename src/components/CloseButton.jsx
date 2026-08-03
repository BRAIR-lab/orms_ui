import { Button } from '@mantine/core';

export default function CloseButton({ onClick }) {
	return <Button onClick={onClick} style={{ background: 'none', border: 'none', color: 'red', fontSize: '20px', cursor: 'pointer' }}>✕</Button>
}