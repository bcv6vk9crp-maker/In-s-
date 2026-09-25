"use client";

import { useTransition } from "react";

/**
 * Envoie le formulaire à l'action sans utiliser `<form action>` :
 * React viderait alors les champs après chaque envoi, même en cas d'erreur.
 */
export function useSubmit(dispatch: (form: FormData) => void) {
  const [, startTransition] = useTransition();
  return (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(() => dispatch(form));
  };
}
