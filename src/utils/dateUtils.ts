/**
 * Calculates current age from a birth date string (YYYY-MM-DD),
 * taking into account whether the birthday has already occurred this year.
 */
export function calculateAge(birthDateString: string): number {
  const birthDate = new Date(birthDateString);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // If the birthday month hasn't arrived yet, or in the birthday month the day hasn't arrived, subtract 1
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}
