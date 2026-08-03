/**
 * TitleTile.jsx
 * 
 * This component renders a title section for a module or component.
 * It takes a text prop for the title and an optional onClick prop for a close button.
 * If the onClick prop is provided, a close button will be displayed next to the title.
 * 
 * Props:
 * - text: the title text to be displayed.
 * - onClick: an optional callback function to be called when the close button is clicked.
 */
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