type ClassValue = false | null | string | undefined;

export function cx(...classes: ClassValue[]) {
  return classes.filter(Boolean).join(' ');
}
