/** Affiche un repère visible tant qu'Ines n'a pas rempli l'information dans l'admin. */
export function orTodo(value: string): string {
  return value.trim() || "[à compléter]";
}
