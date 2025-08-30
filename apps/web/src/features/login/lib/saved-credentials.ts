export class SavedCredentials {
  private static readonly STORAGE_KEY = "saved_credentials";

  static save(studentId: string, password: string): void {
    if (typeof window === "undefined") return;
    const credentials = { studentId, password };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(credentials));
  }

  static load(): { studentId: string; password: string } | null {
    if (typeof window === "undefined") return null;
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  static remove(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static exists(): boolean {
    return this.load() !== null;
  }
}