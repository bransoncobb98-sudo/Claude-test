/**
 * TX Arts Pathway demo seed data.
 *
 * Everything created here is clearly flagged isDemo: true and is meant to
 * demonstrate the full Exam -> Domain -> Objective -> Skill -> Lesson /
 * Question architecture end-to-end. All questions are original TX Arts
 * Pathway practice content aligned to publicly available TExES Theatre
 * competencies — none of this is copied from or represents an actual
 * TExES/ETS exam item. Replace with reviewed production content via the
 * Admin CMS or CSV import before launch.
 */
import { PrismaClient, QuestionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface QuestionSeed {
  topic: string;
  difficulty: number;
  prompt: string;
  options: { text: string; correct: boolean; why: string }[];
  explanationIntro: string;
  tags: string[];
}

interface SkillSeed {
  name: string;
  slug: string;
  description: string;
  lesson: { title: string; content: string; keyConcepts: string[]; example: string };
  questions: QuestionSeed[];
}

interface ObjectiveSeed {
  code: string;
  name: string;
  description: string;
  skills: SkillSeed[];
}

interface DomainSeed {
  name: string;
  slug: string;
  description: string;
  weight: number;
  objectives: ObjectiveSeed[];
}

function q(
  topic: string,
  difficulty: number,
  prompt: string,
  options: { text: string; correct: boolean; why: string }[],
  tags: string[]
): QuestionSeed {
  return { topic, difficulty, prompt, options, explanationIntro: '', tags };
}

const DOMAINS: DomainSeed[] = [
  {
    name: 'Theatre History & Literature',
    slug: 'theatre-history-literature',
    description: 'Major periods, movements, and dramatic literature that shape theatrical practice.',
    weight: 25,
    objectives: [
      {
        code: '1.1',
        name: 'Understands major periods and movements in theatre history',
        description: 'From ancient ritual origins through the development of Western theatrical tradition.',
        skills: [
          {
            name: 'Greek and Roman Theatre Origins',
            slug: 'greek-roman-theatre-origins',
            description: 'The origins of Western theatre in ancient Greek and Roman performance practice.',
            lesson: {
              title: 'Foundations of Greek and Roman Theatre',
              content:
                'Western theatre traces its roots to religious festivals honoring Dionysus in ancient Athens, where choral odes gradually gave way to dramatic dialogue. Thespis is traditionally credited as the first actor to step out of the chorus and speak individual lines, around the 6th century BCE. The three great tragedians — Aeschylus, Sophocles, and Euripides — expanded the number of actors on stage and deepened psychological complexity, while Aristophanes established the conventions of Old Comedy. The amphitheater itself, with its orchestra, skene, and remarkable acoustics, shaped how actors moved and projected. Roman theatre, influenced heavily by Greek models, shifted toward broader popular entertainment: Plautus and Terence adapted Greek New Comedy for Roman audiences, and spectacle, including elaborate stage machinery and even gladiatorial displays, became central to Roman theatrical culture.',
              keyConcepts: ['Dionysian festivals', 'Thespis and the first actor', 'The three tragedians', 'Old Comedy', 'Roman adaptation of Greek forms'],
              example:
                'A theatre teacher might introduce students to structure by comparing a Greek tragedy\'s chorus commentary to a modern narrator or Greek-chorus-style ensemble in a contemporary play.',
            },
            questions: [
              q('Origins', 2, 'Which figure is traditionally credited with being the first actor to step out of the chorus and speak as an individual character?', [
                { text: 'Thespis', correct: true, why: 'Correct — Thespis is traditionally credited with this innovation, which is why actors are sometimes called "thespians."' },
                { text: 'Sophocles', correct: false, why: 'Sophocles is credited with adding a third actor and expanding scenic elements, not with originating the role of the actor itself.' },
                { text: 'Aristophanes', correct: false, why: 'Aristophanes is the master of Old Comedy, active well after the role of the actor was established.' },
                { text: 'Plautus', correct: false, why: 'Plautus was a Roman playwright working centuries after this Greek innovation.' },
              ], ['history', 'greek-theatre']),
              q('Structure', 3, 'A modern high school production stages a scene where an ensemble comments on the action and reflects the community\'s reaction. This device most directly descends from which ancient theatrical convention?', [
                { text: 'The Greek chorus', correct: true, why: 'Correct — the chorus in Greek tragedy and comedy commented on the action, represented public opinion, and provided exposition, a role modern ensembles echo.' },
                { text: 'Roman gladiatorial spectacle', correct: false, why: 'Gladiatorial spectacle was a separate popular entertainment, not a commentary device within a play.' },
                { text: 'The skene building', correct: false, why: 'The skene was the physical structure behind the acting area, not a performance convention.' },
                { text: 'Commedia dell\'arte stock characters', correct: false, why: 'Commedia dell\'arte developed in Renaissance Italy, long after this ancient convention.' },
              ], ['history', 'chorus']),
              q('Roman Comedy', 3, 'Roman playwrights such as Plautus most directly built their comedies on which earlier tradition?', [
                { text: 'Greek New Comedy', correct: true, why: 'Correct — Plautus and Terence adapted plots and character types from Greek New Comedy (e.g., Menander) for Roman audiences.' },
                { text: 'Medieval mystery plays', correct: false, why: 'Mystery plays developed over a thousand years later in medieval Europe.' },
                { text: 'Japanese Noh theatre', correct: false, why: 'Noh theatre is an unrelated tradition that developed independently in Japan.' },
                { text: 'Elizabethan revenge tragedy', correct: false, why: 'Elizabethan drama came over a thousand years after Roman comedy and was itself influenced by classical models.' },
              ], ['history', 'roman-theatre']),
              q('Architecture', 2, 'The circular performance space at the center of a Greek theatre, where the chorus danced and sang, is called the:', [
                { text: 'Orchestra', correct: true, why: 'Correct — the orchestra was the circular space for the chorus, positioned between the audience and the skene.' },
                { text: 'Proscenium', correct: false, why: 'The proscenium arch is a framing device associated with later, especially Italian Renaissance, theatre architecture.' },
                { text: 'Skene', correct: false, why: 'The skene was the building behind the performance area, used for entrances, exits, and scenic display.' },
                { text: 'Parodos', correct: false, why: 'The parodos refers to the side aisles used for entrances, not the central performance circle.' },
              ], ['history', 'architecture']),
              q('Tragedians', 4, 'Which playwright is most associated with increasing the number of actors on stage from two to three, allowing for more complex dramatic interaction?', [
                { text: 'Sophocles', correct: true, why: 'Correct — Sophocles is traditionally credited with introducing a third actor, expanding the possibilities for dialogue and conflict.' },
                { text: 'Aeschylus', correct: false, why: 'Aeschylus is credited with introducing the second actor, a major innovation, but the third actor is attributed to Sophocles.' },
                { text: 'Euripides', correct: false, why: 'Euripides worked within the three-actor convention already established by Sophocles, focusing instead on psychological realism.' },
                { text: 'Aristophanes', correct: false, why: 'Aristophanes wrote comedy, not tragedy, and is not credited with this structural change.' },
              ], ['history', 'tragedy']),
            ],
          },
          {
            name: 'Renaissance and Elizabethan Theatre',
            slug: 'renaissance-elizabethan-theatre',
            description: 'The flourishing of European theatre from the Italian Renaissance through Shakespeare\'s England.',
            lesson: {
              title: 'Theatre in the Renaissance and Elizabethan Eras',
              content:
                'The Italian Renaissance revived interest in classical drama and introduced perspective scenery and the proscenium arch, technologies that would shape Western stage design for centuries. Commedia dell\'arte emerged in Italy as a popular, improvisational form built around stock characters like Harlequin and Pantalone. In England, the Elizabethan era saw the construction of purpose-built public playhouses like the Globe, thrust stages surrounded on three sides by standing and seated audiences. Playwrights including Christopher Marlowe and William Shakespeare wrote for these spaces, crafting language-driven drama that relied on minimal scenery and maximal audience imagination. Boy actors played female roles, and the theatrical day was structured around afternoon performances due to lighting constraints.',
              keyConcepts: ['Proscenium arch origins', 'Commedia dell\'arte stock characters', 'Thrust stage design', 'Shakespeare and the Globe', 'Boy actors in female roles'],
              example:
                'Comparing the Globe\'s thrust stage to a modern theatre-in-the-round production helps students see how audience proximity shapes actor energy and blocking choices.',
            },
            questions: [
              q('Stage design', 3, 'The Italian Renaissance is most associated with introducing which stage design innovation to Western theatre?', [
                { text: 'The proscenium arch and perspective scenery', correct: true, why: 'Correct — Italian Renaissance designers developed the proscenium arch and single-point perspective scenic painting.' },
                { text: 'The thrust stage', correct: false, why: 'The thrust stage is most associated with Elizabethan public playhouses like the Globe, not Italian Renaissance court theatres.' },
                { text: 'The Greek orchestra', correct: false, why: 'The orchestra is a Greek theatre architectural feature, over a thousand years earlier.' },
                { text: 'Black box staging', correct: false, why: 'Black box theatre is a 20th-century concept emphasizing flexible, unadorned space.' },
              ], ['renaissance', 'stage-design']),
              q('Commedia', 3, 'Commedia dell\'arte is best characterized by which of the following?', [
                { text: 'Improvised scenarios built around recurring stock characters', correct: true, why: 'Correct — commedia troupes improvised dialogue around known scenarios and stock character types such as Harlequin and Pantalone.' },
                { text: 'Fully scripted verse tragedy', correct: false, why: 'Commedia was largely improvised, not scripted verse tragedy, which better describes much of Elizabethan drama.' },
                { text: 'Religious morality pageantry', correct: false, why: 'Morality plays were a medieval, church-connected form, distinct from the secular, comedic commedia tradition.' },
                { text: 'Realistic domestic drama', correct: false, why: 'Realistic domestic drama emerged much later, in the 19th century.' },
              ], ['renaissance', 'commedia']),
              q('Elizabethan playhouses', 2, 'The Globe Theatre is best described architecturally as a:', [
                { text: 'Thrust stage surrounded on three sides by the audience', correct: true, why: 'Correct — the Globe\'s stage projected into the yard, with standing patrons on three sides and galleries around the perimeter.' },
                { text: 'Proscenium-arch theatre with a curtain', correct: false, why: 'The proscenium arch became standard in later Italian-influenced indoor theatres, not the open-air Globe.' },
                { text: 'Theatre-in-the-round with audience on all four sides', correct: false, why: 'The stage backed onto the tiring house, so it was not surrounded on all sides.' },
                { text: 'An underground amphitheater', correct: false, why: 'The Globe was an above-ground, open-air structure.' },
              ], ['renaissance', 'globe-theatre']),
              q('Casting conventions', 3, 'In Elizabethan public theatre, female roles were most commonly performed by:', [
                { text: 'Boy actors', correct: true, why: 'Correct — women were barred from the English public stage, so boy apprentices played female roles.' },
                { text: 'Adult women', correct: false, why: 'Women did not perform on the licensed English public stage during this period.' },
                { text: 'Masked chorus members', correct: false, why: 'Masked choruses are a Greek theatre convention, not an Elizabethan casting practice.' },
                { text: 'Puppeteers', correct: false, why: 'Puppetry was not the convention used for female roles in Elizabethan public playhouses.' },
              ], ['renaissance', 'performance-practice']),
              q('Playwrights', 2, 'Which playwright, a contemporary of Shakespeare, is known for works such as Doctor Faustus and helped establish blank verse tragedy on the English stage?', [
                { text: 'Christopher Marlowe', correct: true, why: 'Correct — Marlowe was a major Elizabethan playwright whose blank verse tragedies influenced Shakespeare.' },
                { text: 'Molière', correct: false, why: 'Molière was a 17th-century French comic playwright, working in a different national tradition and later period.' },
                { text: 'Henrik Ibsen', correct: false, why: 'Ibsen was a 19th-century Norwegian playwright associated with modern realism.' },
                { text: 'Sophocles', correct: false, why: 'Sophocles was an ancient Greek tragedian, over a thousand years before the Elizabethan era.' },
              ], ['renaissance', 'playwrights']),
            ],
          },
        ],
      },
      {
        code: '1.2',
        name: 'Understands dramatic literature and analysis',
        description: 'Structural and analytical tools for interpreting plays as literature and as blueprints for performance.',
        skills: [
          {
            name: 'Elements of Dramatic Structure',
            slug: 'elements-of-dramatic-structure',
            description: 'The building blocks of plot, including exposition, rising action, climax, and resolution.',
            lesson: {
              title: 'Understanding Dramatic Structure',
              content:
                'Dramatic structure describes how a play organizes conflict over time to create meaning and emotional impact. Gustav Freytag\'s pyramid identifies five stages: exposition (establishing characters, setting, and initial conflict), rising action (complications that intensify conflict), climax (the turning point of highest tension), falling action (consequences unfold), and resolution or denouement (the conflict is settled). Not every play follows this shape rigidly — episodic structures, cyclical plots, and fragmented timelines are common in modern and postmodern drama — but Freytag\'s pyramid remains a foundational tool for analyzing how tension builds and releases. Understanding structure helps directors pace a production and helps actors locate their character\'s objectives within the larger shape of the story.',
              keyConcepts: ['Exposition', 'Rising action', 'Climax', 'Falling action', 'Resolution/denouement', 'Freytag\'s pyramid'],
              example:
                'In a classroom, students can map a familiar play or film onto Freytag\'s pyramid to practice identifying where the climax occurs and why.',
            },
            questions: [
              q('Structure basics', 2, 'In Freytag\'s pyramid, the point of highest tension where the outcome of the central conflict becomes clear is called the:', [
                { text: 'Climax', correct: true, why: 'Correct — the climax is the turning point of maximum tension, after which the action begins to resolve.' },
                { text: 'Exposition', correct: false, why: 'Exposition occurs at the beginning, establishing background information, not the peak of tension.' },
                { text: 'Denouement', correct: false, why: 'The denouement is the final resolution after tension has already released.' },
                { text: 'Inciting incident', correct: false, why: 'The inciting incident starts the central conflict but is not itself the point of highest tension.' },
              ], ['structure', 'freytag']),
              q('Structure basics', 2, 'The section of a play in which background information about characters, setting, and initial circumstances is established is called:', [
                { text: 'Exposition', correct: true, why: 'Correct — exposition provides the audience with the information needed to understand the world and stakes of the play.' },
                { text: 'Falling action', correct: false, why: 'Falling action occurs after the climax, showing the consequences of the turning point.' },
                { text: 'Climax', correct: false, why: 'The climax is the peak of tension, not the introductory information.' },
                { text: 'Denouement', correct: false, why: 'The denouement is the final resolution, occurring at the end of the play.' },
              ], ['structure', 'exposition']),
              q('Modern structure', 4, 'A play that unfolds in a nonlinear, fragmented sequence of scenes rather than a rising-action-to-climax arc would be best described as departing from which structural model?', [
                { text: 'Freytag\'s pyramid', correct: true, why: 'Correct — Freytag\'s pyramid describes a linear rise-and-fall structure; fragmented, nonlinear plays intentionally depart from this model.' },
                { text: 'Commedia scenario structure', correct: false, why: 'Commedia scenarios were loose improvisational outlines, not the linear structural model being described here.' },
                { text: 'Greek chorus convention', correct: false, why: 'The chorus is a performance convention, not a structural model for plot organization.' },
                { text: 'Proscenium staging', correct: false, why: 'Proscenium staging is an architectural arrangement, unrelated to plot structure.' },
              ], ['structure', 'modern-drama']),
              q('Falling action', 3, 'After the climax of a play, the section showing the consequences of the turning point as tension decreases is known as the:', [
                { text: 'Falling action', correct: true, why: 'Correct — falling action follows the climax, showing how events unwind toward resolution.' },
                { text: 'Inciting incident', correct: false, why: 'The inciting incident occurs early, setting the central conflict in motion.' },
                { text: 'Exposition', correct: false, why: 'Exposition occurs at the start of the play, before conflict develops.' },
                { text: 'Rising action', correct: false, why: 'Rising action builds tension before the climax, not after it.' },
              ], ['structure', 'falling-action']),
              q('Conflict', 3, 'The event that sets the central conflict of a play into motion, typically occurring early in the exposition, is called the:', [
                { text: 'Inciting incident', correct: true, why: 'Correct — the inciting incident disrupts the status quo and launches the central conflict the rest of the play explores.' },
                { text: 'Denouement', correct: false, why: 'The denouement is the final untangling of the plot, occurring at the very end.' },
                { text: 'Climax', correct: false, why: 'The climax is the peak of tension resulting from the conflict, not what starts it.' },
                { text: 'Falling action', correct: false, why: 'Falling action follows the climax; it does not initiate the conflict.' },
              ], ['structure', 'inciting-incident']),
            ],
          },
          {
            name: 'Genre and Style Analysis',
            slug: 'genre-and-style-analysis',
            description: 'Distinguishing tragedy, comedy, and other genres, and recognizing stylistic movements such as realism and absurdism.',
            lesson: {
              title: 'Analyzing Genre and Theatrical Style',
              content:
                'Genre classifies a play by its overall tone and outcome — tragedy typically follows a protagonist toward downfall driven by a fatal flaw or circumstance, while comedy moves toward resolution and social reintegration, often through misunderstanding and reconciliation. Tragicomedy blends elements of both. Beyond genre, theatrical style describes the aesthetic and philosophical approach to representing reality on stage. Realism, pioneered by writers like Ibsen and Chekhov, aims to depict everyday life and psychology with fidelity. Naturalism pushes this further toward deterministic, often bleak depictions of environment shaping character. In reaction, Expressionism distorts reality to externalize inner emotional states, and Absurdism (Beckett, Ionesco) presents illogical, often circular situations to reflect a perceived meaninglessness in existence. Recognizing genre and style guides directors and designers toward appropriate performance choices, from acting technique to set design.',
              keyConcepts: ['Tragedy vs. comedy', 'Tragicomedy', 'Realism and naturalism', 'Expressionism', 'Absurdism'],
              example:
                'Contrasting a realistic Chekhov scene with an absurdist Beckett scene in class helps students see how genre and style change blocking, pacing, and vocal choices.',
            },
            questions: [
              q('Genre', 2, 'A play in which the protagonist moves toward downfall, often due to a fatal flaw or unavoidable circumstance, is generally classified as:', [
                { text: 'Tragedy', correct: true, why: 'Correct — tragedy traditionally follows a protagonist\'s decline, often tied to a fatal flaw (hamartia) or fate.' },
                { text: 'Comedy', correct: false, why: 'Comedy moves toward resolution and reintegration, typically ending happily, the opposite trajectory.' },
                { text: 'Farce', correct: false, why: 'Farce is a subtype of comedy relying on exaggerated, improbable situations for humor, not downfall.' },
                { text: 'Melodrama', correct: false, why: 'Melodrama emphasizes exaggerated emotion and clear moral binaries, not necessarily tragic downfall.' },
              ], ['genre', 'tragedy']),
              q('Style', 3, 'A playwright who depicts everyday domestic life and psychologically believable characters with close fidelity to observed reality is working primarily in the style of:', [
                { text: 'Realism', correct: true, why: 'Correct — realism, associated with writers like Ibsen and Chekhov, seeks to depict life and psychology with truthful fidelity.' },
                { text: 'Absurdism', correct: false, why: 'Absurdism presents illogical, often circular situations, the opposite of faithful realistic depiction.' },
                { text: 'Expressionism', correct: false, why: 'Expressionism distorts reality to externalize inner emotion rather than depicting it faithfully.' },
                { text: 'Commedia dell\'arte', correct: false, why: 'Commedia relies on stock characters and improvisation, not psychological realism.' },
              ], ['genre', 'realism']),
              q('Style', 4, 'A production that distorts sets, lighting, and character behavior to externalize a character\'s inner emotional turmoil is drawing on which theatrical style?', [
                { text: 'Expressionism', correct: true, why: 'Correct — Expressionism uses distortion and exaggeration to visually and physically manifest internal psychological states.' },
                { text: 'Naturalism', correct: false, why: 'Naturalism emphasizes deterministic, unembellished depictions of environment and behavior, not stylistic distortion.' },
                { text: 'Realism', correct: false, why: 'Realism aims for fidelity to everyday life, not distortion for emotional effect.' },
                { text: 'Classical tragedy', correct: false, why: 'Classical tragedy follows formal conventions of the ancient Greek stage, not modern expressionist distortion.' },
              ], ['genre', 'expressionism']),
              q('Style', 4, 'Plays by Samuel Beckett and Eugène Ionesco, which often present illogical, circular situations reflecting a perceived meaninglessness in existence, are most associated with:', [
                { text: 'Absurdism', correct: true, why: 'Correct — Absurdism, associated with Beckett and Ionesco, presents illogical or repetitive situations reflecting existential meaninglessness.' },
                { text: 'Realism', correct: false, why: 'Realism seeks logical, faithful depictions of everyday life, the opposite approach.' },
                { text: 'Melodrama', correct: false, why: 'Melodrama relies on heightened emotion and clear moral conflict, not existential illogic.' },
                { text: 'Restoration comedy', correct: false, why: 'Restoration comedy is a 17th-century English style focused on wit and social manners.' },
              ], ['genre', 'absurdism']),
              q('Genre', 3, 'A play that blends serious, potentially tragic circumstances with a hopeful or comedic resolution is best classified as:', [
                { text: 'Tragicomedy', correct: true, why: 'Correct — tragicomedy blends tragic stakes with a comedic or hopeful resolution.' },
                { text: 'Farce', correct: false, why: 'Farce relies on exaggerated, fast-paced comic situations, not a blend of tragic and comedic tone.' },
                { text: 'Naturalism', correct: false, why: 'Naturalism is a stylistic approach to depicting reality, not a genre defined by tone and outcome.' },
                { text: 'Absurdism', correct: false, why: 'Absurdism is defined by illogical circumstance and existential themes, not a blend of tragedy and comedy specifically.' },
              ], ['genre', 'tragicomedy']),
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Acting & Directing',
    slug: 'acting-directing',
    description: 'Performance technique and the principles directors use to shape a production.',
    weight: 25,
    objectives: [
      {
        code: '2.1',
        name: 'Understands acting techniques and performance',
        description: 'Approaches to character development and the vocal/physical instrument of the actor.',
        skills: [
          {
            name: 'Character Analysis and Motivation',
            slug: 'character-analysis-and-motivation',
            description: 'Techniques for uncovering a character\'s objectives, obstacles, and tactics.',
            lesson: {
              title: 'Analyzing Character Objectives and Motivation',
              content:
                'Stanislavski-based approaches to acting emphasize that every character pursues an objective (what the character wants) in each scene, faces an obstacle (what stands in the way), and employs tactics (specific actions used to get what they want). The overarching objective across the whole play is sometimes called the "super-objective" or "spine." Actors also use the concept of "given circumstances" — the facts of the world, relationships, and events established by the text — to ground believable choices. Sense memory and emotional recall are additional tools for connecting personal experience to a character\'s emotional life, though many contemporary approaches favor action-based work (playing tactics) over purely emotional techniques, since actively pursuing a goal tends to produce more truthful, dynamic performance than trying to "feel" an emotion directly.',
              keyConcepts: ['Objective', 'Obstacle', 'Tactics', 'Super-objective/spine', 'Given circumstances'],
              example:
                'Ask students to identify a character\'s objective in a single scene and list three different tactics the character could use to pursue it, then perform the scene trying each tactic.',
            },
            questions: [
              q('Stanislavski', 3, 'In Stanislavski-based acting technique, what a character wants to achieve within a scene is called the character\'s:', [
                { text: 'Objective', correct: true, why: 'Correct — the objective is the specific goal a character pursues within a scene.' },
                { text: 'Given circumstance', correct: false, why: 'Given circumstances are the established facts of the world and situation, not the character\'s goal.' },
                { text: 'Super-objective', correct: false, why: 'The super-objective is the character\'s overarching goal across the entire play, not a single scene.' },
                { text: 'Tactic', correct: false, why: 'A tactic is the specific action or approach used to pursue the objective, not the goal itself.' },
              ], ['acting', 'objective']),
              q('Stanislavski', 3, 'The specific actions a character uses to try to get what they want in a scene are called:', [
                { text: 'Tactics', correct: true, why: 'Correct — tactics are the concrete actions (e.g., to flatter, to threaten, to plead) an actor plays to pursue the objective.' },
                { text: 'Obstacles', correct: false, why: 'Obstacles are what stands in the way of the objective, not the actions used to overcome it.' },
                { text: 'Given circumstances', correct: false, why: 'Given circumstances are contextual facts established by the text, not chosen actions.' },
                { text: 'Super-objective', correct: false, why: 'The super-objective is the overarching goal for the whole play, not a moment-to-moment action.' },
              ], ['acting', 'tactics']),
              q('Given circumstances', 2, 'The established facts about a character\'s world, relationships, time period, and immediate situation are collectively known as the:', [
                { text: 'Given circumstances', correct: true, why: 'Correct — given circumstances are the textual facts that ground an actor\'s choices in the specific world of the play.' },
                { text: 'Super-objective', correct: false, why: 'The super-objective is the character\'s overall driving goal, not contextual facts.' },
                { text: 'Sense memory', correct: false, why: 'Sense memory is a technique for recalling personal sensory experience, not textual facts.' },
                { text: 'Tactic', correct: false, why: 'A tactic is an action choice, not background information about the world of the play.' },
              ], ['acting', 'given-circumstances']),
              q('Contemporary practice', 4, 'Many contemporary acting approaches favor playing active tactics over pursuing emotion directly because:', [
                { text: 'Actively pursuing a goal tends to produce more truthful, dynamic performance than trying to force a feeling', correct: true, why: 'Correct — action-based approaches argue that genuine emotion tends to arise as a byproduct of truthfully pursuing an objective, rather than being manufactured directly.' },
                { text: 'Emotion is irrelevant to good acting', correct: false, why: 'Emotion still matters in performance; the point is how it is accessed, not that it is unimportant.' },
                { text: 'Tactics are easier to memorize than lines', correct: false, why: 'This describes a practical convenience, not the pedagogical reasoning behind action-based technique.' },
                { text: 'Objectives are only useful for comedy', correct: false, why: 'Objectives are considered useful across genres, not limited to comedic material.' },
              ], ['acting', 'technique']),
              q('Super-objective', 3, 'A character\'s overarching goal that unifies their choices across the entire play, rather than in just one scene, is called the:', [
                { text: 'Super-objective (or spine)', correct: true, why: 'Correct — the super-objective, sometimes called the spine, is the throughline goal driving a character across the whole play.' },
                { text: 'Obstacle', correct: false, why: 'An obstacle is what stands in the way of a goal, not the goal itself.' },
                { text: 'Given circumstance', correct: false, why: 'Given circumstances are contextual facts, not a unifying goal.' },
                { text: 'Tactic', correct: false, why: 'A tactic is a specific, moment-to-moment action, not an overarching goal.' },
              ], ['acting', 'super-objective']),
            ],
          },
          {
            name: 'Vocal and Physical Technique',
            slug: 'vocal-and-physical-technique',
            description: 'The actor\'s instrument: breath support, projection, articulation, and physical expressiveness.',
            lesson: {
              title: 'Building the Actor\'s Vocal and Physical Instrument',
              content:
                'An actor\'s voice and body are the primary instruments of storytelling. Vocal technique begins with breath support from the diaphragm, which enables sustained projection without straining the throat. Articulation exercises sharpen consonants and vowels for clarity, especially important in large or acoustically challenging spaces. Pitch, pace, and volume variation prevent monotone delivery and help communicate emotional shifts. Physically, actors train body awareness and control through techniques like Laban Movement Analysis, which examines effort qualities (weight, space, time, flow) to build distinct physical characterizations. Alignment and relaxation exercises reduce tension that can restrict both voice and movement. Together, vocal and physical training allow an actor to make bold, sustainable choices that read clearly to an audience, whether in an intimate black box or a large proscenium house.',
              keyConcepts: ['Diaphragmatic breath support', 'Articulation', 'Pitch/pace/volume variation', 'Laban effort qualities', 'Alignment and relaxation'],
              example:
                'A vocal warm-up combining breath support exercises with tongue-twisters for articulation prepares students for a scene requiring both projection and rapid-fire dialogue.',
            },
            questions: [
              q('Voice', 2, 'Sustained vocal projection without straining the throat is primarily achieved through:', [
                { text: 'Diaphragmatic breath support', correct: true, why: 'Correct — breath support from the diaphragm allows actors to project loudly and sustainably without straining the throat.' },
                { text: 'Speaking faster', correct: false, why: 'Speed does not produce volume or sustainability; it can actually reduce clarity.' },
                { text: 'Tensing the neck and shoulders', correct: false, why: 'Tension in the neck and shoulders restricts the voice and can cause strain or damage.' },
                { text: 'Whispering with emphasis', correct: false, why: 'Whispering reduces vocal projection rather than increasing it.' },
              ], ['voice', 'breath-support']),
              q('Movement', 4, 'A movement framework that analyzes qualities such as weight, space, time, and flow to help actors build distinct physical characterizations is known as:', [
                { text: 'Laban Movement Analysis', correct: true, why: 'Correct — Laban Movement Analysis examines effort qualities like weight, space, time, and flow to shape physical characterization.' },
                { text: 'Stanislavski\'s system', correct: false, why: 'Stanislavski\'s system focuses primarily on psychological and given-circumstance-based acting technique, not a movement effort framework.' },
                { text: 'Meisner technique', correct: false, why: 'Meisner technique emphasizes repetition and reacting truthfully to a partner, not a movement effort framework.' },
                { text: 'Freytag\'s pyramid', correct: false, why: 'Freytag\'s pyramid describes dramatic plot structure, unrelated to physical movement training.' },
              ], ['movement', 'laban']),
              q('Articulation', 2, 'Exercises that sharpen the clarity of consonants and vowels, especially for large or acoustically difficult spaces, primarily train an actor\'s:', [
                { text: 'Articulation', correct: true, why: 'Correct — articulation exercises improve clarity of speech sounds, which is critical for audibility in large spaces.' },
                { text: 'Given circumstances', correct: false, why: 'Given circumstances are contextual facts about the play, unrelated to speech clarity.' },
                { text: 'Blocking', correct: false, why: 'Blocking refers to planned stage movement, not vocal clarity.' },
                { text: 'Super-objective', correct: false, why: 'The super-objective is a character\'s overarching goal, unrelated to vocal training.' },
              ], ['voice', 'articulation']),
              q('Vocal variety', 3, 'An actor delivering all lines at the same pitch, pace, and volume throughout a scene risks:', [
                { text: 'Sounding monotone and failing to communicate emotional shifts', correct: true, why: 'Correct — variation in pitch, pace, and volume is what signals emotional and dramatic shifts to an audience; without it, delivery reads as flat.' },
                { text: 'Projecting too loudly for the space', correct: false, why: 'Consistent delivery does not by itself cause excessive volume; the issue described is monotony, not loudness.' },
                { text: 'Losing character objectives', correct: false, why: 'Objectives are a separate acting tool; vocal monotony does not directly cause a character to lose their objective.' },
                { text: 'Improving audience comprehension', correct: false, why: 'Monotone delivery typically reduces engagement and clarity of emotional meaning, not improves it.' },
              ], ['voice', 'vocal-variety']),
              q('Physical training', 3, 'Alignment and relaxation exercises are valuable to actors primarily because they:', [
                { text: 'Reduce tension that can restrict both voice and movement', correct: true, why: 'Correct — excess physical tension can constrict breath and limit expressive movement, so alignment and relaxation work supports both vocal and physical technique.' },
                { text: 'Eliminate the need for vocal warm-ups', correct: false, why: 'Alignment and relaxation complement, rather than replace, vocal warm-up work.' },
                { text: 'Are only useful for musical theatre performers', correct: false, why: 'These techniques benefit all actors, not only those in musical theatre.' },
                { text: 'Replace the need for character analysis', correct: false, why: 'Physical training and character analysis are complementary but distinct areas of actor preparation.' },
              ], ['movement', 'alignment']),
            ],
          },
        ],
      },
      {
        code: '2.2',
        name: 'Understands directing principles',
        description: 'The director\'s tools for shaping a script into a cohesive, visually and dramatically effective production.',
        skills: [
          {
            name: 'Blocking and Stage Composition',
            slug: 'blocking-and-stage-composition',
            description: 'How directors arrange actors in space to communicate meaning and focus.',
            lesson: {
              title: 'Principles of Blocking and Stage Composition',
              content:
                'Blocking refers to the planned movement and positioning of actors on stage, while composition describes how those positions create visual meaning at any given moment. Directors use stage areas (e.g., downstage, upstage, stage right, stage left) to think about focus — downstage positions generally read as stronger and more intimate, while upstage positions can suggest distance or weakness. Levels (standing, sitting, kneeling) and stage pictures (triangles, lines, groupings) direct audience attention and reveal relationships, such as placing a dominant character higher or more centrally. Cross and counter-cross (one actor moving as another settles) keep the stage picture alive without competing for focus. Good blocking should feel motivated by character objectives and given circumstances rather than imposed arbitrarily for visual effect alone.',
              keyConcepts: ['Stage areas (downstage/upstage, stage right/left)', 'Focus and strength of position', 'Levels', 'Stage pictures/composition', 'Cross and counter-cross'],
              example:
                'Ask students to block a two-person argument scene twice: once with both actors at the same level and distance, and once using levels and proximity to show a power imbalance, then discuss how the audience\'s reading of the relationship changes.',
            },
            questions: [
              q('Stage areas', 2, 'A position downstage and center is generally considered to have:', [
                { text: 'Strong focus, reading as intimate and powerful', correct: true, why: 'Correct — downstage center is typically the strongest, most intimate position, closest to the audience.' },
                { text: 'Weak focus, reading as distant', correct: false, why: 'Upstage positions, not downstage center, tend to read as more distant or weaker in focus.' },
                { text: 'No effect on audience focus', correct: false, why: 'Stage position strongly affects where audience attention is drawn; downstage center is a particularly strong position.' },
                { text: 'Focus only in comedic scenes', correct: false, why: 'The strength of downstage center applies across genres, not just comedy.' },
              ], ['directing', 'stage-areas']),
              q('Composition', 3, 'A director wants to visually establish that one character dominates a scene. Which staging choice would most directly support that goal?', [
                { text: 'Placing the dominant character on a higher level or more central position', correct: true, why: 'Correct — higher levels and central positions are read by audiences as positions of power or dominance.' },
                { text: 'Having both characters stand at exactly the same level and distance from the audience', correct: false, why: 'Equal levels and positioning tend to suggest equality, not dominance, between characters.' },
                { text: 'Placing the dominant character furthest upstage', correct: false, why: 'Upstage positions typically read as weaker or more distant, working against the goal of showing dominance.' },
                { text: 'Keeping both actors motionless for the entire scene', correct: false, why: 'Static blocking does not by itself communicate a power dynamic and can make the stage picture feel lifeless.' },
              ], ['directing', 'composition']),
              q('Cross and counter-cross', 3, 'When one actor crosses to a new position, a director often has another actor make a small counter-cross in response primarily to:', [
                { text: 'Keep the stage picture balanced and alive without competing for focus', correct: true, why: 'Correct — counter-crossing rebalances the stage composition and keeps the picture dynamic while avoiding two actors competing for the same focus.' },
                { text: 'Confuse the audience about which character is speaking', correct: false, why: 'Good blocking aims for clarity, not confusion, about focus and relationships.' },
                { text: 'Fill time during a costume change', correct: false, why: 'Counter-crossing is a compositional tool, not primarily a practical stalling technique.' },
                { text: 'Ensure both actors always face directly upstage', correct: false, why: 'Facing upstage would reduce visibility and is not the purpose of a counter-cross.' },
              ], ['directing', 'cross-counter-cross']),
              q('Motivated blocking', 4, 'Blocking that is imposed purely for visual variety, without connection to character objectives or given circumstances, risks:', [
                { text: 'Feeling arbitrary or unmotivated to the audience and actors', correct: true, why: 'Correct — blocking disconnected from objectives and circumstances can feel artificial, undermining the believability of the scene.' },
                { text: 'Automatically improving audience focus', correct: false, why: 'Unmotivated blocking does not reliably improve focus; motivated blocking, grounded in character intention, is more effective.' },
                { text: 'Making the stage picture more historically accurate', correct: false, why: 'Historical accuracy is unrelated to whether blocking is motivated by character choices.' },
                { text: 'Eliminating the need for stage composition', correct: false, why: 'Composition principles still apply regardless of whether blocking is well-motivated.' },
              ], ['directing', 'motivation']),
              q('Levels', 2, 'Varying the physical levels of actors on stage (standing, sitting, kneeling) primarily helps a director:', [
                { text: 'Direct audience attention and reveal relationships between characters', correct: true, why: 'Correct — differences in level create visual hierarchy and help communicate relationships and focus to the audience.' },
                { text: 'Reduce the number of actors needed for a scene', correct: false, why: 'Levels are a compositional tool and have no bearing on cast size.' },
                { text: 'Avoid the need for lighting design', correct: false, why: 'Levels and lighting are separate design elements that work together, not substitutes for one another.' },
                { text: 'Shorten the running time of a scene', correct: false, why: 'Levels affect visual composition, not the pacing or length of a scene.' },
              ], ['directing', 'levels']),
            ],
          },
          {
            name: 'Script Analysis for Directors',
            slug: 'script-analysis-for-directors',
            description: 'How directors break down a script to form a production concept.',
            lesson: {
              title: 'Script Analysis and Production Concept',
              content:
                'Before staging a play, directors conduct a thorough script analysis: identifying the central conflict, each character\'s objectives and relationships, the given circumstances, and the play\'s overall structure and themes. From this analysis, a director develops a production concept — a unifying artistic point of view that answers "why this play, why now, why this way?" The concept might emphasize a particular historical parallel, a design aesthetic, or a thematic lens, and it guides collaboration with designers (set, lighting, costume, sound) so that every design element supports a cohesive vision rather than working at cross purposes. A strong concept is rooted in the text rather than imposed arbitrarily, and it should clarify, not obscure, the play\'s core themes and conflicts for the audience.',
              keyConcepts: ['Central conflict identification', 'Character relationships and objectives', 'Production concept', 'Design collaboration', 'Textual grounding of concept'],
              example:
                'A director staging a classic play in a contemporary setting should be able to articulate specifically how that choice illuminates the text\'s themes, not just that it looks interesting.',
            },
            questions: [
              q('Production concept', 3, 'A director\'s unifying artistic point of view that answers "why this play, why now, why this way" is best described as the:', [
                { text: 'Production concept', correct: true, why: 'Correct — the production concept is the director\'s unifying vision guiding every design and staging choice.' },
                { text: 'Given circumstances', correct: false, why: 'Given circumstances are facts established by the text itself, not the director\'s interpretive vision.' },
                { text: 'Blocking chart', correct: false, why: 'A blocking chart records planned actor movement, a product of the concept rather than the concept itself.' },
                { text: 'Super-objective', correct: false, why: 'The super-objective belongs to a character\'s throughline, not the director\'s overall artistic vision.' },
              ], ['directing', 'production-concept']),
              q('Concept grounding', 4, 'A strong production concept is generally considered effective when it:', [
                { text: 'Is rooted in the text and clarifies its themes and conflicts', correct: true, why: 'Correct — an effective concept emerges from the text\'s own themes and conflicts rather than being imposed for novelty alone.' },
                { text: 'Is chosen primarily because it looks visually striking, regardless of the text', correct: false, why: 'A concept chosen purely for visual novelty, without textual grounding, risks working against the play\'s meaning.' },
                { text: 'Ignores the script\'s central conflict in favor of the director\'s personal preferences', correct: false, why: 'Ignoring the central conflict undermines the coherence and truthfulness of the production.' },
                { text: 'Changes with every performance to keep actors on their toes', correct: false, why: 'A production concept should provide a stable, unifying frame for the run, not shift unpredictably.' },
              ], ['directing', 'concept-grounding']),
              q('Collaboration', 3, 'A clearly articulated production concept is most valuable to a director because it:', [
                { text: 'Gives designers a shared vision so set, lighting, costume, and sound choices support one cohesive production', correct: true, why: 'Correct — a shared concept helps ensure that all design elements reinforce rather than contradict one another.' },
                { text: 'Removes the need for designers to read the script', correct: false, why: 'Designers still need to engage deeply with the script; the concept guides, but does not replace, that work.' },
                { text: 'Guarantees positive audience reviews', correct: false, why: 'A strong concept supports coherent storytelling but cannot guarantee critical or audience reception.' },
                { text: 'Is only relevant for large-budget professional productions', correct: false, why: 'Production concept is a valuable tool at any budget level, including student and community theatre.' },
              ], ['directing', 'collaboration']),
              q('Script breakdown', 2, 'Identifying each character\'s objectives, relationships, and the given circumstances of the world of the play is part of which stage of a director\'s process?', [
                { text: 'Script analysis', correct: true, why: 'Correct — script analysis is the foundational process of breaking down character objectives, relationships, and given circumstances before staging decisions are made.' },
                { text: 'Load-in', correct: false, why: 'Load-in refers to the physical installation of sets and technical elements in the theatre, a much later production phase.' },
                { text: 'Strike', correct: false, why: 'Strike is the process of dismantling a set after a production closes, unrelated to script analysis.' },
                { text: 'Casting callbacks', correct: false, why: 'Callbacks are part of the casting process; script analysis typically precedes and informs casting decisions.' },
              ], ['directing', 'script-analysis']),
              q('Themes', 4, 'A director sets a classic tragedy in a contemporary corporate office to highlight themes of ambition and betrayal already present in the text. This is an example of:', [
                { text: 'A production concept grounded in the text\'s themes', correct: true, why: 'Correct — this reinterpretation is justified because it is used to illuminate themes (ambition, betrayal) already present in the original text.' },
                { text: 'An arbitrary design choice unrelated to the script', correct: false, why: 'The choice is explicitly tied to themes already in the text, so it is not arbitrary or unrelated.' },
                { text: 'A violation of given circumstances', correct: false, why: 'Given circumstances can be reinterpreted through a concept as long as the underlying textual themes remain honored, which is the case here.' },
                { text: 'A purely technical, non-artistic decision', correct: false, why: 'This is fundamentally an artistic/interpretive choice, not a technical one like a lighting cue or scene shift mechanism.' },
              ], ['directing', 'concept-example']),
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Stagecraft & Design',
    slug: 'stagecraft-design',
    description: 'The technical and design disciplines that realize a production visually and aurally.',
    weight: 25,
    objectives: [
      {
        code: '3.1',
        name: 'Understands lighting and sound design',
        description: 'How light and sound shape mood, focus, and clarity in performance.',
        skills: [
          {
            name: 'Lighting Instruments and Their Uses',
            slug: 'lighting-instruments-and-their-uses',
            description: 'Common stage lighting instruments and the beam qualities that suit different design needs.',
            lesson: {
              title: 'Stage Lighting Instruments',
              content:
                'Lighting designers choose instruments based on the beam quality needed for a given purpose. The Fresnel produces a soft-edged, adjustable beam ideal for blending general wash coverage across a stage area, since its edges do not create harsh, visible circles. The ellipsoidal reflector spotlight (ERS, sometimes called a "Leko") produces a sharp, controllable beam with hard or soft-focusable edges, often fitted with shutters or a gobo for precise shaping — useful for specials, sharp-edged washes, or projecting patterns. A PAR (parabolic aluminized reflector) can produces a fixed, oval or round beam that is less adjustable but efficient and often used for broad washes or rock-concert-style looks. A followspot is a powerful, manually operated instrument designed to track a moving performer, commonly used in musicals for a soloist. Choosing the right instrument for the right job is central to effective, purposeful lighting design.',
              keyConcepts: ['Fresnel (soft edge)', 'Ellipsoidal reflector spotlight / Leko (sharp, shapeable)', 'PAR can (fixed beam)', 'Followspot (tracks performers)', 'Gobos and shutters'],
              example:
                'A designer lighting a general daytime living-room scene would likely choose Fresnels for a soft, blended wash, reserving an ERS for a sharp special on a reading lamp area.',
            },
            questions: [
              q('Instrument selection', 3, 'A lighting designer needs a soft-edged instrument to create a blended general wash across a large stage area. Which instrument is most appropriate?', [
                { text: 'Fresnel', correct: true, why: 'Correct — the Fresnel produces a soft-edged beam that blends well with adjacent instruments, ideal for general area coverage.' },
                { text: 'Ellipsoidal reflector spotlight', correct: false, why: 'An ERS produces a sharper, more controllable beam, better suited to precise specials than a soft blended wash.' },
                { text: 'PAR can', correct: false, why: 'A PAR produces a fixed, less adjustable beam and is typically used for broader washes with a harder edge, not fine blending.' },
                { text: 'Followspot', correct: false, why: 'A followspot is designed for tracking a performer, not for creating a blended general wash.' },
              ], ['lighting', 'instrument-selection']),
              q('Instrument selection', 3, 'To create a sharply focused special on a single actor, with the option to shape the beam using shutters or a gobo, a designer would most likely choose a(n):', [
                { text: 'Ellipsoidal reflector spotlight (ERS/Leko)', correct: true, why: 'Correct — the ERS is designed for sharp, shapeable beams using shutters and gobos, ideal for precise specials.' },
                { text: 'Fresnel', correct: false, why: 'A Fresnel produces a soft-edged beam and does not use shutters for hard-edged shaping.' },
                { text: 'PAR can', correct: false, why: 'A PAR produces a fixed oval or round beam without shutter shaping capability.' },
                { text: 'Practical lamp', correct: false, why: 'A practical is a functioning light fixture that appears as part of the set (like a lamp), not a shapeable lighting instrument.' },
              ], ['lighting', 'ers']),
              q('Musical theatre', 2, 'In a musical theatre production, the instrument most commonly used to visually track a soloist as they move across the stage is the:', [
                { text: 'Followspot', correct: true, why: 'Correct — followspots are powerful, manually operated instruments specifically designed to track moving performers.' },
                { text: 'Fresnel', correct: false, why: 'Fresnels are typically fixed in position for general wash coverage, not manually tracked on a performer.' },
                { text: 'PAR can', correct: false, why: 'PAR cans are fixed-position instruments for washes, not designed for live tracking.' },
                { text: 'Ellipsoidal reflector spotlight', correct: false, why: 'While an ERS can create a special, it is not the instrument designed specifically for live performer tracking; that role belongs to the followspot.' },
              ], ['lighting', 'followspot']),
              q('Beam quality', 3, 'A PAR can is generally considered less adjustable than an ellipsoidal reflector spotlight because it:', [
                { text: 'Produces a fixed beam shape that cannot be reshaped with shutters', correct: true, why: 'Correct — a PAR\'s beam shape and size are largely fixed by its lamp and lens, unlike an ERS\'s shutter-adjustable beam.' },
                { text: 'Cannot produce any light output', correct: false, why: 'PAR cans are efficient, high-output instruments; the limitation is adjustability of beam shape, not output.' },
                { text: 'Is only used for followspot effects', correct: false, why: 'PAR cans are typically fixed washes, not used as followspots.' },
                { text: 'Requires a gobo for all uses', correct: false, why: 'PAR cans generally do not use gobos; gobo patterns are more associated with ellipsoidal instruments.' },
              ], ['lighting', 'par-can']),
              q('Design purpose', 4, 'A gobo is best described as a tool used to:', [
                { text: 'Project a textured pattern or shape through a lighting instrument, most often an ERS', correct: true, why: 'Correct — a gobo is a metal or glass template placed in an instrument (typically an ERS) to project a pattern, such as leaves or window panes.' },
                { text: 'Amplify sound for a musical number', correct: false, why: 'A gobo is a lighting tool, unrelated to sound amplification.' },
                { text: 'Track a moving performer', correct: false, why: 'Tracking a performer is the function of a followspot, not a gobo.' },
                { text: 'Provide a soft, blended general wash', correct: false, why: 'Soft blended washes are typically the role of Fresnels, not gobo-projecting instruments.' },
              ], ['lighting', 'gobo']),
            ],
          },
          {
            name: 'Sound Design Fundamentals',
            slug: 'sound-design-fundamentals',
            description: 'Core concepts of reinforcement, playback, and creating an aural landscape for a production.',
            lesson: {
              title: 'Foundations of Sound Design',
              content:
                'Sound design serves a production in several overlapping ways: reinforcement (amplifying live voices or instruments so they are heard clearly), playback (pre-recorded sound effects, underscoring, or music cues), and the creation of an overall aural landscape that supports mood and setting. Microphone choice and placement affect clarity and feedback risk — wireless lavalier microphones are common for principal performers in musicals, while overhead or floor microphones may reinforce a whole ensemble. Sound designers build cue sheets that specify the timing, source, and playback level of each effect, coordinating closely with the stage manager, who calls sound cues during a live performance just as they call lighting and set cues. Effective sound design should support storytelling without calling attention to itself unless a specific effect is meant to be noticed.',
              keyConcepts: ['Reinforcement vs. playback', 'Microphone types and placement', 'Cue sheets', 'Stage manager calling cues', 'Sound supporting mood/setting'],
              example:
                'A sound designer building the underscore for a suspenseful scene must decide not just what music to use but the precise cue point and fade timing so it enhances rather than distracts from the actors\' work.',
            },
            questions: [
              q('Core concepts', 2, 'Amplifying a live performer\'s voice so it is audible throughout the house is an example of which sound design function?', [
                { text: 'Reinforcement', correct: true, why: 'Correct — reinforcement refers to amplifying live sound (voices or instruments) so an audience can hear it clearly.' },
                { text: 'Playback', correct: false, why: 'Playback refers to pre-recorded sound effects or music, not the amplification of live voices.' },
                { text: 'Gobo projection', correct: false, why: 'A gobo is a lighting design element, unrelated to sound.' },
                { text: 'Blocking', correct: false, why: 'Blocking is a directing/staging concept, unrelated to sound reinforcement.' },
              ], ['sound', 'reinforcement']),
              q('Core concepts', 2, 'Pre-recorded sound effects and underscoring that are triggered during a performance are examples of:', [
                { text: 'Playback', correct: true, why: 'Correct — playback refers to pre-recorded audio elements, such as sound effects or underscoring, triggered during the show.' },
                { text: 'Reinforcement', correct: false, why: 'Reinforcement specifically refers to amplifying live sound, not triggering pre-recorded audio.' },
                { text: 'Blocking', correct: false, why: 'Blocking refers to actor movement on stage, unrelated to sound cues.' },
                { text: 'Composition', correct: false, why: 'Composition in this context refers to visual stage arrangement, not audio playback.' },
              ], ['sound', 'playback']),
              q('Production roles', 3, 'During a live performance, sound cues are typically executed on the direction of the:', [
                { text: 'Stage manager', correct: true, why: 'Correct — the stage manager calls cues (lighting, sound, and scenic) during a live performance to keep the technical elements synchronized with the action.' },
                { text: 'Playwright', correct: false, why: 'The playwright\'s work is generally complete before rehearsals and does not involve calling live cues.' },
                { text: 'Followspot operator alone, without coordination', correct: false, why: 'While a followspot operator executes their own cues, they still work under the stage manager\'s calls, not independently.' },
                { text: 'Box office manager', correct: false, why: 'The box office manages ticketing and is not involved in calling technical cues during a performance.' },

              ], ['sound', 'stage-manager']),
              q('Design intent', 3, 'Effective sound design is generally considered successful when it:', [
                { text: 'Supports storytelling and mood without unnecessarily calling attention to itself', correct: true, why: 'Correct — good sound design usually works in service of the story, staying unobtrusive unless a specific effect is meant to be noticed.' },
                { text: 'Is as loud as possible throughout the entire production', correct: false, why: 'Excessive volume without purpose can distract from rather than support the storytelling.' },
                { text: 'Uses only live musicians and never recorded playback', correct: false, why: 'Many productions blend live and recorded sound; using only live sound is not a requirement of effective design.' },
                { text: 'Avoids all coordination with the stage manager', correct: false, why: 'Close coordination with the stage manager is essential for cues to be executed correctly during a live show.' },
              ], ['sound', 'design-intent']),
              q('Microphones', 4, 'A wireless lavalier microphone is most commonly used in musical theatre to:', [
                { text: 'Reinforce a principal performer\'s voice while allowing free movement on stage', correct: true, why: 'Correct — lavalier microphones are small, wearable, and wireless, allowing performers to move freely while still being reinforced clearly.' },
                { text: 'Play back pre-recorded sound effects', correct: false, why: 'Lavalier microphones capture live sound; they are not a playback mechanism for recorded effects.' },
                { text: 'Project lighting patterns', correct: false, why: 'Microphones are a sound element and have no function in lighting design.' },
                { text: 'Replace the need for a sound designer', correct: false, why: 'A lavalier microphone is a tool used within a sound design, not a substitute for design decisions.' },
              ], ['sound', 'microphones']),
            ],
          },
        ],
      },
      {
        code: '3.2',
        name: 'Understands scenery, properties, and technical production',
        description: 'Principles of set design and the safe, effective management of a technical production.',
        skills: [
          {
            name: 'Set Design Principles',
            slug: 'set-design-principles',
            description: 'How scenic designers translate a script and concept into a functional, evocative stage environment.',
            lesson: {
              title: 'Principles of Set Design',
              content:
                'Scenic design translates a script\'s given circumstances and the director\'s production concept into a physical environment that is both evocative and functional. Designers consider sightlines (ensuring the whole audience can see key action), traffic patterns (how actors move through and around the set without collision or awkward pacing), and scale (how large elements should be relative to the actors and the house). A ground plan (top-down view) and elevations (front-view drawings) communicate the design to the director and technical director before construction begins. Designers also balance realism against abstraction: a unit set with flexible, reconfigurable pieces might serve a play with many locations, while a highly detailed box set may suit a single-location realistic drama. Budget, technical capabilities of the venue, and the number of scene changes required all shape what is ultimately feasible to build and shift.',
              keyConcepts: ['Sightlines', 'Traffic patterns', 'Scale', 'Ground plans and elevations', 'Unit set vs. box set'],
              example:
                'A designer working on a play with twelve different locations might choose a flexible unit set with movable platforms rather than building twelve fully detailed box sets.',
            },
            questions: [
              q('Design considerations', 3, 'Ensuring that audience members in all sections of the house can see key action on stage is primarily a matter of considering:', [
                { text: 'Sightlines', correct: true, why: 'Correct — sightlines refer to what is visible from various audience positions, a core concern in scenic design and staging.' },
                { text: 'Given circumstances', correct: false, why: 'Given circumstances are facts established by the script, not a visibility concern for the audience.' },
                { text: 'Super-objective', correct: false, why: 'The super-objective is a character\'s driving goal, unrelated to audience visibility.' },
                { text: 'Cue sheet', correct: false, why: 'A cue sheet organizes sound or lighting cues, not audience sightlines.' },
              ], ['set-design', 'sightlines']),
              q('Drawings', 2, 'A top-down view of a set, showing the placement of scenic elements and furniture on the stage floor, is called a:', [
                { text: 'Ground plan', correct: true, why: 'Correct — a ground plan is a top-down (bird\'s-eye) view showing the layout of scenic elements on the stage floor.' },
                { text: 'Elevation', correct: false, why: 'An elevation is a front-view drawing showing the height and detail of scenic elements, not a top-down layout.' },
                { text: 'Gobo', correct: false, why: 'A gobo is a lighting device, unrelated to scenic drawings.' },
                { text: 'Cue sheet', correct: false, why: 'A cue sheet documents sound or lighting cue timing, not scenic layout.' },
              ], ['set-design', 'ground-plan']),
              q('Design choices', 4, 'A production with twelve different script locations and a limited budget for scene changes would most likely benefit from:', [
                { text: 'A flexible unit set with reconfigurable pieces', correct: true, why: 'Correct — a unit set with movable, flexible elements can represent many locations efficiently without requiring numerous fully detailed builds.' },
                { text: 'Twelve fully detailed, separate box sets', correct: false, why: 'Building twelve separate detailed sets would typically be far too costly and impractical for scene changes under a limited budget.' },
                { text: 'No scenery at all, regardless of the script\'s needs', correct: false, why: 'While minimalism is a valid stylistic choice in some cases, it is not automatically the correct answer without considering the script\'s needs and director\'s concept.' },
                { text: 'A single painted backdrop with no other elements', correct: false, why: 'A single backdrop alone may not adequately support the traffic patterns and functional needs of multiple distinct locations.' },
              ], ['set-design', 'unit-set']),
              q('Traffic patterns', 3, 'When designing a set, "traffic patterns" refer to:', [
                { text: 'How actors move through and around the set without collision or awkward pacing', correct: true, why: 'Correct — traffic patterns describe the practical pathways actors use to move through the scenic environment during a production.' },
                { text: 'The order in which lighting cues are called', correct: false, why: 'Lighting cue order is a separate technical element unrelated to actor movement through the set.' },
                { text: 'The historical accuracy of costume choices', correct: false, why: 'Costume accuracy is a design consideration handled by the costume designer, not traffic patterns.' },
                { text: 'The volume level of sound reinforcement', correct: false, why: 'Sound levels are a sound design concern, unrelated to actor movement through scenery.' },
              ], ['set-design', 'traffic-patterns']),
              q('Realism vs. abstraction', 3, 'A single-location realistic drama with a high level of scenic detail is most likely to use which set approach?', [
                { text: 'A box set', correct: true, why: 'Correct — a box set, with detailed walls and furnishings representing a specific realistic room, suits a single-location realistic drama well.' },
                { text: 'A unit set with abstract platforms', correct: false, why: 'A flexible unit set is more suited to plays with many locations, not a single highly detailed realistic setting.' },
                { text: 'No scenery, only lighting', correct: false, why: 'This minimalist approach would undercut the detailed realism the script calls for in this scenario.' },
                { text: 'A rotating cyclorama with projected scenery only', correct: false, why: 'While projection can supplement design, it does not on its own satisfy a call for a high level of realistic scenic detail.' },
              ], ['set-design', 'box-set']),
            ],
          },
          {
            name: 'Stage Management and Safety',
            slug: 'stage-management-and-safety',
            description: 'The organizational and safety responsibilities that keep a production running smoothly.',
            lesson: {
              title: 'Stage Management and Technical Safety',
              content:
                'The stage manager is the central organizational hub of a production, scheduling rehearsals, recording blocking, maintaining the prompt book (the master script with all blocking and cue information), and calling the show during performances. Safety is a core stage management and technical theatre responsibility: this includes maintaining clear backstage traffic paths, ensuring rigging and fly systems are inspected and operated only by trained crew, requiring proper footwear and protective equipment for scenic construction, and running fire-curtain and emergency-exit checks before every performance in venues that require them. A well-run backstage observes "quiet backstage" discipline during performances and uses clearly labeled spike marks and glow tape to help actors and crew navigate safely in low light. Ultimately, the stage manager\'s authority to halt a rehearsal or performance for a safety concern should never be overridden for the sake of schedule or convenience.',
              keyConcepts: ['Prompt book', 'Calling the show', 'Rigging/fly system safety', 'Backstage traffic and quiet discipline', 'Authority to halt for safety'],
              example:
                'Before a fly system cue involving a moving scenic piece, a stage manager confirms with the trained crew that the path is clear and that any actor near the rigging has been briefed, prioritizing safety over saving time.',
            },
            questions: [
              q('Stage management basics', 2, 'The master script containing all recorded blocking, cues, and technical notes for a production is known as the:', [
                { text: 'Prompt book', correct: true, why: 'Correct — the prompt book is the stage manager\'s master reference containing blocking, cues, and other essential production information.' },
                { text: 'Ground plan', correct: false, why: 'A ground plan is a scenic design drawing, not the stage manager\'s master script record.' },
                { text: 'Cue sheet', correct: false, why: 'A cue sheet is often one component referenced within the prompt book, but the complete master record is the prompt book itself.' },
                { text: 'Call sheet', correct: false, why: 'A call sheet or rehearsal schedule communicates timing information, not the full blocking/cue record.' },
              ], ['stage-management', 'prompt-book']),
              q('Roles', 2, 'During a live performance, the person responsible for calling lighting, sound, and scenic cues is the:', [
                { text: 'Stage manager', correct: true, why: 'Correct — the stage manager calls the show, cueing all departments during a live performance.' },
                { text: 'Scenic designer', correct: false, why: 'The scenic designer\'s primary work is completed before the run and does not include calling live cues.' },
                { text: 'Playwright', correct: false, why: 'The playwright\'s work concerns the script, not live performance calling.' },
                { text: 'House manager', correct: false, why: 'The house manager oversees audience-facing front-of-house operations, not backstage cue calling.' },
              ], ['stage-management', 'calling-the-show']),
              q('Safety', 3, 'Rigging and fly systems used to move scenic elements should be operated only by:', [
                { text: 'Trained, designated crew members', correct: true, why: 'Correct — rigging and fly systems involve significant safety risk and should only be operated by crew specifically trained on that equipment.' },
                { text: 'Any available cast member', correct: false, why: 'Untrained personnel operating rigging systems creates serious safety risks for cast and crew.' },
                { text: 'The stage manager alone, regardless of training', correct: false, why: 'Even the stage manager should not operate specialized rigging without the specific training required for that equipment.' },
                { text: 'Whoever is available fastest before a cue', correct: false, why: 'Prioritizing speed over proper training creates unacceptable safety risk.' },
              ], ['stage-management', 'rigging-safety']),
              q('Safety authority', 4, 'If a stage manager identifies a safety concern during a technical rehearsal, the appropriate response is to:', [
                { text: 'Halt the rehearsal to address the concern, even if it affects the schedule', correct: true, why: 'Correct — a stage manager\'s authority to halt for safety should never be overridden for the sake of convenience or schedule pressure.' },
                { text: 'Continue as planned to avoid falling behind schedule', correct: false, why: 'Prioritizing schedule over a genuine safety concern risks injury and is not appropriate practice.' },
                { text: 'Wait until after the performance run to mention it', correct: false, why: 'Safety concerns should be addressed immediately, not deferred until after a run that could expose people to risk.' },
                { text: 'Delegate the decision to the box office manager', correct: false, why: 'Safety authority during rehearsal and performance rests with the stage manager and technical leadership, not front-of-house staff.' },
              ], ['stage-management', 'safety-authority']),
              q('Backstage discipline', 2, 'Clearly labeled glow tape and spike marks backstage are primarily used to:', [
                { text: 'Help actors and crew navigate safely in low light', correct: true, why: 'Correct — glow tape and spike marks provide visible reference points for safe movement backstage, especially during blackouts or low-light scene changes.' },
                { text: 'Indicate which lines have been cut from the script', correct: false, why: 'Script cuts are documented in the script or prompt book, not through backstage floor markings.' },
                { text: 'Show the audience where to sit', correct: false, why: 'Backstage floor markings are for crew and cast use, not for audience seating guidance.' },
                { text: 'Replace the need for a stage manager\'s cues', correct: false, why: 'Floor markings support safe navigation but do not replace the stage manager\'s essential role in calling cues.' },
              ], ['stage-management', 'backstage-safety']),
            ],
          },
        ],
      },
    ],
  },
];

async function main() {
  console.log('Seeding TX Arts Pathway demo data...');

  const adminPasswordHash = await bcrypt.hash('DemoAdmin!2026', 12);
  const studentPasswordHash = await bcrypt.hash('DemoStudent!2026', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@txartspathway.com' },
    update: {},
    create: {
      email: 'admin@txartspathway.com',
      passwordHash: adminPasswordHash,
      firstName: 'Alex',
      lastName: 'Administrator',
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'demo.teacher@txartspathway.com' },
    update: {},
    create: {
      email: 'demo.teacher@txartspathway.com',
      passwordHash: studentPasswordHash,
      firstName: 'Jordan',
      lastName: 'Teacher',
      role: 'STUDENT',
    },
  });

  const exam = await prisma.exam.upsert({
    where: { slug: 'texes-theatre-180-demo' },
    update: {},
    create: {
      slug: 'texes-theatre-180-demo',
      name: 'TExES Theatre EC-12 (180) — Demo',
      description:
        'DEMO CONTENT — Replace with production content. Original TX Arts Pathway practice content aligned to publicly available Theatre EC-12 competencies.',
      published: true,
      isDemo: true,
    },
  });

  for (const [dIndex, domainSeed] of DOMAINS.entries()) {
    const domain = await prisma.domain.upsert({
      where: { examId_slug: { examId: exam.id, slug: domainSeed.slug } },
      update: {},
      create: {
        examId: exam.id,
        name: domainSeed.name,
        slug: domainSeed.slug,
        description: domainSeed.description,
        weight: domainSeed.weight,
        order: dIndex,
        published: true,
      },
    });

    for (const [oIndex, objectiveSeed] of domainSeed.objectives.entries()) {
      const objective = await prisma.objective.upsert({
        where: { id: `${domain.id}-obj-${oIndex}` },
        update: {},
        create: {
          id: `${domain.id}-obj-${oIndex}`,
          domainId: domain.id,
          code: objectiveSeed.code,
          name: objectiveSeed.name,
          description: objectiveSeed.description,
          order: oIndex,
          published: true,
        },
      });

      for (const [sIndex, skillSeed] of objectiveSeed.skills.entries()) {
        const skill = await prisma.skill.upsert({
          where: { objectiveId_slug: { objectiveId: objective.id, slug: skillSeed.slug } },
          update: {},
          create: {
            objectiveId: objective.id,
            name: skillSeed.name,
            slug: skillSeed.slug,
            description: skillSeed.description,
            order: sIndex,
            published: true,
          },
        });

        const existingLesson = await prisma.lesson.findFirst({ where: { skillId: skill.id } });
        if (!existingLesson) {
          await prisma.lesson.create({
            data: {
              skillId: skill.id,
              title: skillSeed.lesson.title,
              content: skillSeed.lesson.content,
              keyConcepts: skillSeed.lesson.keyConcepts,
              example: skillSeed.lesson.example,
              published: true,
              isDemo: true,
            },
          });
        }

        const existingQuestions = await prisma.question.count({ where: { skillId: skill.id } });
        if (existingQuestions === 0) {
          for (const question of skillSeed.questions) {
            await prisma.question.create({
              data: {
                skillId: skill.id,
                topic: question.topic,
                type: QuestionType.MULTIPLE_CHOICE,
                difficulty: question.difficulty,
                prompt: question.prompt,
                explanation: question.options.find((o) => o.correct)!.why + ' ' + question.options.filter((o) => !o.correct).map((o) => `${o.text} is incorrect: ${o.why}`).join(' '),
                published: true,
                isDemo: true,
                reviewStatus: 'APPROVED',
                tags: question.tags,
                createdById: admin.id,
                options: {
                  create: question.options.map((o, i) => ({
                    label: String.fromCharCode(65 + i),
                    text: o.text,
                    isCorrect: o.correct,
                    order: i,
                  })),
                },
              },
            });
          }
        }
      }
    }
  }

  // Practice exam definition spanning the whole demo exam.
  const totalQuestions = await prisma.question.count({ where: { skill: { objective: { domain: { examId: exam.id } } } } });
  await prisma.practiceExam.upsert({
    where: { id: `${exam.id}-full-practice` },
    update: {},
    create: {
      id: `${exam.id}-full-practice`,
      examId: exam.id,
      name: 'Full-Length Practice Exam — Demo',
      questionCount: Math.min(40, totalQuestions),
      timeLimitMinutes: 90,
      published: true,
    },
  });

  // Products for the commerce system.
  const productDefs = [
    { name: '30-Day Access', slug: '30-day-access', durationDays: 30, priceCents: 2900 },
    { name: '90-Day Access', slug: '90-day-access', durationDays: 90, priceCents: 5900 },
    { name: '180-Day Access', slug: '180-day-access', durationDays: 180, priceCents: 9900 },
    { name: '365-Day Access', slug: '365-day-access', durationDays: 365, priceCents: 14900 },
  ];
  for (const p of productDefs) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, description: `${p.durationDays} days of full TX Arts Pathway access.` },
    });
  }

  await prisma.coupon.upsert({
    where: { code: 'DEMO25' },
    update: {},
    create: { code: 'DEMO25', discountType: 'PERCENT', amount: 25, active: true },
  });

  console.log('Seed complete.');
  console.log('Admin login: admin@txartspathway.com / DemoAdmin!2026');
  console.log('Student login: demo.teacher@txartspathway.com / DemoStudent!2026');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
