# Research Agent

Un asistente de investigación autónomo que busca, lee y sintetiza respuestas con citas reales — construido sobre Next.js 16, AI SDK v6, Vercel AI Gateway y Exa.

> **Demo en vivo:** [research-agent-three-pi.vercel.app](https://research-agent-three-pi.vercel.app)  
> **GitHub:** [github.com/NeryC/research-agent](https://github.com/NeryC/research-agent)

<!--
![Agent reasoning steps](docs/screenshot-agent-steps.png)
![Final answer with sources](docs/screenshot-final-answer.png)
-->

---

## ¿Qué hace este proyecto?

El Research Agent es un agente de IA que actúa como un investigador personal. A diferencia de un chatbot ordinario que responde desde su conocimiento de entrenamiento, este agente:

1. **Busca en internet en tiempo real** usando Exa AI, encontrando páginas relevantes y actuales sobre el tema
2. **Lee el contenido de esas páginas** para obtener información detallada y precisa
3. **Razona en múltiples pasos** — puede buscar, leer varios artículos, volver a buscar con términos refinados, y así sucesivamente hasta tener información suficiente
4. **Sintetiza una respuesta estructurada** en formato Markdown con secciones, listas y comparaciones
5. **Cita todas sus fuentes** con título y URL de cada página que realmente consultó (no referencias inventadas)

Todo esto sucede de forma **visible y transparente** — el usuario ve cada paso que el agente da: qué buscó, qué leyó, y cómo llegó a su respuesta final.

---

## Tutorial paso a paso

### Paso 1: Abre la aplicación

Ve a [research-agent-three-pi.vercel.app](https://research-agent-three-pi.vercel.app). Verás una interfaz de chat con sugerencias de preguntas de ejemplo.

### Paso 2: Escribe una pregunta de investigación

Escribe cualquier pregunta que requiera información actualizada o comparación de fuentes. Por ejemplo:

```
¿Cuáles son las diferencias entre Vercel AI Gateway y LiteLLM?
```

```
¿Qué es pgvector y cómo se compara con Pinecone?
```

```
Explain the latest advances in multimodal AI models in 2024
```

> **Tip:** Las preguntas que se benefician más son las que requieren comparar alternativas, entender tecnologías recientes, o investigar un tema con múltiples fuentes. Preguntas simples de definición también funcionan, pero el agente brilla en investigación compleja.

### Paso 3: Observa al agente razonar

Inmediatamente después de enviar la pregunta, verás una **línea de tiempo de acciones** que se actualiza en tiempo real:

```
🔍 searchWeb("Vercel AI Gateway vs LiteLLM comparison")
   → 5 resultados encontrados

📄 readPage("https://vercel.com/docs/ai-gateway")
   → Leyendo contenido...

🔍 searchWeb("LiteLLM features pricing 2024")
   → 5 resultados encontrados

📄 readPage("https://docs.litellm.ai/docs/")
   → Leyendo contenido...

✅ finalAnswer
   → Generando respuesta...
```

Cada tarjeta muestra qué herramienta usó el agente y el resultado que obtuvo.

### Paso 4: Lee la respuesta con citas

Al finalizar, aparece la respuesta en Markdown con:
- Secciones bien organizadas
- Comparaciones en tablas cuando aplica
- Al final, tarjetas de fuentes con el título y URL de cada página leída

### Paso 5: Haz preguntas de seguimiento

Puedes continuar la conversación con preguntas de seguimiento:
```
¿Cuál tiene mejor soporte para Claude?
```
```
¿Cuánto cuesta cada opción?
```
El historial de conversación se mantiene en memoria durante la sesión.

---

## Demostración: flujo interno completo

Para entender qué pasa bajo el capó cuando escribes una pregunta, aquí está el flujo completo trazado paso a paso:

```
Usuario escribe: "What are the best vector databases in 2024?"
        │
        ▼
┌─────────────────────────────┐
│  Browser (React + useChat)  │
│  POST /api/research         │
│  Body: { messages: [...] }  │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│  Route Handler: /api/research/route.ts                      │
│                                                             │
│  1. Extrae IP del header "x-forwarded-for"                  │
│  2. Verifica rate limit: ¿este IP ha hecho < 5 req/hora?    │
│  3. Llama: researchAgent.stream({ messages })               │
│  4. Retorna un UIMessageStream al navegador                 │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  ToolLoopAgent (AI SDK v6)                                  │
│                                                             │
│  Model: claude-sonnet-4.6 (via Vercel AI Gateway)           │
│  System prompt: "Eres un asistente de investigación..."     │
│  Tools disponibles: searchWeb, readPage, finalAnswer        │
│  stopWhen: stepCountIs(8)  ← máximo 8 iteraciones          │
│                                                             │
│  Iteración 1: El modelo decide llamar searchWeb             │
│  → searchWeb({ query: "best vector databases 2024" })       │
│    → Exa /search → 5 resultados con highlights             │
│    → Resultado devuelto al modelo                           │
│                                                             │
│  Iteración 2: El modelo decide leer uno de los resultados   │
│  → readPage({ url: "https://..." })                         │
│    → Exa /contents → texto completo (hasta 8000 chars)     │
│    → Resultado devuelto al modelo                           │
│                                                             │
│  Iteración 3: El modelo tiene suficiente info               │
│  → finalAnswer({ answer: "...", sources: [...] })           │
│    ← Tool sin execute → loop termina aquí                   │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│  Stream de vuelta al navegador                              │
│  - Cada tool call aparece como tarjeta en tiempo real       │
│  - La respuesta final aparece debajo con fuentes            │
└─────────────────────────────────────────────────────────────┘
```

---

## Arquitectura del código

### Estructura de carpetas

```
research-agent/
├── app/
│   ├── page.tsx                  # Página principal (Server Component)
│   ├── research-client.tsx       # Chat UI (Client Component, useChat)
│   └── api/
│       └── research/
│           └── route.ts          # Route Handler — punto de entrada de la API
├── lib/
│   ├── agent/
│   │   ├── model.ts              # Constante del modelo a usar
│   │   ├── tools.ts              # Definición de las 3 herramientas
│   │   └── research-agent.ts    # Instancia del ToolLoopAgent
│   ├── exa.ts                    # Cliente HTTP para la API de Exa
│   └── rate-limit.ts             # Rate limiter en memoria (IP-based)
└── tests/
    ├── exa.test.ts               # Tests del cliente Exa
    ├── rate-limit.test.ts        # Tests del rate limiter
    └── tools.test.ts             # Tests de las herramientas del agente
```

### Archivo por archivo: qué hace cada uno

#### `app/api/research/route.ts` — El punto de entrada HTTP

```typescript
export async function POST(req: Request) {
  // 1. Extraer IP para rate limiting
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  // 2. Verificar límite de uso
  const limit = rateLimit(ip, { max: 5, windowMs: 60 * 60 * 1000 }); // 5/hora
  if (!limit.allowed) {
    return new Response('Rate limit exceeded. Try again in an hour.', { status: 429 });
  }

  // 3. Parsear el cuerpo — messages es el historial de conversación en formato UIMessage
  const { messages }: { messages: UIMessage[] } = await req.json();

  // 4. Arrancar el agente con streaming
  const result = await researchAgent.stream({
    messages: await convertToModelMessages(messages), // Convierte formato UI → formato del modelo
  });

  // 5. Devolver el stream al cliente
  return result.toUIMessageStreamResponse();
}
```

**¿Por qué `convertToModelMessages`?** El AI SDK v6 separa los mensajes de la UI (que incluyen metadatos de herramientas para mostrar en pantalla) del formato que entiende el modelo (texto plano con roles). Esta función hace esa conversión.

---

#### `lib/agent/research-agent.ts` — El corazón del agente

```typescript
export const researchAgent = new ToolLoopAgent({
  model: RESEARCH_MODEL,                    // claude-sonnet-4.6 via AI Gateway
  instructions: SYSTEM_PROMPT,             // "Eres un asistente de investigación..."
  tools: {
    searchWeb: searchWebTool,              // Busca en internet
    readPage: readPageTool,                // Lee una página específica
    finalAnswer: finalAnswerTool,          // Produce la respuesta final (terminal)
  },
  stopWhen: stepCountIs(8),               // Máximo 8 pasos para evitar bucles infinitos
});
```

`ToolLoopAgent` es el patrón recomendado en AI SDK v6. Encapsula:
- Qué **modelo** usar
- Qué **instrucciones** del sistema seguir
- Qué **herramientas** tiene disponibles
- Cuándo **parar** el bucle

El loop funciona así: el modelo recibe los mensajes, decide llamar una herramienta, esa herramienta se ejecuta, el resultado va de vuelta al modelo, y así sucesivamente hasta que el modelo llama `finalAnswer` (que no tiene `execute`) o se alcanzan los 8 pasos.

---

#### `lib/agent/tools.ts` — Las 3 herramientas del agente

**`searchWeb`** — Busca en internet:
```typescript
export const searchWebTool = tool({
  description: 'Search the web for relevant pages on a topic...',
  inputSchema: z.object({
    query: z.string().describe('The search query'),
  }),
  execute: async ({ query }) => {
    const results = await searchExa(query, 5); // Máximo 5 resultados
    return results.map((r) => ({
      title: r.title,
      url: r.url,
      highlights: r.highlights ?? [], // Fragmentos relevantes pre-extraídos por Exa
    }));
  },
});
```

**`readPage`** — Lee el contenido completo de una URL:
```typescript
export const readPageTool = tool({
  description: 'Read the full text content of a specific web page...',
  inputSchema: z.object({ url: z.string().url() }),
  execute: async ({ url }) => {
    const page = await readExaPage(url);
    return { title: page.title, url: page.url, content: page.content }; // hasta 8000 chars
  },
});
```

**`finalAnswer`** — La herramienta terminal (sin `execute`):
```typescript
export const finalAnswerTool = tool({
  description: 'Submit the final answer with structured citations...',
  inputSchema: z.object({
    answer: z.string(),      // Respuesta en Markdown
    sources: z.array(z.object({
      url: z.string().url(),
      title: z.string(),
      snippet: z.string().optional(),
    })),
  }),
  // ← Sin execute: cuando el modelo llama esta tool, el loop para inmediatamente
});
```

**¿Por qué sin `execute`?** Esta es la técnica clave. El loop de herramientas del AI SDK para automáticamente cuando encuentra una tool sin `execute`. Esto es mucho más limpio que parsear texto libre para detectar que el agente "terminó de razonar" — el agente simplemente llama una función con estructura conocida y el loop para.

---

#### `lib/exa.ts` — El cliente de búsqueda web

Exa tiene 2 endpoints que usamos:

```typescript
// /search — encuentra páginas relevantes
export async function searchExa(query: string, numResults = 5): Promise<ExaResult[]> {
  const res = await fetch(`${EXA_BASE}/search`, {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      numResults,
      type: 'auto',
      contents: { highlights: true }, // Devuelve fragmentos relevantes automáticamente
    }),
  });
  // ...
}

// /contents — extrae el texto completo de una URL
export async function readExaPage(url: string): Promise<ExaPage> {
  const res = await fetch(`${EXA_BASE}/contents`, {
    method: 'POST',
    body: JSON.stringify({
      urls: [url],
      text: { maxCharacters: 8000 }, // Límite para mantener prompts acotados
    }),
  });
  // ...
}
```

**¿Por qué Exa en vez de Google/Bing?** Exa devuelve el texto de la página directamente, sin HTML crudo. Esto elimina la necesidad de un parser HTML (Cheerio, Readability) y evita problemas con anti-bots o páginas con JavaScript pesado.

---

#### `lib/rate-limit.ts` — Protección de costos

```typescript
const buckets = new Map<string, Bucket>(); // En memoria, por instancia

export function rateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    // Primera request de esta IP o ventana expirada — reiniciar contador
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { allowed: true, remaining: opts.max - 1 };
  }

  if (existing.count >= opts.max) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: opts.max - existing.count };
}
```

Límite: **5 queries por IP por hora**. Al usar un `Map` en memoria, el límite se resetea en cada cold start de Vercel (es decir, no es global entre instancias). Para una demo de portafolio esto es suficiente; en producción se usaría Upstash Redis.

---

### Cómo fluye el stream al navegador

El AI SDK v6 usa un formato de stream propio ("UI Message Stream") que:
1. Envía eventos parciales para cada paso: inicio de tool call, resultado, texto generado, etc.
2. El cliente (`useChat` + `DefaultChatTransport`) los consume y actualiza el estado de React automáticamente
3. Las tarjetas de herramientas aparecen en tiempo real sin ningún polling

```
Cliente                    Servidor (stream SSE)
  |                              |
  |------ POST /api/research --->|
  |                              | (modelo decide buscar)
  |<-- data: tool_call_start ---|  → aparece tarjeta "Buscando..."
  |                              | (Exa devuelve resultados)
  |<-- data: tool_call_end -----|  → tarjeta muestra resultados
  |                              | (modelo decide leer página)
  |<-- data: tool_call_start ---|  → aparece tarjeta "Leyendo..."
  |                              | (Exa devuelve contenido)
  |<-- data: tool_call_end -----|  → tarjeta muestra resumen
  |                              | (modelo llama finalAnswer)
  |<-- data: text_delta --------|  → respuesta aparece letra a letra
  |<-- data: finish ------------|
```

---

## Stack tecnológico

| Capa | Tecnología | ¿Por qué? |
|------|-----------|-----------|
| Framework | Next.js 16 App Router | Server Components + Route Handlers + deployment en Vercel |
| AI SDK | Vercel AI SDK v6 | `ToolLoopAgent`, streaming nativo, `useChat` hook |
| Modelo | `claude-sonnet-4.6` | Mejor en razonamiento multi-paso y uso de herramientas |
| Gateway | Vercel AI Gateway | Una sola API key, failover automático, observabilidad |
| Búsqueda | Exa AI | Devuelve texto limpio directamente (no HTML crudo) |
| UI | Tailwind v4 + shadcn/ui | Componentes accesibles y estilizado utilitario |
| Tests | Vitest + happy-dom | Fast unit tests, compatible con ESM |
| Deploy | Vercel (Hobby) | CI/CD automático desde GitHub |

---

## Setup local

```bash
git clone https://github.com/NeryC/research-agent.git
cd research-agent
npm install
cp .env.example .env.local
```

Edita `.env.local`:
```env
AI_GATEWAY_API_KEY=tu_clave_de_vercel_ai_gateway
EXA_API_KEY=tu_clave_de_exa
```

| Variable | Dónde conseguirla |
|----------|-------------------|
| `AI_GATEWAY_API_KEY` | [vercel.com](https://vercel.com) → tu equipo → AI Gateway → API Keys |
| `EXA_API_KEY` | [dashboard.exa.ai](https://dashboard.exa.ai) |

```bash
npm run dev    # → http://localhost:3000
npm test       # → 14 tests (exa, rate-limit, tools)
npm run lint
```

---

## Decisiones técnicas explicadas

### ¿Por qué `ToolLoopAgent` en vez de `streamText` con tools?

`streamText` con tools requiere que el desarrollador maneje manualmente el loop: detectar si el modelo quiso llamar una tool, ejecutarla, volver a llamar al modelo con el resultado, y decidir cuándo parar. `ToolLoopAgent` encapsula todo esto:

```typescript
// Sin ToolLoopAgent (más verboso, más frágil):
let messages = initialMessages;
for (let i = 0; i < 8; i++) {
  const result = await streamText({ model, messages, tools });
  if (result.finishReason === 'stop') break;
  messages = [...messages, ...result.responseMessages];
}

// Con ToolLoopAgent (declarativo):
const agent = new ToolLoopAgent({ model, tools, stopWhen: stepCountIs(8) });
const result = await agent.stream({ messages });
```

### ¿Por qué Vercel AI Gateway en vez del SDK de Anthropic directamente?

Con el SDK directo necesitas manejar API keys de cada proveedor por separado. Con el Gateway:
- Una sola `AI_GATEWAY_API_KEY` para todos los modelos
- Si Anthropic tiene un outage, el Gateway hace failover automático a Vertex o Bedrock
- El dashboard de Vercel muestra logs y costos de cada request
- El código no cambia si cambias de proveedor

### ¿Por qué `finalAnswer` sin `execute`?

Alternativa 1: Parsear el texto del modelo para detectar que "terminó". Frágil y no tipado.

Alternativa 2: Tool terminal sin `execute`. El modelo llama la tool con un esquema Zod conocido, el SDK para el loop inmediatamente, y tenemos `{ answer: string, sources: Source[] }` con tipos. Cero parsing, cero regex.

---

## Límites

| Límite | Valor | Razón |
|--------|-------|-------|
| Queries por IP/hora | 5 | Proteger cuota de Exa y costos de API |
| Pasos máximos por query | 8 | Evitar bucles infinitos en queries ambiguas |
| Resultados por búsqueda | 5 | Balance entre contexto y tamaño del prompt |
| Contenido por página | 8,000 caracteres | Mantener prompts dentro del presupuesto de tokens |
| Tiempo máximo de función | 60 segundos | Límite del plan Vercel Hobby |
