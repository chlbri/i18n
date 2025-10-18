# Prompt pour automatiser le bump du CHANGELOG

## 🎯 Objectif

Automatiser la mise à jour du CHANGELOG.md lors de chaque nouvelle version
en suivant un format cohérent et standardisé.

## 📋 Template de prompt à utiliser

```
#codebase Bump version inside CHANGELOG.md according to the version inside package.json.

Commit message: "[INSÉRER LE MESSAGE DE COMMIT ICI]"
```

## ⚙️ Instructions détaillées

Le système doit automatiquement :

1. **Lire la version** actuelle dans `package.json`
2. **Extraire la date** du jour au format `YYYY/MM/DD` (ex: 2025/10/18)
3. **Analyser le message de commit** pour :
   - Détecter le type de commit (feat, fix, docs, etc.)
   - Identifier les BREAKING CHANGES
   - Extraire les points principaux
4. **Traduire en français** tout en préservant :
   - Les termes techniques en anglais
   - Les noms de fonctions/classes entre backticks
   - La clarté et la concision
5. **Insérer la nouvelle entrée** au début du CHANGELOG.md
6. **Formater selon le template** standard du projet

## 📝 Exemple d'utilisation

### Input

```
#codebase Bump version inside CHANGELOG.md according to the version inside package.json.

Commit message: "feat: Add nested translation support with innerArgs

- Enhanced getTranslation function to handle nested structures
- Introduced innerArgs parameter for better type inference
- Updated test fixtures to use dt() function
- Improved TypeScript type safety

[BREAKING CHANGE]"
```

### Output attendu

```markdown
<details>
<summary><h3> <strong>Version [0.5.0]</strong> &mdash; <i>2025/10/18<i/></h3></summary>

- BREAKING CHANGES
- Ajout du support des traductions imbriquées avec `innerArgs`
- Amélioration de la fonction `getTranslation` pour gérer les structures
  imbriquées
- Introduction du paramètre `innerArgs` pour une meilleure inférence des
  types
- Mise à jour des fixtures de test pour utiliser la fonction `dt()`
- Amélioration de la sécurité des types TypeScript
- 🧪 **100%** _coverage_

</details>
```

## 🎨 Format de sortie

### Structure HTML

```markdown
<details>
<summary><h3> <strong>Version [X.Y.Z]</strong> &mdash; <i>YYYY/MM/DD<i/></h3></summary>

[CONTENU]

</details>
```

### Contenu

- **Première ligne** : `- BREAKING CHANGES` (si applicable, en gras ou
  normal)
- **Corps** : Liste à puces des changements traduits en français
- **Dernière ligne** : `- 🧪 **100%** _coverage_`

## 🌍 Règles de traduction

### À traduire en français

- Les descriptions générales
- Les actions (ajout, suppression, modification, etc.)
- Les explications techniques

### À garder en anglais

- Noms de fonctions : `getTranslation`, `dt`, etc.
- Noms de classes : `CustomMessage`, `Translate_F`, etc.
- Noms de variables : `innerArgs`, `config`, etc.
- Noms de fichiers : `package.json`, `vitest.config.ts`, etc.
- Termes techniques spécifiques : type safety, fixtures, etc.

### Formatage spécial

- Encadrer avec des backticks : `functionName`, `ClassName`
- Utiliser des émojis pertinents occasionnellement
- Découper les lignes longues (max ~75 caractères par ligne)

## 📦 Règles de versioning sémantique

| Type de commit      | Version      | Description                      |
| ------------------- | ------------ | -------------------------------- |
| `feat` + [BREAKING] | Majeure (X)  | Changements non rétrocompatibles |
| `feat`              | Mineure (Y)  | Nouvelles fonctionnalités        |
| `fix`, `hot-fix`    | Patch (Z)    | Corrections de bugs              |
| `docs`              | Patch (Z)    | Documentation uniquement         |
| `test`              | Patch (Z)    | Tests uniquement                 |
| `refactor`          | Mineure (Y)  | Refactorisation du code          |
| `perf`              | Patch (Z)    | Améliorations de performance     |
| `style`, `build`    | Aucune       | Pas de publication               |
| `chore`             | Selon impact | Tâches de maintenance            |

## 🔍 Détection des BREAKING CHANGES

Le marqueur BREAKING CHANGES doit être ajouté si :

1. Le message contient `[BREAKING CHANGE]` ou `BREAKING CHANGE:`
2. Le type de commit est précédé de `!` (ex: `feat!:`)
3. Le corps du commit mentionne explicitement une rupture de compatibilité

## ✅ Checklist de validation

Avant de finaliser, vérifier :

- [ ] La version dans le CHANGELOG correspond à celle du package.json
- [ ] La date est au format correct (YYYY/MM/DD)
- [ ] Les BREAKING CHANGES sont marqués si présents
- [ ] Tous les points sont traduits en français
- [ ] Les termes techniques gardent leur nom original entre backticks
- [ ] La ligne de coverage est présente
- [ ] Le format HTML est respecté (balises ouvertes/fermées)
- [ ] Les lignes longues sont découpées proprement

## 💡 Exemples de transformation

### Exemple 1 : Feature simple

**Input** : `feat: Add support for custom formatters`

**Output** :

```markdown
- Ajout du support des formateurs personnalisés
```

### Exemple 2 : Fix avec détails

**Input** : `fix: Correct type inference in Translate_F for nested keys`

**Output** :

```markdown
- Correction de l'inférence de type dans `Translate_F` pour les clés
  imbriquées
```

### Exemple 3 : Refactor complexe

**Input** :

```
refactor: Simplify defineTranslation implementation

- Removed redundant type checks
- Improved parameter handling
- Added better error messages
```

**Output** :

```markdown
- Refactorisation de defineTranslation :
  - Suppression des vérifications de type redondantes
  - Amélioration de la gestion des paramètres
  - Ajout de meilleurs messages d'erreur
```

## 🚀 Utilisation avancée

### Avec sous-points

Pour des changements complexes, utiliser des sous-listes :

```markdown
- Amélioration majeure de `Translate_F` :
  - Ajout d'une troisième surcharge pour les clés imbriquées
  - Support des paramètres optionnels via `innerArgs`
  - Meilleure inférence TypeScript pour les types conditionnels
```

### Avec références

Mentionner les issues/PRs si pertinent :

```markdown
- Correction du bug 123 dans la gestion des pluriels
- Implémentation de la feature demandée dans 456
```

## 📚 Ressources

- https://www.conventionalcommits.org/
- https://keepachangelog.com/
- https://semver.org/

---

**Note** : Ce prompt doit être utilisé systématiquement après chaque
publication de version pour maintenir un historique cohérent et
professionnel.

<br/>

## NB:

Add tag "br" beteween versions in CHANGELOG.md

**VERY IMPORTANT** _Always in english_
