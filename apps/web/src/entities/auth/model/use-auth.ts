"use client";
import { useEffect, useRef } from "react";
import { useAuthSelectors } from "./selectors";
import { useAuthActions } from "./actions";

export const useAuth = () => {
  const selectors = useAuthSelectors();
  const actions = useAuthActions();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      actions.initialize();
    }
  }, [actions]);

  return {
    ...selectors,
    ...actions,
  };
};