import JSZip from 'jszip';

const generateZipBlob = async (canvas: HTMLCanvasElement): Promise<string> => {
  const imageBlob = canvas.toDataURL('image/png').split('base64,')[1];
  const zip = new JSZip();
  zip.file('map.png', imageBlob, { base64: true });
  return zip.generateAsync({ type: 'base64' });
};

const triggerDownload = (blob: string) => {
  const dataUrl = `data:application/zip;base64,${blob}`;

  // SUUUUUPER HACK ALERT
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = 'export.zip';
  a.hidden = true;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export { generateZipBlob, triggerDownload };
