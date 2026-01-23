export const generateQRCodeWithInfo = async (qrCodeUrl, product) => {
  const qrResponse = await fetch(qrCodeUrl);
  if (!qrResponse.ok) {
    throw new Error('Failed to fetch QR code image');
  }
  const qrBlob = await qrResponse.blob();
  
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const qrSize = 300;
    const padding = 20;
    const textAreaHeight = 120;
    const canvasWidth = qrSize + (padding * 2);
    const canvasHeight = qrSize + textAreaHeight + (padding * 2);
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    const qrImage = new Image();
    const objectUrl = URL.createObjectURL(qrBlob);
    
    qrImage.onload = () => {
      const qrX = padding;
      const qrY = padding;
      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
      
      const textStartY = qrSize + padding + 20;
      let currentY = textStartY;
      
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      
      ctx.font = 'bold 18px Arial, sans-serif';
      ctx.fillText(product.product_name || 'N/A', padding, currentY);
      currentY += 25;
      
      if (product.type_name) {
        ctx.font = '14px Arial, sans-serif';
        ctx.fillStyle = '#4b5563';
        ctx.fillText(`Type: ${product.type_name}`, padding, currentY);
        currentY += 20;
      }
      
      if (product.location_name) {
        ctx.font = '14px Arial, sans-serif';
        ctx.fillStyle = '#4b5563';
        ctx.fillText(`Location: ${product.location_name}`, padding, currentY);
        currentY += 20;
      }
      
      if (product.purchase_date) {
        ctx.font = '14px Arial, sans-serif';
        ctx.fillStyle = '#4b5563';
        ctx.fillText(`Purchase Date: ${product.purchase_date}`, padding, currentY);
      }
      
      URL.revokeObjectURL(objectUrl);
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate image blob'));
        }
      }, 'image/png');
    };
    
    qrImage.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load QR code image'));
    };
    
    qrImage.src = objectUrl;
  });
};
