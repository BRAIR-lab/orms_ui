import { toast } from "react-toastify";
import { Button, Group } from '@mantine/core';

function ViewButton({ lable, onClick }) {
  return (
    <Button onClick={onClick} variant="light" size="sm">{lable}</Button>
  );
}

export default function ViewButtons({ setViewSrv }){
  function sendNumber(num) {
	setViewSrv.callService({ data: num }, (result) => { })
	toast.info("Changing to camera " + ["Front", "Above", "Side"][num])
  }

  return (
	<Group grow>
		<ViewButton onClick={() => sendNumber(0)} lable={"Front"} />
		<ViewButton onClick={() => sendNumber(1)} lable={"Above"} />
		<ViewButton onClick={() => sendNumber(2)} lable={"Side"} />
	</Group>
  )
}