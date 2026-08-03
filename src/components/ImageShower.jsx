import { Image, Card } from '@mantine/core';
import { useEffect, useState } from "react";
import * as ROSLIB from "roslib";

import TitleTile from './TitleTile';

function ImageShower({ ros, paramClient, name, onClick, topic }) {

  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const request = {
      names: ['stream.type', 'stream.names']
    };
    
    let imageListener = null;
    if (!paramClient) return;
    console.log(topic)
    paramClient.callService(request, function (result) {
      console.log('Received parameters: ', result.values);
      imageListener = new ROSLIB.Topic({ 
        ros: ros,
        name: topic,
        messageType: result.values[0].string_value
      });
      
      imageListener.subscribe(function(message) {      
        setImageUrl(`data:image/jpeg;base64,${message.data}`);
      });
    });
    return () => {
      if (imageListener) {
        imageListener.unsubscribe();
      }
    };
  }, [paramClient]);
  
  if (!imageUrl) {
    return <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <TitleTile text={name + ' ' + topic} onClick={onClick}/>
      <Card.Section inheritPadding py="md" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, overflow: 'hidden', borderRadius: "8px" }}>
        <div>No image</div>
      </Card.Section>
    </Card>
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <TitleTile text={name + ' ' + topic} onClick={onClick}/>
      <Card.Section inheritPadding py="md" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, overflow: 'hidden', borderRadius: "8px" }}>
        <Image
          src={imageUrl}
          alt="ROS stream"
          fit="contain"
          style={{ imageRendering: "pixelated", borderRadius: "8px", maxWidth: '100%', maxHeight: '100%', overflow: 'hidden' }}
        />
      </Card.Section>
    </Card>
  );
}

export default ImageShower;
