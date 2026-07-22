# Team Labicana — Deploy Guide

Ei app ta ekhon standalone — nijer link e chalanor jonno 2 ta jinis lagbe:
1. **Firebase** (free) — data save/share korar jonno
2. **Vercel** (free) — link/hosting er jonno

Niche step by step likha ache.

---

## Step 1: Firebase setup (data storage)

1. https://console.firebase.google.com e giye Google account diye login koro
2. "Add project" e click koro, naam dao (jemon `team-labicana`), continue continue kore project banao
3. Project dashboard e "Firestore Database" e giye "Create database" click koro
   - Location jekono select korte paro (default thakleo hobe)
   - "Start in **test mode**" select koro (shuru te easy hobe, pore secure kora jabe)
4. Ekhon left side e gear icon > "Project settings" e jao
5. Niche "Your apps" section e "</>" (Web) icon e click koro
6. App nickname dao (jemon `labicana-web`), "Register app" click koro
7. Ekta code block dekhabe jar moddhe `firebaseConfig = {...}` ache — eita পুরোটা copy koro
8. Ei project er `src/firebase.js` file ta khulo, ar `firebaseConfig` object ta tomar copy kora value diye replace koro

---

## Step 2: Vercel e deploy

1. https://vercel.com e giye GitHub account diye sign up/login koro (na thakle GitHub e free account banao age)
2. Ei folder ta (`labicana-app`) GitHub e ekta notun repository hisebe upload koro
   - Simplest way: https://github.com/new e giye repo banao, tarpor GitHub-er "upload files" button diye ei shob file drag-drop kore dao
3. Vercel dashboard e "Add New" > "Project" click koro
4. Tomar GitHub repo ta select koro, "Import" click koro
5. Vercel nijei bujhe jabe eta Vite project — kichu change korার dorkar nei, sudhu "Deploy" click koro
6. 1-2 minute e ekta link paye jabe, jemon: `team-labicana.vercel.app`

---

## Step 3: Custom domain (optional, jodi professional link chao)

1. Namecheap/GoDaddy theke ekta domain kino (jemon `teamlabicana.com`, taka lagbe ~$10-15/year)
2. Vercel project settings e "Domains" e giye domain ta add koro
3. Domain provider er DNS settings e Vercel er deya instructions follow koro

Eita korle link ta `teamlabicana.com` er moto dekhabe, kono "Claude" naam thakbe na.

---

## Note

- Password edit mode er jonno: **Shaishab** (App.jsx file e `EDIT_PASSWORD` change kore nijeও set korte paro)
- Copyright: "© Copyright by Shaishab" — App.jsx e likha ache, change korte chaile shekhane e edit koro
