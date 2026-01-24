# Circuit Simulator - Documentation Technique

ElecFlow permet d'importer des schémas électriques au format Formelec (PDF) et de simuler le comportement logique des circuits pour vérifier l'alimentation des récepteurs.

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────┐
│  1. Import PDF (format Formelec)                        │
│     └── Extraction texte avec pdf-parse                 │
│                                                         │
│  2. Parsing des composants                              │
│     └── Repères: Q1, Q2, Q2.1...                        │
│     └── Protections: 10A, 25A/30mA                      │
│     └── Câbles: 3G1.5, 3G2.5                            │
│                                                         │
│  3. Construction du circuit                             │
│     └── Noeuds (source, intermédiaires, récepteurs)     │
│     └── Liens avec comportement NC/NO                   │
│     └── États des organes de protection                 │
│                                                         │
│  4. Simulation                                          │
│     └── Parcours BFS du graphe                          │
│     └── Vérification chemin source → récepteur → neutre │
│     └── Identification des points de coupure            │
└─────────────────────────────────────────────────────────┘
```

## Concepts Fondamentaux

### Types de noeuds

| Type | Description | Exemple |
|------|-------------|---------|
| `source` | Point d'alimentation (Phase) | Phase L1 |
| `intermediate` | Point de connexion entre composants | Sortie disjoncteur |
| `receptor` | Appareil à alimenter | Éclairage, prise |
| `neutral` | Point de retour (Neutre) | Neutre N |

### Comportement des liens

Les liens entre noeuds peuvent avoir trois comportements :

| Comportement | Code | Description | Conduction |
|--------------|------|-------------|------------|
| Toujours conducteur | `always_conducting` | Câble, fil | Toujours |
| Normalement Ouvert (NO) | `normally_open` | Interrupteur, télérupteur | Conduit quand `isActive = true` |
| Normalement Fermé (NC) | `normally_closed` | Disjoncteur, différentiel | Conduit quand `isActive = false` |

### Logique NO vs NC

```
État = false (repos)         État = true (actif)
─────────────────────        ─────────────────────
NO: OUVERT (ne conduit pas)  NO: FERMÉ (conduit)
NC: FERMÉ (conduit)          NC: OUVERT (ne conduit pas)
```

**Important:** Dans un schéma Formelec typique, tous les dispositifs de protection (disjoncteurs, différentiels) sont des contacts NC. Ils conduisent au repos et s'ouvrent (coupent le circuit) quand ils déclenchent.

## Structure des Fichiers

```
src/features/circuit-simulator/
├── types/
│   └── circuit.types.ts        # Types du domaine
├── engine/
│   └── simulator.ts            # Algorithme de simulation (BFS)
├── pdf-import/
│   ├── types.ts                # Types pour le parsing PDF
│   ├── pdf-parser.ts           # Extraction texte du PDF
│   ├── formelec-parser.ts      # Parsing format Formelec
│   └── circuit-builder.ts      # Construction du circuit
├── actions/
│   ├── circuit.action.ts       # CRUD circuits
│   ├── simulation.action.ts    # Exécution simulation
│   └── pdf-import.action.ts    # Import PDF
└── components/
    ├── circuit-list.tsx        # Liste des circuits
    ├── simulation-panel.tsx    # Interface de simulation
    ├── simulation-result.tsx   # Affichage résultats
    ├── pdf-upload.tsx          # Upload PDF
    └── pdf-preview.tsx         # Prévisualisation import
```

## Import PDF Formelec

### Format attendu

Le PDF Formelec contient des tableaux avec les colonnes :

| Repère | Désignation | Câble | Protection |
|--------|-------------|-------|------------|
| Q1 | Interrupteur Général | - | 63A |
| Q2 | Différentiel Éclairage | - | 25A / 30mA |
| Q2.1 | Éclairage Chambre 1 | 3G1.5 | 10A |
| Q2.2 | Éclairage Chambre 2 | 3G1.5 | 10A |

### Hiérarchie des composants

La hiérarchie est déduite des repères :

- `Q1` = Interrupteur général (source du tableau)
- `Q2`, `Q3`, `Q4` = Différentiels (protection 30mA)
- `Q2.1`, `Q2.2` = Disjoncteurs divisionnaires sous Q2
- `Q3.1`, `Q3.2` = Disjoncteurs divisionnaires sous Q3

### Parsing

```typescript
// Patterns de reconnaissance
const REPERE_PATTERN = /^(Q\d+(?:\.\d+)?)\b/;      // Q1, Q2.1
const PROTECTION_PATTERN = /(\d+A(?:\s*\/\s*\d+mA)?)/;  // 10A, 25A / 30mA
const CABLE_PATTERN = /(\d+G\d+(?:\.\d+)?)/;       // 3G1.5, 3G2.5

