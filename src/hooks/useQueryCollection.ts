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
  where,
  type WhereFilterOp,
  FieldPath,
} from "firebase/firestore";
import {useCallback, useEffect, useRef, useState} from "react";

type sort = {
  field: string | FieldPath;
  direction: "asc" | "desc";
}

type filter = {
  fieldPath: string | FieldPath, 
  opStr: WhereFilterOp, 
  value: unknown
}

const useQueryCollection = <T extends DocumentData>({
  collection,
  filters = [],
  pagination,
  queryText,
  sort = []
}:{
  collection: CollectionReference<T, T> | undefined,
  pagination?: GridPaginationModel,
  queryText?: string,
  filters?: filter[],
  sort?: sort[]
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

      const documentSnapshots = await getDocs(
        query(
          collection, 
          ...(filters.map(filter => where(filter.fieldPath, filter.opStr, filter.value))),
          ...(sort.map(s => orderBy(s.field, s.direction))),
        ),
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
    async (
      collection: CollectionReference<T, T>,
      pagination: GridPaginationModel,
    ) => {
      setLoading(true);

      let q = query(
        collection,
        ...(filters.map(filter => where(filter.fieldPath, filter.opStr, filter.value))),
        ...(sort.map(s => orderBy(s.field, s.direction))),
        limit(pagination.pageSize),
      );

      // Se non è la prima pagina, usa startAfter con l'ultimo doc della pagina precedente
      if (pagination.page > 0) {
        const prevPageLastDoc = lastDocsRef.current.get(pagination.page - 1);
        if (prevPageLastDoc) {
          q = query(
            collection,
            ...(sort.map(s => orderBy(s.field, s.direction))),
            ...(filters.map(filter => where(filter.fieldPath, filter.opStr, filter.value))),
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
    if (!collection) return;

    if (pagination) {
      fetchDataPaginated(collection, pagination);
    } else {
      fetchData(collection);
    }
  }, [collection, pagination, refetchTS]);

  useEffect(() => {
    if (!collection) return;

    const fetchRowCount = async () => {
      const snapshot = await getCountFromServer(collection);
      setRowCount(snapshot.data().count);
    };
    fetchRowCount();
  }, [collection]);

  return {items: filteredItems, loading, rowCount, refetch};
};

export {useQueryCollection};
