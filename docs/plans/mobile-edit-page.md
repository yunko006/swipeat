# Plan: Version mobile de la page Edit

## Objectif
Créer une expérience mobile optimisée pour la page d'édition des timings, avec:
- Vidéo format Instagram (9:16) en haut
- Barre d'actions fixe (contrôles de timing)
- Étapes en swipe horizontal (une à la fois)

## Design basé sur les choix de Thomas
- **Scroll des étapes**: Swipe horizontal (une étape à la fois, style stories)
- **Contrôles de timing**: Barre d'actions fixe entre vidéo et étapes
- **Inputs de timing**: Compacts mais visibles

## Architecture

### Layout mobile (< lg)
```
┌─────────────────────────┐
│  Header (retour + save) │
├─────────────────────────┤
│                         │
│   Vidéo (9:16)          │
│   ~60vh                 │
│                         │
├─────────────────────────┤
│  Barre d'actions fixe   │
│  [▶️] 0:15 [📍Start][📍End] │
├─────────────────────────┤
│  Étape N (swipe)        │
│  [instruction + inputs] │
│  [< ●●●○○ >]            │
└─────────────────────────┘
```

## Fichiers à modifier

### 1. `src/app/recette/[id]/edit/page.tsx`
**Changements:**
- Réorganiser le layout pour mobile: vidéo en premier (order-1 sur mobile)
- Masquer les boutons header complexes sur mobile (dropdown re-analyser)
- Header simplifié sur mobile

### 2. `src/components/edit/edit-steps-timeline.tsx`
**Changements majeurs - créer une vue mobile séparée dans le même composant:**

```tsx
// Desktop: comportement actuel (liste verticale)
// Mobile: nouveau comportement (swipe horizontal)

<div className="hidden lg:block">
  {/* Vue desktop actuelle */}
</div>

<div className="lg:hidden">
  {/* Nouvelle vue mobile */}
  {/* - Barre d'actions fixe en haut */}
  {/* - Étape courante avec swipe */}
  {/* - Navigation dots/chevrons */}
</div>
```

**Vue mobile détaillée:**
- **Barre d'actions** (sticky): play/pause + timecode + boutons "Définir début/fin" compacts
- **Zone étape swipeable**: instruction + inputs timing (compacts)
- **Navigation**: dots indicateurs + chevrons gauche/droite
- **Swipe**: réutiliser la logique de `BentoLetmecook` (touch events)

### 3. `src/components/edit/edit-video-player.tsx`
**Changements mineurs:**
- Ajuster `max-h` pour mobile: plus grand (`max-h-[60vh]` sur mobile)
- Garder `max-h-[52vh]` sur desktop

## Détail des implémentations

### A. Nouvelle vue mobile dans EditStepsTimeline

```tsx
// Nouveau state nécessaire
const [dragOffset, setDragOffset] = useState(0);
const [isDragging, setIsDragging] = useState(false);
const [startX, setStartX] = useState(0);

// Touch handlers (copier pattern de BentoLetmecook)
const handleTouchStart = (e) => { ... };
const handleTouchMove = (e) => { ... };
const handleTouchEnd = () => { ... };

// Navigation
const goToNextStep = () => onSelectStep(Math.min(selectedStep + 1, steps.length - 1));
const goToPrevStep = () => onSelectStep(Math.max(selectedStep - 1, 0));
```

### B. Barre d'actions mobile
```tsx
<div className="p-3 border-b border-border flex items-center justify-between">
  {/* Play + Timecode */}
  <div className="flex items-center gap-2">
    <button onClick={onTogglePlayPause}>...</button>
    <span className="font-mono text-sm">{formatTimecode(currentTime)}</span>
  </div>

  {/* Boutons Pin compacts */}
  <div className="flex gap-2">
    <button onClick={onSetCurrentTimeAsStart} className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded">
      <Pin className="w-3 h-3" /> Début
    </button>
    <button onClick={onSetCurrentTimeAsEnd} className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded">
      <Pin className="w-3 h-3" /> Fin
    </button>
  </div>
</div>
```

### C. Zone étape swipeable
```tsx
<div
  className="p-4 touch-pan-x"
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
>
  {/* Badge étape + couleur */}
  <div className="flex items-center gap-2 mb-2">
    <div className={`w-6 h-6 rounded-full ${color.bg} ...`}>{selectedStep}</div>
    <span className="text-xs text-muted-foreground">
      Étape {selectedStep + 1}/{steps.length}
    </span>
  </div>

  {/* Instruction */}
  <p className="text-sm mb-3">{currentStepData.instruction}</p>

  {/* Inputs timing compacts */}
  <div className="flex items-center gap-2">
    <input type="number" value={start} ... className="w-12 text-xs" />
    <span>-</span>
    <input type="number" value={end} ... className="w-12 text-xs" />
    <span className="text-xs text-muted-foreground">sec</span>
  </div>
</div>
```

### D. Navigation (dots + chevrons)
```tsx
<div className="flex items-center justify-between p-3 border-t border-border">
  <button onClick={goToPrevStep} disabled={selectedStep === 0}>
    <ChevronLeft />
  </button>

  {/* Dots */}
  <div className="flex gap-1">
    {steps.map((_, i) => (
      <div
        key={i}
        className={`w-2 h-2 rounded-full ${i === selectedStep ? 'bg-foreground' : 'bg-foreground/30'}`}
        onClick={() => onSelectStep(i)}
      />
    ))}
  </div>

  <button onClick={goToNextStep} disabled={selectedStep === steps.length - 1}>
    <ChevronRight />
  </button>
</div>
```

## Ordre d'implémentation

1. **EditVideoPlayer** - ajuster max-h responsive (changement simple)
2. **EditStepsTimeline** - ajouter vue mobile complète
3. **Page edit** - réorganiser layout + simplifier header mobile

## Vérification

- [ ] Sur mobile (< 1024px): vidéo en haut, contrôles fixes, swipe entre étapes
- [ ] Sur desktop (≥ 1024px): comportement actuel inchangé
- [ ] Les inputs de timing fonctionnent sur mobile
- [ ] Les boutons "Définir début/fin" fonctionnent
- [ ] Le swipe change l'étape ET seek la vidéo au bon timing
- [ ] Save fonctionne avec les modifications faites sur mobile