// Classification
- isDifferential: true si "mA" dans protection
- isMainBreaker: true si repère = "Q1"
- isFinalCircuit: true si câble présent
- parentRepere: déduit du repère (Q2.1 → Q2)
```

### Construction du circuit

Le `circuit-builder.ts` transforme les composants parsés en structure de circuit :

1. **Q1 (Interrupteur Général)**
   - Noeud intermédiaire
   - État NC (s'ouvre si déclenché)
   - Lien: Source → Q1

2. **Différentiels (Q2, Q3...)**
   - Noeuds intermédiaires
   - États NC
   - Liens: Q1 → Différentiel

3. **Circuits finaux (Q2.1, Q2.2...)**
   - Noeuds récepteurs
   - États NC pour les disjoncteurs
   - Liens: Différentiel parent → Récepteur → Neutre

## Algorithme de Simulation

### Principe

Pour chaque récepteur, la simulation vérifie :

1. Existe-t-il un chemin conducteur Source → Récepteur ?
2. Existe-t-il un chemin conducteur Récepteur → Neutre ?
3. Si les deux existent, le récepteur est alimenté

### Parcours BFS

```typescript
function findPath(
  graph: CircuitGraph,
  sourceId: string,
  targetId: string,
  states: Map<string, boolean>,
  excludeNodes?: Set<string>  // Important: exclure le neutre pour source→récepteur
): PathFindingResult {
  const visited = new Set<string>();
  const queue: { nodeId: string; path: PathSegment[] }[] = [];

  queue.push({ nodeId: sourceId, path: [] });
  visited.add(sourceId);

  while (queue.length > 0) {
    const current = queue.shift();
    if (current.nodeId === targetId) {
      return { found: true, path: current.path };
    }

    for (const link of graph.get(current.nodeId)) {
      if (visited.has(link.targetNodeId)) continue;
      if (excludeNodes?.has(link.targetNodeId)) continue;

      if (link.isConducting(states)) {
        visited.add(link.targetNodeId);
        queue.push({
          nodeId: link.targetNodeId,
          path: [...current.path, segment],
        });
      }
    }
  }

  return { found: false, path: [] };
}
```

### Exclusion du neutre

Le graphe est bidirectionnel pour permettre la navigation. Cependant, lors de la recherche Source → Récepteur, le neutre doit être exclu pour éviter les chemins parasites :

```
❌ Source → Q1 → Q3 → Q3.1 → Neutre → Q2.1 (incorrect)
✓ Source → Q1 → Q2 → Q2.1 (correct)
```

```typescript
const excludeNeutral = new Set([circuit.neutralNodeId]);
const toReceptor = findPath(graph, sourceId, receptorId, states, excludeNeutral);
const toNeutral = findPath(graph, receptorId, neutralNodeId, states);
```

### Identification du point de coupure

Si un chemin n'existe pas, le simulateur identifie le lien qui bloque :

```typescript
function getCutoffInfo(circuit, linkId, states): CutoffPoint {
  const link = circuit.links.find(l => l.id === linkId);

  switch (link.behavior.type) {
    case "normally_closed":
      const isActive = states.get(behavior.stateId);
      return {
        linkId,
        linkName: link.name,
        reason: isActive
          ? `${stateName} est actif (contact NC ouvert)`
          : `${stateName} n'est pas actif mais le contact ne conduit pas`
      };
    // ...
  }
}
```

## Modèle de données (Prisma)

```prisma
model Circuit {
  id             String   @id @default(nanoid(11))
  name           String
  description    String?
  organizationId String
  organization   Organization @relation(...)

  nodesJson      String   @db.Text  // JSON des noeuds
  linksJson      String   @db.Text  // JSON des liens
  statesJson     String   @db.Text  // JSON des états

  sourceNodeId   String
  neutralNodeId  String
  receptorNodeIds String  @db.Text  // JSON array

  simulations    CircuitSimulation[]
}

model CircuitSimulation {
  id          String   @id @default(nanoid(11))
  circuitId   String
  circuit     Circuit  @relation(...)
  statesJson  String   @db.Text  // États au moment de la simulation
  resultsJson String   @db.Text  // Résultats par récepteur
  createdAt   DateTime @default(now())
}
```

## Utilisation

### Import d'un schéma

```typescript
// Server action
const result = await importPdfAction({ formData });
// Retourne: { circuitId, componentsCount }
```

### Simulation

```typescript
import { simulateCircuit, buildGraph } from "@/features/circuit-simulator/engine/simulator";

// Charger le circuit depuis la DB
const circuit = await getCircuitById(circuitId);

// Simuler avec des états personnalisés
const result = simulateCircuit(circuit, {
  "state-q1": true,  // Q1 déclenché → coupe tout
});

// Résultat
result.results.forEach(r => {
  console.log(`${r.receptorName}: ${r.isPowered ? "ALIMENTÉ" : "NON ALIMENTÉ"}`);
  if (r.cutoffPoint) {
    console.log(`  Coupure: ${r.cutoffPoint.reason}`);
  }
});
```

## Évolutions futures

### Commandes (interrupteurs)

Actuellement, seuls les dispositifs de protection (NC) sont modélisés. Pour ajouter des commandes (interrupteurs, télérupteurs), il faudrait :

1. Détecter les commandes dans le PDF (si présentes)
2. Créer des liens NO entre les disjoncteurs et les récepteurs
3. Permettre la simulation de scénarios "interrupteur ON/OFF"

### Vérification de conformité NFC 15-100

Avec les données du schéma, on pourrait vérifier :

- Sections de câbles vs calibres des protections
- Respect des circuits spécialisés
- Nombre de points par circuit
- Sélectivité des protections
