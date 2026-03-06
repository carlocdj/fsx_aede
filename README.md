# AEDE Knowledge Search

Demo UI per il POC Scenario B — Amazon Bedrock Knowledge Bases.

## Setup locale

```bash
npm install
npm run dev
```

## Deploy su Vercel

### 1. Push su GitHub
```bash
git init
git add .
git commit -m "initial"
git remote add origin https://github.com/TUO-ORG/aede-search.git
git push -u origin main
```

### 2. Importa su Vercel
- Vai su [vercel.com](https://vercel.com) → **Add New Project**
- Seleziona il repository GitHub
- Vercel rileva automaticamente **Vite** — le impostazioni di default sono corrette:
  - **Framework**: Vite
  - **Build Command**: `vite build`
  - **Output Directory**: `dist`

### 3. Aggiungi la variabile d'ambiente
In Vercel → **Settings → Environment Variables**:
```
VITE_ANTHROPIC_API_KEY = sk-ant-...
```

> ⚠️ **Nota:** Questa demo chiama l'API Anthropic direttamente dal browser (solo per POC).
> In produzione sostituire con una Lambda/API Gateway che gestisce l'autenticazione server-side
> e punta al Knowledge Base di Bedrock via `bedrock-agent-runtime`.

## Produzione: sostituire la funzione RAG

Nel file `src/App.jsx`, la funzione `generateRAGAnswer()` (riga ~60) usa l'API Anthropic come simulazione.
In produzione, sostituirla con:

```python
# Lambda handler
import boto3
client = boto3.client('bedrock-agent-runtime', region_name='eu-west-1')

response = client.retrieve_and_generate(
    input={'text': query},
    retrieveAndGenerateConfiguration={
        'type': 'KNOWLEDGE_BASE',
        'knowledgeBaseConfiguration': {
            'knowledgeBaseId': 'KB_ID',
            'modelArn': 'arn:aws:bedrock:eu-west-1::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0'
        }
    }
)
```
