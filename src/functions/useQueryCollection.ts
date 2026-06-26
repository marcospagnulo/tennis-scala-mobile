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
  where,
} from "firebase/firestore";
import {useCallback, useEffect, useRef, useState} from "react";
import type {queryFilter, queryPage, querySort} from "../domain/types";

const useQueryCollection = <T extends DocumentData>({
  collection,
  filters = [],
  pagination,
  queryText,
  sort = [],
  skip = false,
}: {
  collection: CollectionReference<T, T> | undefined;
  pagination?: queryPage;
  queryText?: string;
  filters?: queryFilter[];
  sort?: readonly querySort[];
  skip?: boolean;
}) => {
  const [refetchTS, setRefetchTs] = useState<number>(0);
  const [items, setItems] = useState<T[]>([]);
  const [filteredItems, setFilteredItems] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [rowCount, setRowCount] = useState(0);
  const lastDocsRef = useRef<Map<number, QueryDocumentSnapshot<T>>>(new Map());

  const fetchData = useCallback(
    async (collection: CollectionReference<T, T>) => {
      setLoading(true);

      const filterConstraints = filters.map(filter =>
        where(filter.fieldPath, filter.opStr, filter.value),
      );
      const sortConstraints = sort
        .map(s => (s.sort ? orderBy(s.field, s.sort) : undefined))
        .filter(s => s !== undefined);

      const documentSnapshots = await getDocs(
        query(collection, ...filterConstraints, ...sortConstraints),
      );
      const data = documentSnapshots.docs.map(
        doc => ({...doc.data(), id: doc.id}) as T,
      );
      setItems(data);
      setFilteredItems(data);
      setLoading(false);
    },
    [filters, sort],
  );

  const fetchDataPaginated = useCallback(
    async (collection: CollectionReference<T, T>, pagination: queryPage) => {
      setLoading(true);

      const filterConstraints = filters.map(filter =>
        where(filter.fieldPath, filter.opStr, filter.value),
      );
      const sortConstraints = sort
        .map(s => (s.sort ? orderBy(s.field, s.sort) : undefined))
        .filter(s => s !== undefined);

      let q = query(
        collection,
        ...filterConstraints,
        ...sortConstraints,
        limit(pagination.pageSize),
      );

      // Se non è la prima pagina, usa startAfter con l'ultimo doc della pagina precedente
      if (pagination.page > 0) {
        const prevPageLastDoc = lastDocsRef.current.get(pagination.page - 1);
        if (prevPageLastDoc) {
          q = query(
            collection,
            ...sortConstraints,
            ...filterConstraints,
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
      setFilteredItems(data);
      setLoading(false);
    },
    [filters, sort],
  );

  const searchData = useCallback(
    async (queryText: string) => {
      if (queryText.length > 2) {
        setLoading(true);
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
        setLoading(false);
      } else {
        setFilteredItems(items);
        setLoading(false);
      }
    },
    [items],
  );

  const refetch = () => {
    setRefetchTs(new Date().getTime());
  };

  useEffect(() => {
    if (queryText) {
      searchData(queryText);
    }
  }, [searchData, queryText]);

  useEffect(() => {
    if (!collection || skip) return;

    if (pagination) {
      fetchDataPaginated(collection, pagination);
    } else {
      fetchData(collection);
    }
  }, [collection, pagination, refetchTS, skip]);

  useEffect(() => {
    if (!collection || skip) return;

    const fetchRowCount = async () => {
      const snapshot = await getCountFromServer(collection);
      setRowCount(snapshot.data().count);
    };
    fetchRowCount();
  }, [collection, skip]);

  return {items: filteredItems, loading, rowCount, refetch};
};

export {useQueryCollection};
