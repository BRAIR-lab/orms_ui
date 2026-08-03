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