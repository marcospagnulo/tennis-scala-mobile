import {type Area} from "react-easy-crop";

async function cropImage(
  filename: string,
  imageSrc: string,
  crop: Area,
  rotation: number = 0,
): Promise<string> {
  return new Promise(resolve => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      const rad = (rotation * Math.PI) / 180;

      // Calcoliamo la nuova dimensione dopo la rotazione
      const sin = Math.abs(Math.sin(rad));
      const cos = Math.abs(Math.cos(rad));
      const rotatedWidth = image.width * cos + image.height * sin;
      const rotatedHeight = image.width * sin + image.height * cos;

      // Imposta la dimensione del canvas alla dimensione dell'immagine ruotata
      canvas.width = rotatedWidth;
      canvas.height = rotatedHeight;

      // Trasliamo e ruotiamo il contesto
      ctx.translate(rotatedWidth / 2, rotatedHeight / 2);
      ctx.rotate(rad);

      // Disegna l'immagine ruotata centrata
      ctx.drawImage(image, -image.width / 2, -image.height / 2);

      // Ora facciamo il crop
      const croppedCanvas = document.createElement("canvas");
      const croppedCtx = croppedCanvas.getContext("2d")!;
      croppedCanvas.width = crop.width;
      croppedCanvas.height = crop.height;

      // Ritaglia la porzione desiderata dalla canvas ruotata
      croppedCtx.drawImage(
        canvas,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height,
      );

      // Converti il risultato in Blob e restituiscilo come File
      croppedCanvas.toBlob(
        blob => {
          if (blob) {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve(reader.result as string);
            };
            reader.readAsDataURL(
              new File([blob], `${filename}.jpeg`, {type: "image/jpeg"}),
            );
          }
        },
        "image/jpeg",
        0.5,
      );
    };
  });
}

export {cropImage};
