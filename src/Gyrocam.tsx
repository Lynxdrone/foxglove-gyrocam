import { CompressedImage } from "@foxglove/schemas";

import { SettingsTreeAction, Immutable } from "@foxglove/studio";
import { PanelExtensionContext, Topic, MessageEvent } from "@foxglove/studio";
import { useLayoutEffect, useEffect, useState,useCallback, useRef } from "react";
import ReactDOM from "react-dom";
import { set } from "lodash";
import Quat from "quaternion";

// Lynxdrone standard components
import { Imu, Quaternion,getOrientationOptions, getCompressedImageOptions, getCameraInfoOptions } from './components/types'
//import DataZone from './components/DataZone';


import ai_case from '../images/ai_case_2.svg';
import ai_back from '../images/ai_back_2.svg';
import ai_face from '../images/ai_face_2.svg';
import ai_ring from '../images/ai_ring_2.svg';

type ImageMessage = MessageEvent<CompressedImage>;


type Config = {
  cameraTopic?: string
  cameraInfoTopic?: string
  imuTopic?: string
  indicatorPosition?: string
  height?: number
  width?: number
};

// Draws the compressed image data into our canvas.
async function drawImageOnCanvas(imgData: Uint8Array, canvas: HTMLCanvasElement, format: string) {
  const ctx = canvas.getContext("2d");
  if (ctx == undefined) {
    return;
  }

  // Create a bitmap from our raw compressed image data.
  const blob = new Blob([imgData], { type: `image/${format}` });
  const bitmap = await createImageBitmap(blob);

  // Adjust for aspect ratio.
  canvas.width = Math.round((canvas.height * bitmap.width) / bitmap.height);

  // Draw the image.
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  ctx.resetTransform();
}

