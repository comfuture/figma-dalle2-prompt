figma.showUI(__html__, { themeColors: true });
figma.ui.resize(512, 512);

figma.ui.onmessage = async (msg) => {
  // load the api key from client storage
  if (msg.type === 'preferences.read') {
    const apiKey = await figma.clientStorage.getAsync('api_key');
    figma.ui.postMessage({ type: 'preferences.loaded', data: apiKey });

  }

  // save the api key to client storage
  if (msg.type === 'preferences.save') {
    await figma.clientStorage.setAsync('api_key', msg.data);
  }

  // create a frame and image node from the image data
  if (msg.type === 'image.data') {
    const nodes: SceneNode[] = [];

    const frame = figma.createFrame();
    frame.resizeWithoutConstraints(1024, 1024);
    frame.name = msg.prompt;

    const image = figma.createImage(msg.im);
    const paint: ImagePaint = {
      type: 'IMAGE',
      imageHash: image.hash,
      scaleMode: "FIT",
    }
    const imageNode = figma.createRectangle();
    imageNode.resizeWithoutConstraints(1024, 1024);
    imageNode.fills = [paint];
    imageNode.name = msg.prompt;

    frame.appendChild(imageNode);
    figma.currentPage.appendChild(frame);
    nodes.push(frame);
    figma.currentPage.selection = nodes;
    // figma.viewport.scrollAndZoomIntoView(nodes);
    figma.closePlugin();
  }
};
