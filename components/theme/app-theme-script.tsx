import { APP_THEME_STORAGE_KEY } from "@/lib/constants/theme";

/**
 * Évite le flash clair au chargement de l’app si le mode nuit est enregistré.
 * Injecté uniquement dans app/(app)/layout.tsx
 */
export function AppThemeScript() {
  const script = `(function(){try{var k=${JSON.stringify(APP_THEME_STORAGE_KEY)};var t=localStorage.getItem(k);if(t==="dark")document.documentElement.classList.add("dark");}catch(e){}})();`;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
}
