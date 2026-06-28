import {
  onSnapshot,
  orderBy,
  query,
  QueryFieldFilterConstraint,
  QueryLimitConstraint,
  QueryOrderByConstraint,
  QueryStartAtConstraint,
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
  skip = false,
}: {
  collection: CollectionReference<T, T> | undefined;
  filters?: queryFilter[];
  sort?: querySort[];
  skip?: boolean;
}) => {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!collection || skip) return;

    const constraints: (
      | QueryLimitConstraint
      | QueryFieldFilterConstraint
      | QueryOrderByConstraint
      | QueryStartAtConstraint
    )[] = [];

    filters?.forEach(filter => {
      constraints.push(where(filter.fieldPath, filter.opStr, filter.value));
    });
    sort?.forEach(s => {
      if (s.sort) {
        constraints.push(orderBy(s.field, s.sort));
      }
    });

    const q = query(collection, ...constraints);
    const unsubscribe = onSnapshot(q, snapshot => {
      const items = snapshot.docs.map(
        doc => ({...doc.data(), id: doc.id}) as T,
      );
      setItems(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [collection, filters, sort, skip]);

  return {items, loading};
};

export {useLiveCollection};
