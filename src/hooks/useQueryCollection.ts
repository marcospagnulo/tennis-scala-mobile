import type {GridPaginationModel} from "@mui/x-data-grid";
import {
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  startAfter,
  query,
  type CollectionReference,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import {useCallback, useEffect, useRef, useState} from "react";

const useQueryCollection = <T extends DocumentData>(
  collection: CollectionReference<T, T>,
  pagination: GridPaginationModel,
  queryText: string,
) => {
  const [items, setItems] = useState<T[]>([]);
  const [filteredItems, setFilteredItems] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [rowCount, setRowCount] = useState(0);
  const lastDocsRef = useRef<Map<number, QueryDocumentSnapshot<T>>>(new Map());

  const fetchData = useCallback(
    async (
      collection: CollectionReference<T, T>,
      pagination: GridPaginationModel,
    ) => {
      setLoading(true);

      let q = query(
        collection,

        orderBy("createdAt", "desc"),
        limit(pagination.pageSize),
      );

      // Se non è la prima pagina, usa startAfter con l'ultimo doc della pagina precedente
      if (pagination.page > 0) {
        const prevPageLastDoc = lastDocsRef.current.get(pagination.page - 1);
        if (prevPageLastDoc) {
          q = query(
            collection,
            orderBy("createdAt", "desc"),
            startAfter(prevPageLastDoc),
            limit(pagination.pageSize),
          );
        }
      }

      const documentSnapshots = await getDocs(q);
      const data = documentSnapshots.docs.map(
        doc => ({...doc.data(), id: doc.id}) as T,
      );

      // Salva l'ultimo documento di questa pagina per la paginazione successiva
      if (documentSnapshots.docs.length > 0) {
        const lastDoc =
          documentSnapshots.docs[documentSnapshots.docs.length - 1];
        lastDocsRef.current.set(pagination.page, lastDoc);
      }

      setItems(data);
      setLoading(false);
    },
    [],
  );

  const searchData = useCallback(async (queryText: string) => {
    if (queryText.length > 2) {
      const filtered: T[] = [];
      items.forEach(item => {
        const values = Object.values(item).map(value =>
          String(value).toLowerCase(),
        );
        if (values.some(value => value.includes(queryText.toLowerCase()))) {
          filtered.push(item);
        }
      });
      setFilteredItems(filtered);
    } else {
      setFilteredItems(items);
    }
  }, [items]);

  useEffect(() => {
    searchData(queryText);
  }, [searchData, queryText]);

  useEffect(() => {
    fetchData(collection, pagination);
  }, [fetchData, collection, pagination]);

  useEffect(() => {
    const fetchRowCount = async () => {
      const snapshot = await getCountFromServer(collection);
      setRowCount(snapshot.data().count);
    };
    fetchRowCount();
  }, [collection]);

  return {items: filteredItems, loading, rowCount};
};

export {useQueryCollection};
