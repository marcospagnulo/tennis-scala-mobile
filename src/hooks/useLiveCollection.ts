import {
  onSnapshot,
  orderBy,
  query,
  where,
  type CollectionReference,
  type DocumentData,
} from "firebase/firestore";
import {useEffect, useState} from "react";
import type {queryFilter, querySort} from "../domain/types";

const useLiveCollection = <T extends DocumentData>({
  collection,
  filters,
  sort,
}: {
  collection: CollectionReference<T, T> | undefined;
  filters?: queryFilter[];
  sort?: querySort[];
}) => {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!collection) return;
    const q = query(
      collection,
      ...(filters?.map(filter =>
        where(filter.fieldPath, filter.opStr, filter.value),
      ) || []),
      ...(sort?.map(s => orderBy(s.field, s.direction)) || []),
    );
    const unsubscribe = onSnapshot(q, snapshot => {
      const playersData = snapshot.docs.map(
        doc => ({...doc.data(), id: doc.id}) as T,
      );
      setItems(playersData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [collection, filters, sort]);

  return {items, loading};
};

export {useLiveCollection};
