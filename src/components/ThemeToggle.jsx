/**
 * ThemeToggle.jsx
 * 
 * This component renders a button that toggles the color scheme of the application between light and dark modes.
 * It uses the useMantineColorScheme hook from the Mantine library to access and toggle the current color scheme.
 */
import { useMantineColorScheme, Button } from '@mantine/core';
import { IconSun, IconMoonFilled } from '@tabler/icons-react';

function ThemeToggle() {
  const { toggleColorScheme } = useMantineColorScheme();
  const { colorScheme } = useMantineColorScheme();


  return <Button onClick={toggleColorScheme}>
      {colorScheme == 'dark' ? <IconSun /> : <IconMoonFilled />}
  </Button>;
}

export default ThemeToggle