function Gyrocam({ context }: { context: PanelExtensionContext }): JSX.Element {
  const [topics, setTopics] = useState<readonly Topic[] | undefined>();
  const [, setMessage] = useState<ImageMessage>();
  const [messages, setMessages] = useState<undefined | Immutable<MessageEvent[]>>();
  const [renderDone, setRenderDone] = useState<(() => void) | undefined>();

  const percentsPerDeg = 0.71; //ai_face scale to map degrees to image percentage
  const [, setpitch] = useState<number | undefined>();
  const [, setroll] = useState<number | undefined>();
  // Html refs
  const ai_ringRef = useRef<HTMLImageElement>(null);
  const ai_faceRef = useRef<HTMLImageElement>(null);
  const ai_caseRef = useRef<HTMLImageElement>(null);
  const ai_group = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Init config variable
  const [config, setConfig] = useState<Config>(() => {
    const partialConfig = context.initialState as Config;

    const {
      cameraTopic = "",
      cameraInfoTopic = "",
      imuTopic = "",
      indicatorPosition = "",
      height = 720,
      width = 1024,
    } = partialConfig;

    return { cameraTopic, cameraInfoTopic, imuTopic, indicatorPosition,height,width };
  });

  // Action handler to update config
  const actionHandler = useCallback(
    (action: SettingsTreeAction) => {
      if (action.action === "update") {
        const { path, value } = action.payload;

        // Update config based on the previous config
        setConfig((previous) => {
          const newConfig = { ...previous };
          set(newConfig, path.slice(1), value);
          return newConfig;
        });
      }
    },
    [context],
  );

    // update setting editor when config or topics change
    useEffect(() => {
      context.saveState(config);
  
      context.updatePanelSettingsEditor({
        actionHandler,
        nodes: {
          general: {
            label: "General",
            icon: "Cube",
            fields: {
              cameraTopic: {
                label: "Camera topic",
                input: "select",
                options: getCompressedImageOptions(topics),
                value: config.cameraTopic,
              },
              cameraInfoTopic: {
                label: "Camera Info topic",
                input: "select",
                options: getCameraInfoOptions(topics),
                value: config.cameraInfoTopic,
              },
              imuTopic: {
                label: "Imu topic",
                input: "select",
                options: getOrientationOptions(topics),
                value: config.imuTopic,
              },
              indicatorPosition: {
                label: "Position",
                input: "toggle",
                value: config.indicatorPosition,
                options: ["Bottom left", "Bottom right", "Top left", "Top right"]
              },
            },
          },
        },
      });
    }, [context, actionHandler, config, topics]);

  useEffect(() => {
    // Save our state to the layout when the topic changes.
    context.saveState({ topic: config });
    if (config.cameraTopic && config.imuTopic) {
      // Subscribe to the new image topic when a new topic is chosen.
      context.subscribe([{topic: config.imuTopic},{topic: config.cameraTopic}]);
    }
  }, [context, config ]);

  useEffect(() => {
    // Get orientation from quaternion then set rotation on arrow
    // console.log("messages", messages)
    if (messages) {
      for (const message of messages) {
        if (message.schemaName === "sensor_msgs/CompressedImage"){
          let imageMessage = message.message as CompressedImage;
          drawImageOnCanvas(imageMessage.data, canvasRef.current!, imageMessage.format).catch(
            (error) => console.log(error),
          );
        } else if ((message.schemaName === "sensor_msgs/Imu") || (message.schemaName === "geometry_msgs/Quaternion")) {
          let quaternion = {} as Quaternion;
          if (message.schemaName === "sensor_msgs/Imu") {
            let imuMessage = message.message as Imu;
            quaternion = imuMessage.orientation as Quaternion;
          } else if (message.schemaName === "geometry_msgs/Quaternion") {
            quaternion = message.message as Quaternion;
          }
          // console.log("quaternion", quaternion);
          const quat = new Quat(quaternion.w, quaternion.x, quaternion.y, quaternion.z,);
          const euler = quat.toEuler();
          console.log("euler", euler);
          const pitchRotationDeg = euler[2] * (180 / Math.PI);
          const rollRotationDeg = euler[1] * (180 / Math.PI);

          setpitch(pitchRotationDeg);
          setroll(rollRotationDeg);

          ai_ringRef.current!.style.transform = `rotate(${rollRotationDeg}deg)`;

          ai_faceRef.current!.style.transform = `rotate(${rollRotationDeg}deg) 
          translate(${Math.round(percentsPerDeg * -pitchRotationDeg * Math.sin(euler[1]))}%,${Math.round(percentsPerDeg * -pitchRotationDeg * Math.cos(euler[1]))}%)`;

        }
      }
    }
  }, [messages]);

  // Setup our onRender function and start watching topics and currentFrame for messages.
  useLayoutEffect(() => {
    context.onRender = (renderState, done) => {
      setRenderDone(() => done);
      setMessages(renderState.currentFrame);
      setTopics(renderState.topics);

      // Save the most recent message on our image topic.
      if (renderState.currentFrame && renderState.currentFrame.length > 0) {
        setMessage(renderState.currentFrame[renderState.currentFrame.length - 1] as ImageMessage);
      }
    };

    context.watch("topics");
    context.watch("currentFrame");
  }, [context]);

  // Call our done function at the end of each render.
  useEffect(() => {
    renderDone?.();
  }, [renderDone]);

  const mainGrid: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  };
  
  const canvasStyle: React.CSSProperties = {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    objectFit: 'contain', /* Utilisez 'contain' pour conserver les proportions de l'image */
    objectPosition: 'center', /* Centrez l'image horizontalement et verticalement */
    width: '100%',
    height: '100%',
  };
  
  const aigroupStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    width: '30%',
    height: '30%',
  };

  const aiStyle: React.CSSProperties = {
    height: "100%",
    width: "100%",
    position: 'absolute',
    // objectFit: 'contain', // Ajoutez cette ligne pour gérer le dimensionnement des images
    justifyContent: 'center',
    alignItems: 'center',
    objectFit: 'contain', /* Utilisez 'contain' pour conserver les proportions de l'image */
    objectPosition: 'center', /* Centrez l'image horizontalement et verticalement */

  };
  
  return (
    <div style={mainGrid}>
      <canvas style={canvasStyle} width={config.width} height={config.height} ref={canvasRef} />
      <div ref={ai_group} style={aigroupStyle}>
          <img src={ai_back} style={aiStyle}/>
          <img src={ai_face} ref={ai_faceRef} style={aiStyle}/>
          <img src={ai_ring} ref={ai_ringRef} style={aiStyle}/>
          <img src={ai_case} ref={ai_caseRef} style={aiStyle}/>
      </div>
    </div>
  );
}

export function initGyrocam(context: PanelExtensionContext): () => void {
  ReactDOM.render(<Gyrocam context={context} />, context.panelElement);

  // Return a function to run when the panel is removed
  return () => {
    ReactDOM.unmountComponentAtNode(context.panelElement);
  };
}