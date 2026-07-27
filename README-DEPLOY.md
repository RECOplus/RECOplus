# Desplegar el escaneo preciso (IA) en Vercel

Esto agrega un botón **"✨ Escaneo preciso (IA)"** al escáner. A diferencia
del escaneo continuo con MobileNet (que ya tenías, corre en el navegador,
gratis y sin límite), este botón manda UNA foto a Gemini a través de una
función serverless que esconde tu API key. Es más preciso pero requiere
internet y tiene cuota gratuita limitada (~1,500 llamadas/día).

## 1. Consigue una API key de Gemini (gratis)

1. Entra a https://aistudio.google.com/apikey
2. Crea una key nueva (no pide tarjeta para la capa gratuita).
3. Cópiala, la vas a necesitar en el paso 3.

## 2. Sube el proyecto a Vercel

Estructura que debe tener tu carpeta (ya la dejé así):

```
/
├── api/
│   └── classify.js       <- función serverless (NO tocar el path, Vercel lo detecta solo)
├── scanner-core.js
├── material-map.js
├── scanner-demo.html
├── scanner-widget.css
└── package.json
```

Opciones para subirlo:

- **Sin terminal**: crea un repo en GitHub con estos archivos, entra a
  https://vercel.com/new, conecta el repo y dale "Deploy" (framework
  preset: "Other", no necesita build command).
- **Con terminal**: `npm i -g vercel` y luego, parado en la carpeta del
  proyecto, `vercel` (te guía con preguntas) y después `vercel --prod`.

## 3. Configura la API key en Vercel (paso crítico)

En el dashboard del proyecto en Vercel:

`Settings` → `Environment Variables` → agregar:

- **Name**: `GEMINI_API_KEY`
- **Value**: la key que copiaste en el paso 1
- **Environments**: marca Production, Preview y Development

Después de agregarla, hay que **volver a desplegar** (Vercel no aplica
env vars nuevas a un deploy ya existente) — en `Deployments`, elige el
último y `Redeploy`.

## 4. Probar

Abre la URL que te dio Vercel (algo como `tu-proyecto.vercel.app`),
inicia el escáner normal, apunta a un objeto y toca **"Escaneo preciso
(IA)"**. Debería tardar 1-2 segundos y mostrar el resultado con la
etiqueta "IA · confianza alta/media/baja".

## Notas

- El endpoint queda en `/api/classify` — el frontend lo llama con una
  ruta relativa, así que **frontend y función deben vivir en el mismo
  proyecto/dominio de Vercel**. Si algún día separas el frontend a otro
  hosting, hay que cambiar `endpointClasificacionIA` en `scanner-core.js`
  a la URL completa y agregar CORS en `api/classify.js`.
- Si ves el error "Falta configurar GEMINI_API_KEY..." es porque el
  paso 3 no se hizo o falta el redeploy.
- El escaneo en vivo con MobileNet sigue funcionando 100% igual que
  antes, con o sin el backend desplegado — el botón de IA es aditivo.
