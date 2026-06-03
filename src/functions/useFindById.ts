import {
  doc,
  getDoc,
  type CollectionReference,
  type DocumentData,
} from "firebase/firestore";
import {useEffect, useState} from "react";

const useFindById = <T extends DocumentData>({
  collection,
  id,
}: {
  collection: CollectionReference<T, T> | undefined;
  id: string | undefined;
}) => {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!collection || !id) return;

    const docRef = doc(collection, id);
    getDoc(docRef)
      .then(snapshot => {
        if (snapshot.exists()) {
          setData({
            ...snapshot.data(),
            id: snapshot.id,
          } as T);
        } else {
          console.error(`info - Document with id ${id} not found`);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [collection, id]);

  return {data, loading};
};

export {useFindById};
