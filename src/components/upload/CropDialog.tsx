import {
  Close,
  Done,
  RotateLeft,
  RotateRight,
  ZoomIn,
} from "@mui/icons-material";
import {
  Box,
  Dialog,
  IconButton,
  Slider,
  Stack,
  Tooltip,
  useTheme,
} from "@mui/material";
import {useEffect, useState} from "react";
import Cropper, {type Area, type Size} from "react-easy-crop";
import {cropImage} from "./functions";

const CropDialog = ({
  open,
  file,
  onClose,
  onConfirm,
}: {
  open: boolean;
  file: string | undefined;
  onConfirm: (file: string) => void;
  onClose: () => void;
}) => {
  const theme = useTheme();

  const [imageSrc, setImageSrc] = useState<string>();
  const [crop, setCrop] = useState({x: 0, y: 0});
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>();
  const [rotation, setRotation] = useState(0);
  const [cropSize] = useState<Size>({width: 200, height: 200});

  // Reset stato quando si chiude il dialog
  useEffect(() => {
    if (!open) {
      setCrop({x: 0, y: 0});
      setZoom(1);
      setRotation(0);
    }
  }, [open]);

  useEffect(() => {
    if (file) {
      setImageSrc(file);
    }
  }, [file]);

  // Funzione per ottenere l"immagine ritagliata
  const handleDoneClick = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    const croppedImage = await cropImage(
      "avatar",
      imageSrc,
      croppedAreaPixels,
      rotation,
    );
    const croppedImageBytes = croppedImage.length * (3 / 4); // Calcola la dimensione in byte dell'immagine base64

    if (croppedImageBytes > 1048487) {
      alert(
        "L'immagine ritagliata è troppo grande. Deve essere inferiore a 1 MB.",
      );
      return;
    }

    onClose();
    onConfirm(croppedImage);
  };

  const handleCropComplete = (_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  return (
    <Dialog open={open} fullWidth maxWidth="md" onClose={onClose}>
      <Stack
        direction="row"
        sx={{backgroundColor: theme.palette.background.paper}}>
        <Box
          sx={{
            position: "relative",
            margin: "0 auto",
            width: 600,
            height: 500,
          }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            cropSize={cropSize}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            rotation={rotation}
            onRotationChange={setRotation}
            onCropComplete={handleCropComplete}
          />
        </Box>
        <Stack
          sx={{height: 500, background: theme.palette.background.paper}}
          direction="column">
          <Stack
            direction="row"
            sx={{p: 1, spacing: 2, justifyContent: "center"}}>
            <IconButton onClick={() => setRotation(prev => prev - 90)}>
              <RotateLeft color="primary" />
            </IconButton>
            <IconButton onClick={() => setRotation(prev => prev + 90)}>
              <RotateRight color="primary" />
            </IconButton>
          </Stack>
          <Stack direction="row" sx={{flex: 1, justifyContent: "center", p: 1}}>
            <Stack direction="column" sx={{gap: 3, alignItems: "center"}}>
              <Slider
                value={zoom}
                orientation="vertical"
                min={0}
                max={3}
                step={0.01}
                onChange={(_, newZoom) => setZoom(newZoom as number)}
              />
              <Tooltip title="Zoom">
                <ZoomIn fontSize="small" color="disabled" />
              </Tooltip>
            </Stack>
          </Stack>
          <Stack
            direction="row"
            sx={{p: 1, spacing: 1, mt: 2, justifyContent: "center"}}>
            <IconButton onClick={handleDoneClick}>
              <Done color="primary" />
            </IconButton>
            <IconButton onClick={onClose}>
              <Close color="primary" />
            </IconButton>
          </Stack>
        </Stack>
      </Stack>
    </Dialog>
  );
};

export {CropDialog};
