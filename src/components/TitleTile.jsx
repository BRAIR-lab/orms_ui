import { Card } from '@mantine/core';
import CloseButton from './CloseButton';

export default function TitleTile({ text, onClick }){
	if (onClick) {
		return <Card.Section withBorder inheritPadding py="md" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
			<h2 style={{ margin: 0 }}>{ text }</h2>
			<CloseButton onClick={onClick} />
		</Card.Section>
	}
	return (
	<Card.Section withBorder inheritPadding py="md">
		<h2 style={{ margin: 0 }}>{ text }</h2>
	</Card.Section>
	)
}