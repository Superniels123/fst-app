# FST app — deploy & login (jouw stappen)

De app is klaar en gekoppeld aan Supabase. Drie korte acties van jou, dan draait 'ie live én veilig.

## 1. Maak je login-account aan (Supabase)
De app zit achter een werknemers-login. Maak eenmalig je account:
1. Ga naar het Supabase-dashboard → project **FST** → **Authentication → Users → Add user**.
2. E-mail + wachtwoord invullen, en **"Auto Confirm User"** aanvinken.
3. Klaar — met dat account log je in de app in.

## 2. Zet publieke registratie uit (beveiliging)
Zodat niemand buiten FST zelf een account kan maken:
- **Authentication → Providers → Email** → zet **"Allow new users to sign up"** uit.
Nieuwe collega's voeg je voortaan toe via *Add user* (of een uitnodiging).

## 3. Deploy naar Vercel (nieuw project)
Twee opties:

**A. Via git (aanbevolen — dan deployt elke push automatisch):**
1. Maak een lege GitHub-repo (bijv. `fst-app`) en push deze map ernaartoe:
   ```bash
   cd fst-app
   git remote add origin <jouw-github-url>
   git push -u origin main
   ```
2. In Vercel → **Add New → Project** → importeer die repo.
3. **Root Directory** hoeft niet aangepast (de repo is de app zelf). Framework: Vite (autodetect).
4. Deploy. Je krijgt een live URL.

**B. Via de Vercel CLI (snelste eenmalige test):**
```bash
cd fst-app
npx vercel        # eenmalig inloggen, kies het visdex-team, nieuw project "fst-app"
npx vercel --prod
```

> Env-variabelen zijn niet strikt nodig: de Supabase-URL en publieke sleutel zitten al veilig
> als fallback in de code (RLS beschermt de data). Wil je ze netjes scheiden, zet dan in Vercel
> `VITE_SUPABASE_URL` en `VITE_SUPABASE_ANON_KEY` als Environment Variables.

## Lokaal draaien
```bash
cd fst-app
npm install
npm run dev
```
Je ziet eerst het inlogscherm — log in met het account uit stap 1.
