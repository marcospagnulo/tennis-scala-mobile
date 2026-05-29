import {doc, getDoc} from "firebase/firestore";
import {useEffect, useState} from "react";
import {collections} from "../lib/firebase";
import type {Player} from "../domain/types";
import {Avatar, CircularProgress} from "@mui/material";

const PlayerAvatar = ({
  playerId,
  size = 40,
}: {
  playerId: string;
  size?: number;
}) => {
  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState<Player>();

  useEffect(() => {
    if (!collections) {
      setLoading(false);
      return;
    }

    const playerDoc = doc(collections.players, playerId);
    getDoc(playerDoc)
      .then(snapshot => {
        if (snapshot.exists()) {
          setPlayer({
            ...snapshot.data(),
            id: snapshot.id,
          } as Player);
        } else {
          console.error(`Player with id ${playerId} not found`);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [playerId]);

  if (loading) {
    return <CircularProgress sx={{width: size - 4, height: size - 4}} />;
  }
  return <Avatar src={player?.avatar} sx={{width: size, height: size}} />;
};

export {PlayerAvatar};
