// frontend/src/components/MuscleMap.jsx
import React, { useState } from 'react';
import { Target, Layers, Play, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

/**
 * MUSCLE_REGIONS defines the anatomical mapping to exercise categories,
 * associated exercises, and factual anatomical descriptions.
 */
export const MUSCLE_REGIONS = {
  chest: {
    id: 'chest',
    name: 'Chest',
    category: 'Chest',
    view: 'front',
    hasAiTracking: true,
    exercises: [
      'barbell_bench_press',
      'incline_dumbbell_press',
      'cable_fly_pec_deck',
      'pushups',
      'dumbbell_fly',
      'dumbbell_bench_press'
    ],
    description: 'Pectoralis major and minor. Primary muscle group engaged during pressing and horizontal adduction movements.'
  },
  shoulders: {
    id: 'shoulders',
    name: 'Shoulders',
    category: 'Shoulders',
    view: 'both',
    hasAiTracking: true,
    exercises: [
      'overhead_press',
      'lateral_raise',
      'front_raise',
      'upright_row',
      'face_pull'
    ],
    description: 'Anterior, lateral, and posterior deltoids. Primary muscle group for vertical pressing and lateral arm elevation.'
  },
  biceps: {
    id: 'biceps',
    name: 'Biceps',
    category: 'Arms_Forearms',
    view: 'front',
    hasAiTracking: true,
    exercises: ['bicep_curl'],
    description: 'Biceps brachii. Primary flexor of the elbow joint during curling movements.'
  },
  triceps: {
    id: 'triceps',
    name: 'Triceps',
    category: 'Arms_Forearms',
    view: 'back',
    hasAiTracking: true,
    exercises: ['tricep_pushdown', 'overhead_tricep_extension', 'dips'],
    description: 'Triceps brachii (lateral, long, medial heads). Primary extensor of the elbow joint during extension movements.'
  },
  forearms: {
    id: 'forearms',
    name: 'Forearms',
    category: 'Arms_Forearms',
    view: 'both',
    hasAiTracking: true,
    exercises: ['wrist_curl'],
    description: 'Brachioradialis and wrist flexors/extensors. Responsible for wrist joint flexion and grip stability.'
  },
  core: {
    id: 'core',
    name: 'Core / Abs',
    category: 'Core',
    view: 'front',
    hasAiTracking: true,
    exercises: ['crunches', 'leg_raises', 'russian_twist'],
    description: 'Rectus abdominis and internal/external obliques. Key muscles for trunk flexion and spinal stabilization.'
  },
  quads: {
    id: 'quads',
    name: 'Quadriceps',
    category: 'Legs',
    view: 'front',
    hasAiTracking: true,
    exercises: ['squat', 'leg_press', 'leg_extension'],
    description: 'Rectus femoris and vastus group. Primary knee extensors engaged in squats, presses, and lower-body compound movements.'
  },
  traps: {
    id: 'traps',
    name: 'Upper Back / Traps',
    category: 'Arms_Forearms',
    view: 'back',
    hasAiTracking: true,
    exercises: ['shrugs'],
    description: 'Trapezius muscle complex. Responsible for scapular elevation and neck-shoulder girdle stabilization.'
  },
  lats: {
    id: 'lats',
    name: 'Lats (Upper Back)',
    category: 'Back',
    view: 'back',
    hasAiTracking: true,
    exercises: [
      'barbell_row',
      'seated_cable_row',
      'pullup_chinup',
      'lat_pulldown',
      'straight_arm_pulldown'
    ],
    description: 'Latissimus dorsi and rhomboids. Primary muscle group engaged during rowing and vertical pulling movements.'
  },
  lower_back: {
    id: 'lower_back',
    name: 'Lower Back',
    category: 'Back',
    view: 'back',
    hasAiTracking: true,
    exercises: ['deadlift'],
    description: 'Erector spinae. Key stabilizer for posterior pelvic tilt, hip hinging, and spinal neutral alignment.'
  },
  glutes: {
    id: 'glutes',
    name: 'Glutes',
    category: 'Legs',
    view: 'back',
    hasAiTracking: true,
    exercises: ['hip_thrust'],
    description: 'Gluteus maximus and medius. Prime movers for hip extension and pelvic stabilization.'
  },
  hamstrings: {
    id: 'hamstrings',
    name: 'Hamstrings',
    category: 'Legs',
    view: 'back',
    hasAiTracking: true,
    exercises: ['romanian_deadlift', 'leg_curl'],
    description: 'Biceps femoris, semitendinosus, and semimembranosus. Prime movers for knee flexion and hip extension hinging.'
  },
  calves: {
    id: 'calves',
    name: 'Calves',
    category: 'Legs',
    view: 'both',
    hasAiTracking: true,
    exercises: ['calf_raise'],
    description: 'Gastrocnemius and soleus. Primary muscles for ankle plantarflexion and lower-leg stability.'
  }
};

export default function MuscleMap({
  selectedMuscle,
  onSelectMuscle,
  exercisesData,
  onSelectExercise
}) {
  const [mobileView, setMobileView] = useState('front'); // 'front' | 'back'
  const [hoveredMuscle, setHoveredMuscle] = useState(null);

  const activeMuscleConfig = selectedMuscle ? MUSCLE_REGIONS[selectedMuscle] : null;

  // Helper styling for SVG muscle regions - Pre-theme Dark Athletic Styling
  const getMuscleClasses = (muscleId) => {
    const isSelected = selectedMuscle === muscleId;
    const isHovered = hoveredMuscle === muscleId;

    if (isSelected) {
      return {
        fill: '#B7F52A',
        stroke: '#B7F52A',
        filter: 'drop-shadow(0 0 8px rgba(183,245,42,0.5))',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      };
    }
    if (isHovered) {
      return {
        fill: '#1D2023',
        stroke: '#B7F52A',
        strokeWidth: 1.3,
        cursor: 'pointer',
        transition: 'all 0.15s ease'
      };
    }
    return {
      fill: '#17191C',
      stroke: '#292D31',
      strokeWidth: 1,
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    };
  };

  const handleMuscleClick = (muscleId) => {
    if (selectedMuscle === muscleId) {
      onSelectMuscle(null); // toggle off if tapped again
    } else {
      onSelectMuscle(muscleId);
    }
  };

  const formatExerciseName = (name) => {
    return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Resolve protocols for selected muscle directly from active exercisesData
  const getProtocolsForSelected = () => {
    if (!activeMuscleConfig || !exercisesData) return [];
    const category = activeMuscleConfig.category;
    const categoryDict = exercisesData[category] || {};

    return activeMuscleConfig.exercises
      .filter((exKey) => categoryDict[exKey])
      .map((exKey) => ({
        key: exKey,
        name: formatExerciseName(exKey),
        data: categoryDict[exKey],
        category
      }));
  };

  const matchingProtocols = getProtocolsForSelected();

  /* ==========================================================================
     FRONT BODY SVG - ATHLETIC ANATOMY (TIGHT VIEWBOX 16 12 168 424)
     Scales up body ~25% filling vertical container gracefully
     ========================================================================== */
  const renderFrontSvg = () => (
    <svg
      viewBox="16 12 168 424"
      className="w-full h-auto max-h-[540px] md:max-h-[580px] select-none mx-auto drop-shadow-[0_10px_25px_rgba(0,0,0,0.65)]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="frontGlowRefined" cx="50%" cy="38%" r="52%">
          <stop offset="0%" stopColor="#B7F52A" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#050505" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Subtle back ambient illumination */}
      <circle cx="100" cy="210" r="140" fill="url(#frontGlowRefined)" />

      {/* BASE BODY FOUNDATION (Grounding athletic silhouette) */}
      <g
        fill="#101114"
        stroke="#21232b"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Head & Neck */}
        <path d="M100 16 C90 16 88 28 88 38 C88 48 93 54 100 54 C107 54 112 48 112 38 C112 28 110 16 100 16 Z" />
        <path d="M93 52 C91 58 87 64 82 68 L118 68 C113 64 109 58 107 52 Z" />

        {/* Torso/Chest base */}
        <path d="M60 82 C55 105 52 135 63 175 C68 195 72 216 75 225 L125 225 C128 216 132 195 137 175 C148 135 145 105 140 82 Z" />

        {/* Pelvic base */}
        <path d="M75 225 C74 238 72 250 78 258 C85 264 94 266 100 266 C106 266 115 264 122 258 C128 250 126 238 125 225 Z" />

        {/* Arms Base Silhouettes */}
        <path d="M64 74 C52 78 44 92 41 114 C38 132 40 156 36 175 C32 195 26 222 22 245 C20 255 24 262 30 258 C36 250 42 226 44 200 C47 175 49 148 53 125 Z" />
        <path d="M136 74 C148 78 156 92 159 114 C162 132 160 156 164 175 C168 195 174 222 178 245 C180 255 176 262 170 258 C164 250 158 226 156 200 C153 175 151 148 147 125 Z" />

        {/* Legs Base Silhouettes */}
        <path d="M78 258 C72 278 68 310 70 335 C71 350 70 375 67 405 C65 422 66 432 78 432 C84 432 87 420 88 395 C90 365 91 338 94 315 C97 290 98 270 100 266 Z" />
        <path d="M122 258 C128 278 132 310 130 335 C129 350 130 375 133 405 C135 422 134 432 122 432 C116 432 113 420 112 395 C110 365 109 338 106 315 C103 290 102 270 100 266 Z" />

        {/* Subtle knee joint hints */}
        <path d="M69 338 C75 342 85 342 90 338" fill="none" stroke="#252832" strokeWidth="1" />
        <path d="M131 338 C125 342 115 342 110 338" fill="none" stroke="#252832" strokeWidth="1" />
      </g>

      {/* INTERACTIVE ANATOMICAL MUSCLES - FRONT */}
      <g strokeLinecap="round" strokeLinejoin="round">

        {/* 1. SHOULDERS (DELTOIDS - REFINED NATURAL WRAPPING CAP) */}
        <g
          style={getMuscleClasses('shoulders')}
          onClick={() => handleMuscleClick('shoulders')}
          onMouseEnter={() => setHoveredMuscle('shoulders')}
          onMouseLeave={() => setHoveredMuscle(null)}
        >
          {/* Left Deltoid: Smoothly hugs acromion and upper humerus */}
          <path d="M78 67 C68 69 53 77 48 93 C44 107 47 119 55 127 C61 121 64 106 68 94 C71 84 75 74 78 67 Z" />
          {/* Right Deltoid */}
          <path d="M122 67 C132 69 147 77 152 93 C156 107 153 119 145 127 C139 121 136 106 132 94 C129 84 125 74 122 67 Z" />
        </g>

        {/* 2. CHEST (PECTORALS - REFINED NATURAL ANATOMICAL FAN) */}
        <g
          style={getMuscleClasses('chest')}
          onClick={() => handleMuscleClick('chest')}
          onMouseEnter={() => setHoveredMuscle('chest')}
          onMouseLeave={() => setHoveredMuscle(null)}
        >
          {/* Left Pectoral: Smooth sweeping curve from clavicle to sternum and axilla */}
          <path d="M79 71 C86 72 95 73 98 76 L98 122 C91 127 79 128 68 121 C62 117 59 108 62 96 C65 82 71 74 79 71 Z" />
          {/* Right Pectoral */}
          <path d="M121 71 C114 72 105 73 102 76 L102 122 C109 127 121 128 132 121 C138 117 141 108 138 96 C135 82 129 74 121 71 Z" />
        </g>

        {/* 3. BICEPS (BICEPS BRACHII) */}
        <g
          style={getMuscleClasses('biceps')}
          onClick={() => handleMuscleClick('biceps')}
          onMouseEnter={() => setHoveredMuscle('biceps')}
          onMouseLeave={() => setHoveredMuscle(null)}
        >
          {/* Left Bicep */}
          <path d="M54 125 C47 130 42 142 41 155 C41 166 46 172 52 170 C57 165 59 152 59 138 C59 130 56 126 54 125 Z" />
          {/* Right Bicep */}
          <path d="M146 125 C153 130 158 142 159 155 C159 166 154 172 148 170 C143 165 141 152 141 138 C141 130 144 126 146 125 Z" />
        </g>

        {/* 4. FOREARMS (BRACHIORADIALIS / FLEXORS) */}
        <g
          style={getMuscleClasses('forearms')}
          onClick={() => handleMuscleClick('forearms')}
          onMouseEnter={() => setHoveredMuscle('forearms')}
          onMouseLeave={() => setHoveredMuscle(null)}
        >
          {/* Left Forearm */}
          <path d="M43 178 C35 186 30 206 28 226 C26 238 29 246 33 244 C38 238 42 220 44 204 C46 192 46 182 43 178 Z" />
          {/* Right Forearm */}
          <path d="M157 178 C165 186 170 206 172 226 C174 238 171 246 167 244 C162 238 158 220 156 204 C154 192 154 182 157 178 Z" />
        </g>

        {/* 5. CORE / ABS (REFINED ABDOMINAL WALL WITH ORGANIC CONTOURS) */}
        <g
          style={getMuscleClasses('core')}
          onClick={() => handleMuscleClick('core')}
          onMouseEnter={() => setHoveredMuscle('core')}
          onMouseLeave={() => setHoveredMuscle(null)}
        >
          {/* Upper Pack: Curved organic contours */}
          <path d="M84 128 C87 126 95 126 98 127 L98 142 C94 144 86 143 84 141 Z" />
          <path d="M116 128 C113 126 105 126 102 127 L102 142 C106 144 114 143 116 141 Z" />

          {/* Middle Pack */}
          <path d="M84 145 C87 143 95 143 98 144 L98 162 C94 164 86 163 84 161 Z" />
          <path d="M116 145 C113 143 105 143 102 144 L102 162 C106 164 114 163 116 161 Z" />

          {/* Lower Pack */}
          <path d="M85 165 C88 164 95 164 98 165 L98 188 C93 186 87 180 85 174 Z" />
          <path d="M115 165 C112 164 105 164 102 165 L102 188 C107 186 113 180 115 174 Z" />

          {/* Obliques Left */}
          <path d="M71 138 C67 154 69 178 74 198 C78 196 82 182 82 158 C82 146 76 139 71 138 Z" />
          {/* Obliques Right */}
          <path d="M129 138 C133 154 131 178 126 198 C122 196 118 182 118 158 C118 146 124 139 129 138 Z" />
        </g>

        {/* 6. QUADRICEPS (RECTUS FEMORIS & VASTUS GROUP) */}
        <g
          style={getMuscleClasses('quads')}
          onClick={() => handleMuscleClick('quads')}
          onMouseEnter={() => setHoveredMuscle('quads')}
          onMouseLeave={() => setHoveredMuscle(null)}
        >
          {/* Left Quad */}
          <path d="M77 228 C69 245 66 280 69 315 C72 328 80 330 84 322 C89 302 93 270 96 242 C89 236 82 230 77 228 Z" />
          {/* Right Quad */}
          <path d="M123 228 C131 245 134 280 131 315 C128 328 120 330 116 322 C111 302 107 270 104 242 C111 236 118 230 123 228 Z" />
        </g>

        {/* 7. CALVES (ANTERIOR TIBIALIS) */}
        <g
          style={getMuscleClasses('calves')}
          onClick={() => handleMuscleClick('calves')}
          onMouseEnter={() => setHoveredMuscle('calves')}
          onMouseLeave={() => setHoveredMuscle(null)}
        >
          {/* Left Shin & Anterior Compartment */}
          <path d="M69 344 C65 362 65 385 68 408 C74 410 80 402 83 385 C85 366 82 352 75 344 Z" />
          {/* Right Shin & Anterior Compartment */}
          <path d="M131 344 C135 362 135 385 132 408 C126 410 120 402 117 385 C115 366 118 352 125 344 Z" />
        </g>

      </g>
    </svg>
  );

  /* ==========================================================================
     BACK BODY SVG - ATHLETIC POSTERIOR ANATOMY (TIGHT VIEWBOX 16 12 168 424)
     ========================================================================== */
  const renderBackSvg = () => (
    <svg
      viewBox="16 12 168 424"
      className="w-full h-auto max-h-[540px] md:max-h-[580px] select-none mx-auto drop-shadow-[0_10px_25px_rgba(0,0,0,0.65)]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="backGlowRefined" cx="50%" cy="38%" r="52%">
          <stop offset="0%" stopColor="#B7F52A" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#050505" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Subtle back ambient illumination */}
      <circle cx="100" cy="210" r="140" fill="url(#backGlowRefined)" />

      {/* BASE BODY FOUNDATION (Posterior silhouette) */}
      <g
        fill="#101114"
        stroke="#21232b"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Head & Neck Posterior */}
        <path d="M100 16 C90 16 88 28 88 38 C88 48 93 54 100 54 C107 54 112 48 112 38 C112 28 110 16 100 16 Z" />
        <path d="M93 52 C91 58 87 64 82 68 L118 68 C113 64 109 58 107 52 Z" />

        {/* Torso Posterior Base Frame */}
        <path d="M60 82 C55 105 52 135 63 175 C68 195 72 216 75 220 L125 220 C128 216 132 195 137 175 C148 135 145 105 140 82 Z" />

        {/* Pelvic/Gluteal Frame */}
        <path d="M75 220 C71 236 70 258 76 268 C84 274 94 276 100 276 C106 276 116 274 124 268 C130 258 129 236 125 220 Z" />

        {/* Arms Base Silhouettes */}
        <path d="M64 74 C52 78 44 92 41 114 C38 132 40 156 36 175 C32 195 26 222 22 245 C20 255 24 262 30 258 C36 250 42 226 44 200 C47 175 49 148 53 125 Z" />
        <path d="M136 74 C148 78 156 92 159 114 C162 132 160 156 164 175 C168 195 174 222 178 245 C180 255 176 262 170 258 C164 250 158 226 156 200 C153 175 151 148 147 125 Z" />

        {/* Legs Base Silhouettes */}
        <path d="M76 268 C70 290 68 320 70 342 C71 355 70 375 67 405 C65 422 66 432 78 432 C84 432 87 420 88 395 C90 365 91 338 94 315 C97 290 98 275 100 276 Z" />
        <path d="M124 268 C130 290 132 320 130 342 C129 355 130 375 133 405 C135 422 134 432 122 432 C116 432 113 420 112 395 C110 365 109 338 106 315 C103 290 102 275 100 276 Z" />

        {/* Popliteal fossa (Back of knees) crease */}
        <path d="M72 342 C78 346 86 346 90 342" fill="none" stroke="#252832" strokeWidth="1" />
        <path d="M128 342 C122 346 114 346 110 342" fill="none" stroke="#252832" strokeWidth="1" />
      </g>

      {/* INTERACTIVE ANATOMICAL MUSCLES - BACK */}
      <g strokeLinecap="round" strokeLinejoin="round">

        {/* 1. UPPER BACK / TRAPEZIUS (REFINED ANATOMICAL TRANSITION FROM CERVICAL SPINE) */}
        <g
          style={getMuscleClasses('traps')}
          onClick={() => handleMuscleClick('traps')}
          onMouseEnter={() => setHoveredMuscle('traps')}
          onMouseLeave={() => setHoveredMuscle(null)}
        >
          {/* Smooth anatomical trapezius flowing naturally over nape, acromion, and mid-scapular spine */}
          <path d="M100 53 C93 54 86 62 83 68 C79 72 73 76 84 94 L100 126 L116 94 C127 76 121 72 117 68 C114 62 107 54 100 53 Z" />
        </g>

        {/* 2. REAR DELTS / SHOULDERS */}
        <g
          style={getMuscleClasses('shoulders')}
          onClick={() => handleMuscleClick('shoulders')}
          onMouseEnter={() => setHoveredMuscle('shoulders')}
          onMouseLeave={() => setHoveredMuscle(null)}
        >
          {/* Left Posterior Deltoid */}
          <path d="M76 72 C66 74 54 82 50 96 C47 108 50 118 58 124 C62 116 66 102 70 90 C73 82 75 75 76 72 Z" />
          {/* Right Posterior Deltoid */}
          <path d="M124 72 C134 74 146 82 150 96 C153 108 150 118 142 124 C138 116 134 102 130 90 C127 82 125 75 124 72 Z" />
        </g>

        {/* 3. TRICEPS (LATERAL & LONG HEADS) */}
        <g
          style={getMuscleClasses('triceps')}
          onClick={() => handleMuscleClick('triceps')}
          onMouseEnter={() => setHoveredMuscle('triceps')}
          onMouseLeave={() => setHoveredMuscle(null)}
        >
          {/* Left Triceps Horseshoe */}
          <path d="M52 120 C46 126 42 138 41 154 C43 162 48 166 54 162 C57 154 57 140 56 126 Z" />
          {/* Right Triceps Horseshoe */}
          <path d="M148 120 C154 126 158 138 159 154 C157 162 152 166 146 162 C143 154 143 140 144 126 Z" />
        </g>

        {/* 4. FOREARMS (POSTERIOR EXTENSORS) */}
        <g
          style={getMuscleClasses('forearms')}
          onClick={() => handleMuscleClick('forearms')}
          onMouseEnter={() => setHoveredMuscle('forearms')}
          onMouseLeave={() => setHoveredMuscle(null)}
        >
          {/* Left Forearm Extensors */}
          <path d="M43 176 C35 184 30 204 28 224 C26 236 29 244 33 242 C38 236 42 218 44 202 C46 190 46 180 43 176 Z" />
          {/* Right Forearm Extensors */}
          <path d="M157 176 C165 184 170 204 172 224 C174 236 171 244 167 242 C162 236 158 218 156 202 C154 190 154 180 157 176 Z" />
        </g>

        {/* 5. LATS (LATISSIMUS DORSI V-TAPER) */}
        <g
          style={getMuscleClasses('lats')}
          onClick={() => handleMuscleClick('lats')}
          onMouseEnter={() => setHoveredMuscle('lats')}
          onMouseLeave={() => setHoveredMuscle(null)}
        >
          {/* Left Lat: Sweeping wing */}
          <path d="M85 98 C72 108 61 126 59 148 C57 164 63 178 72 188 C76 186 82 178 86 160 C90 142 93 124 96 112 Z" />
          {/* Right Lat */}
          <path d="M115 98 C128 108 139 126 141 148 C143 164 137 178 128 188 C124 186 118 178 114 160 C110 142 107 124 104 112 Z" />
        </g>

        {/* 6. LOWER BACK (ERECTOR SPINAE / LUMBAR COLUMNS) */}
        <g
          style={getMuscleClasses('lower_back')}
          onClick={() => handleMuscleClick('lower_back')}
          onMouseEnter={() => setHoveredMuscle('lower_back')}
          onMouseLeave={() => setHoveredMuscle(null)}
        >
          {/* Left & Right Lumbar Pillars */}
          <path d="M88 182 C82 195 80 208 81 220 L98 220 L98 178 C94 178 91 180 88 182 Z" />
          <path d="M112 182 C118 195 120 208 119 220 L102 220 L102 178 C106 178 109 180 112 182 Z" />
        </g>

        {/* 7. GLUTES (GLUTEUS MAXIMUS & MEDIUS) */}
        <g
          style={getMuscleClasses('glutes')}
          onClick={() => handleMuscleClick('glutes')}
          onMouseEnter={() => setHoveredMuscle('glutes')}
          onMouseLeave={() => setHoveredMuscle(null)}
        >
          {/* Left Glute */}
          <path d="M75 222 C68 236 68 255 74 270 C84 276 96 270 98 252 L98 222 Z" />
          {/* Right Glute */}
          <path d="M125 222 C132 236 132 255 126 270 C116 276 104 270 102 252 L102 222 Z" />
        </g>

        {/* 8. HAMSTRINGS (BICEPS FEMORIS & SEMITENDINOSUS) */}
        <g
          style={getMuscleClasses('hamstrings')}
          onClick={() => handleMuscleClick('hamstrings')}
          onMouseEnter={() => setHoveredMuscle('hamstrings')}
          onMouseLeave={() => setHoveredMuscle(null)}
        >
          {/* Left Hamstring */}
          <path d="M74 272 C68 290 68 318 70 338 C76 344 84 342 88 332 C93 312 95 288 97 274 Z" />
          {/* Right Hamstring */}
          <path d="M126 272 C132 290 132 318 130 338 C124 344 116 342 112 332 C107 312 105 288 103 274 Z" />
        </g>

        {/* 9. CALVES (GASTROCNEMIUS & SOLEUS POSTERIOR) */}
        <g
          style={getMuscleClasses('calves')}
          onClick={() => handleMuscleClick('calves')}
          onMouseEnter={() => setHoveredMuscle('calves')}
          onMouseLeave={() => setHoveredMuscle(null)}
        >
          {/* Left Calf */}
          <path d="M68 346 C60 362 61 386 68 410 C75 412 82 402 85 382 C87 362 83 348 74 346 Z" />
          {/* Right Calf */}
          <path d="M132 346 C140 362 139 386 132 410 C125 412 118 402 115 382 C113 362 117 348 126 346 Z" />
        </g>

      </g>
    </svg>
  );

  return (
    <div className="p-5 md:p-8 bg-[#101012] border border-white/10 rounded-[12px] relative overflow-hidden">

      {/* Subtle background ambient lighting */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#B7F52A]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#B7F52A]/5 blur-[120px] pointer-events-none" />

      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#B7F52A] shadow-[0_0_8px_rgba(183,245,42,0.8)]" />
            <span className="text-[10px] font-display font-black text-[#6F7075] tracking-widest uppercase">
              TARGET MUSCLE
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-display font-black tracking-tight text-white uppercase flex items-center gap-2.5">
            <Target className="w-5 h-5 text-[#B7F52A]" />
            Select Your Training Focus
          </h2>
          <p className="text-xs text-[#6F7075] mt-1 max-w-xl font-sans leading-relaxed">
            Select an anatomical muscle group directly on the body map to isolate posture angles and AI camera tracking protocols.
          </p>
        </div>

        {/* Selected target quick tag & clear button */}
        <div className="flex items-center gap-3">
          {selectedMuscle && (
            <button
              onClick={() => onSelectMuscle(null)}
              className="px-3 py-1.5 rounded-[4px] bg-[#0A0A0A] border border-white/15 text-[11px] font-display font-bold text-[#6F7075] hover:text-white hover:border-white/30 transition-all uppercase tracking-wider"
            >
              Reset Target
            </button>
          )}

          {/* Mobile Front/Back Toggle Switch */}
          <div className="flex md:hidden items-center bg-[#050505] p-1 rounded-[6px] border border-white/10">
            <button
              onClick={() => setMobileView('front')}
              className={`px-3 py-1 text-xs font-display font-black rounded-[4px] uppercase tracking-wider transition-all ${
                mobileView === 'front'
                  ? 'bg-[#B7F52A] text-[#050505] shadow-sm'
                  : 'text-[#6F7075] hover:text-white'
              }`}
            >
              Front
            </button>
            <button
              onClick={() => setMobileView('back')}
              className={`px-3 py-1 text-xs font-display font-black rounded-[4px] uppercase tracking-wider transition-all ${
                mobileView === 'back'
                  ? 'bg-[#B7F52A] text-[#050505] shadow-sm'
                  : 'text-[#6F7075] hover:text-white'
              }`}
            >
              Back
            </button>
          </div>
        </div>
      </div>

      {/* ANATOMICAL BODY MAP PRESENTATION */}
      <div className="pt-6 relative z-10">

        {/* DESKTOP SIDE-BY-SIDE VIEW (Hidden on Mobile) */}
        <div className="hidden md:grid md:grid-cols-2 gap-6 items-center max-w-4xl mx-auto py-2">

          {/* FRONT BODY COLUMN */}
          <div className="flex flex-col items-center bg-[#0A0A0A]/60 border border-white/10 rounded-[10px] p-4 relative hover:border-white/20 transition-all">
            <div className="flex items-center justify-between w-full mb-2 px-3">
              <span className="text-[11px] font-display font-black text-[#6F7075] tracking-widest uppercase">
                ANTERIOR (FRONT)
              </span>
              {hoveredMuscle && MUSCLE_REGIONS[hoveredMuscle]?.view !== 'back' && (
                <span className="text-[10px] font-display font-black text-[#B7F52A] uppercase tracking-wider animate-fade-in">
                  {MUSCLE_REGIONS[hoveredMuscle]?.name}
                </span>
              )}
            </div>
            <div className="w-full flex justify-center py-1">
              {renderFrontSvg()}
            </div>
          </div>

          {/* BACK BODY COLUMN */}
          <div className="flex flex-col items-center bg-[#0A0A0A]/60 border border-white/10 rounded-[10px] p-4 relative hover:border-white/20 transition-all">
            <div className="flex items-center justify-between w-full mb-2 px-3">
              <span className="text-[11px] font-display font-black text-[#6F7075] tracking-widest uppercase">
                POSTERIOR (BACK)
              </span>
              {hoveredMuscle && MUSCLE_REGIONS[hoveredMuscle]?.view !== 'front' && (
                <span className="text-[10px] font-display font-black text-[#B7F52A] uppercase tracking-wider animate-fade-in">
                  {MUSCLE_REGIONS[hoveredMuscle]?.name}
                </span>
              )}
            </div>
            <div className="w-full flex justify-center py-1">
              {renderBackSvg()}
            </div>
          </div>
        </div>

        {/* MOBILE SINGLE VIEW (With Front / Back Switch) */}
        <div className="block md:hidden max-w-sm mx-auto py-2">
          <div className="flex flex-col items-center bg-[#0A0A0A] border border-white/10 rounded-[10px] p-3">
            <div className="flex items-center justify-between w-full mb-2 px-2">
              <span className="text-[11px] font-display font-black text-white uppercase tracking-widest">
                {mobileView === 'front' ? 'ANTERIOR (FRONT)' : 'POSTERIOR (BACK)'}
              </span>
              <span className="text-[10px] font-mono text-[#6F7075]">Tap muscle to select</span>
            </div>
            <div className="w-full flex justify-center py-1">
              {mobileView === 'front' ? renderFrontSvg() : renderBackSvg()}
            </div>
          </div>
        </div>

        {/* SELECTION GUIDANCE STATUS BAR */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-3 py-2 bg-[#0A0A0A] border border-white/10 rounded-[6px] text-xs">
          <div className="flex items-center gap-2 text-[#F7F7F5]">
            {hoveredMuscle ? (
              <span className="text-white font-display font-bold">
                Focus Preview: <span className="text-[#B7F52A] uppercase underline">{MUSCLE_REGIONS[hoveredMuscle]?.name}</span>
              </span>
            ) : selectedMuscle ? (
              <span className="text-white font-display font-bold">
                Target Selected: <span className="text-[#B7F52A] uppercase">{activeMuscleConfig?.name}</span>
              </span>
            ) : (
              <span className="text-[#6F7075]">Click or tap any anatomical muscle region above to isolate AI protocols.</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-[#6F7075]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#17191C] border border-[#292D31] inline-block" /> Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#B7F52A] inline-block shadow-[0_0_5px_rgba(183,245,42,0.5)]" /> Selected
            </span>
          </div>
        </div>

      </div>

      {/* SELECTED TARGET PROTOCOLS REVEAL SECTION */}
      {selectedMuscle && activeMuscleConfig && (
        <div className="mt-8 pt-8 border-t border-white/10 animate-fade-in-up">

          {/* Target Metadata Banner */}
          <div className="bg-[#0A0A0A] border border-white/10 p-5 rounded-[10px] mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-[3px] bg-[#B7F52A] text-[#050505] font-display font-black text-[9px] uppercase tracking-wider">
                  SELECTED TARGET
                </span>
                <span className="text-[10px] font-mono text-[#6F7075] uppercase tracking-widest">
                  {activeMuscleConfig.category.replace(/_/g, ' ')} GROUP
                </span>
              </div>
              <h3 className="text-2xl font-display font-black text-white tracking-tight uppercase">
                {activeMuscleConfig.name}
              </h3>
              <p className="text-xs text-[#6F7075] font-sans mt-1 max-w-2xl leading-relaxed">
                {activeMuscleConfig.description}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-[#101012] px-4 py-3 rounded-[8px] border border-white/10 self-start md:self-auto flex-shrink-0">
              <div className="text-right">
                <span className="text-[10px] font-mono text-[#6F7075] uppercase block">AI PROTOCOLS</span>
                <span className="text-xl font-mono font-black text-white leading-tight">
                  {matchingProtocols.length}
                </span>
              </div>
              <div className="w-8 h-8 rounded-[6px] bg-[#B7F52A]/10 border border-[#B7F52A]/30 flex items-center justify-center text-[#B7F52A]">
                <Sparkles className="w-4 h-4 text-[#B7F52A]" />
              </div>
            </div>
          </div>

          {/* PROTOCOLS CARDS FOR SELECTED TARGET MUSCLE */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-display font-black text-white tracking-widest uppercase flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-[#B7F52A]" />
                SELECTED TARGET PROTOCOLS ({matchingProtocols.length})
              </h4>
            </div>

            {matchingProtocols.length === 0 ? (
              <div className="bg-[#0A0A0A] border border-white/10 p-8 rounded-[8px] text-center">
                <AlertCircle className="w-6 h-6 text-[#6F7075] mx-auto mb-2" />
                <p className="text-xs font-display font-bold text-white uppercase">AI TRACKING COMING SOON</p>
                <p className="text-[11px] text-[#6F7075] mt-1">
                  Kinematic rules for {activeMuscleConfig.name} are currently in calibration.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matchingProtocols.map((protocol) => (
                  <div
                    key={protocol.key}
                    className="bg-[#101012] border border-white/10 hover:border-[#B7F52A]/40 p-5 rounded-[8px] flex flex-col justify-between transition-all group hover:bg-[#151517] relative shadow-sm"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <span className="px-2 py-0.5 bg-[#B7F52A]/10 border border-[#B7F52A]/30 text-[9px] font-display font-black text-[#B7F52A] uppercase tracking-wider rounded-[3px]">
                          Target Joint: {protocol.data.joint}
                        </span>
                        <span className="text-[9px] font-mono text-[#6F7075] uppercase flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5 text-[#B7F52A]" /> AI VERIFIED
                        </span>
                      </div>

                      <h5 className="text-base font-display font-bold text-white group-hover:text-[#B7F52A] transition-colors leading-snug">
                        {protocol.name}
                      </h5>

                      {/* Angular telemetry specs sourced directly from backend exercise dictionary */}
                      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10">
                        <div className="bg-[#0A0A0A] p-2 rounded-[4px] border border-white/5">
                          <span className="text-[9px] font-display font-bold text-[#6F7075] uppercase block">Posture</span>
                          <span className="text-[11px] font-display font-bold text-white capitalize truncate block mt-0.5">
                            {protocol.data.posture.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="bg-[#0A0A0A] p-2 rounded-[4px] border border-white/5">
                          <span className="text-[9px] font-display font-bold text-[#6F7075] uppercase block">Flexion</span>
                          <span className="text-[11px] font-mono font-bold text-white block mt-0.5">
                            {protocol.data.down}°
                          </span>
                        </div>
                        <div className="bg-[#0A0A0A] p-2 rounded-[4px] border border-white/5">
                          <span className="text-[9px] font-display font-bold text-[#6F7075] uppercase block">Extension</span>
                          <span className="text-[11px] font-mono font-bold text-white block mt-0.5">
                            {protocol.data.up}°
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectExercise(protocol.key, protocol.name)}
                      className="w-full mt-4 py-2.5 bg-[#B7F52A] hover:bg-[#c7ff47] text-[#050505] font-display font-black text-xs uppercase tracking-wider rounded-[4px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> START PROTOCOL
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
