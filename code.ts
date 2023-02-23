figma.showUI(__html__, { themeColors: true });
figma.ui.resize(512, 512);

type IPCMessageType = 'preferences.read' | 'preferences.save' | 'image.data';

type IPCMessage = {
  type: IPCMessageType;
  [key: string]: any;
}

/** load the api key from client storage */
async function loadPreferences() {
  const apiKey = await figma.clientStorage.getAsync('api_key');
  figma.ui.postMessage({ type: 'preferences.loaded', data: apiKey });
}

/** save the api key to client storage */
async function savePreferences(apiKey: string) {
  await figma.clientStorage.setAsync('api_key', apiKey);
}

/** creates an image frame and adds it to the page */
async function createImage(prompt: string, imageData: Uint8Array, width: number = 1024, height: number = 1024) {
  const nodes: SceneNode[] = [];

  const frame = figma.createFrame();
  frame.resizeWithoutConstraints(1024, 1024);
  frame.name = prompt;

  const image = figma.createImage(imageData);
  const paint: ImagePaint = {
    type: 'IMAGE',
    imageHash: image.hash,
    scaleMode: "FIT",
  }
  const imageNode = figma.createRectangle();
  imageNode.resizeWithoutConstraints(width, height);
  imageNode.fills = [paint];
  imageNode.name = prompt;

  frame.appendChild(imageNode);

  // position the frame
  let minX = 0
  let maxY = 0
  figma.skipInvisibleInstanceChildren = true
  function traverse(node: BaseNode) {
    if ("children" in node) {
      if (node.type === "FRAME") {
        minX = Math.min(minX, node.x)
        maxY = Math.max(maxY, node.y + node.height)
      }
      if (node.type !== "INSTANCE") {
        for (const child of node.children) {
          traverse(child)
        }
      }
    }
  }
  traverse(figma.root)

  frame.x = minX
  frame.y = maxY + 40

  figma.closePlugin()

  figma.currentPage.appendChild(frame);
  nodes.push(frame);
  figma.currentPage.selection = nodes;
  // figma.viewport.scrollAndZoomIntoView(nodes);
}

figma.ui.onmessage = async (msg: IPCMessage) => {
  switch (msg.type) {
    case 'preferences.read':
      await loadPreferences();
      break;
    case 'preferences.save':
      await savePreferences(msg.data);
      break;
    case 'image.data':
      await createImage(msg.prompt, msg.im);
      figma.closePlugin();
      break;
  }
}
