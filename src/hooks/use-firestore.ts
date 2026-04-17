"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  type QueryConstraint,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";

interface UseCollectionOptions {
  extraConstraints?: QueryConstraint[];
  enabled?: boolean;
  /** Change this value to force the subscription to restart with new constraints */
  key?: string;
}

export function useCollection<T extends { id: string }>(
  collectionName: string,
  options: UseCollectionOptions = {}
) {
  const { schoolId } = useAuth();
  const { extraConstraints = [], enabled = true, key = "" } = options;
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!schoolId || !enabled) {
      setLoading(false);
      return;
    }

    const constraints: QueryConstraint[] = [
      where("schoolId", "==", schoolId),
      ...extraConstraints,
    ];

    const q = query(collection(db, collectionName), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as T)
        );
        setData(items);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(`Erro ao carregar ${collectionName}:`, err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [schoolId, collectionName, enabled, key]); // eslint-disable-line react-hooks/exhaustive-deps

  async function add(item: Omit<DocumentData, "id" | "schoolId" | "createdAt" | "updatedAt">) {
    if (!schoolId) throw new Error("Escola não identificada");
    // Firestore rejects undefined values — strip them before writing
    const clean = Object.fromEntries(
      Object.entries(item).filter(([, v]) => v !== undefined)
    );
    return addDoc(collection(db, collectionName), {
      ...clean,
      schoolId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async function update(id: string, updates: Partial<DocumentData>) {
    const clean = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    return updateDoc(doc(db, collectionName, id), {
      ...clean,
      updatedAt: serverTimestamp(),
    });
  }

  async function remove(id: string) {
    return deleteDoc(doc(db, collectionName, id));
  }

  return { data, loading, error, add, update, remove };
}
