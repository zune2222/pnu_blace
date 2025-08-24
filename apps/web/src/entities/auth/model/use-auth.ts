"use client";
import { useEffect } from "react";
import { useAuthSelectors } from "./selectors";
import { useAuthActions } from "./actions";

export const useAuth = () => {
  const selectors = useAuthSelectors();
  const actions = useAuthActions();

  useEffect(() => {
    actions.initialize();
  }, []);

  return {
    ...selectors,
    ...actions,
  };
};