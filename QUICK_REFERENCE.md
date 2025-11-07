# 🚀 Référence Rapide - Agent Développeur

> **Aide-mémoire** pour la méthodologie de résolution de problèmes

---

## 📋 Workflow en 10 Étapes

| # | Étape | Action Clé | Fichier |
|---|-------|------------|---------|
| 1️⃣ | **Reformulation** | Naturel → Technique | Template |
| 2️⃣ | **Contexte** | Systèmes + Logs + État | Template |
| 3️⃣ | **Fichiers** | Liste exhaustive + Dépendances | Template |
| 4️⃣ | **Hypothèses** | Min. 3 causes possibles | Template + history.md |
| 5️⃣ | **Solutions** | Min. 2 avec avantages/inconvénients | Template |
| 6️⃣ | **Choix** | Justifier + Alerter si complexe | Template |
| 7️⃣ | **Implémentation** | Code + Commentaires + Backup | Template |
| 8️⃣ | **Vérification** | Logs + Tests + Commandes | Template |
| 9️⃣ | **Documentation** | plan.md + history.md + pitfalls.md | Tous |
| 🔟 | **Bilan** | Résumé + Leçons + Archivage | Template → docs/resolutions/ |

---

## 📁 Fichiers Clés

### 🔴 À Consulter AVANT Analyse
- **`pitfalls.md`** : Pièges déjà rencontrés → Éviter de répéter
- **`history.md`** : Hypothèses déjà testées → Ne pas retester

### 🟢 À Utiliser PENDANT Résolution
- **`WORKFLOW_TEMPLATE.md`** : Copier → Remplir → Archiver
- **`AGENT_GUIDE.md`** : Guide complet de la méthodologie

### 🔵 À Mettre à Jour APRÈS Résolution
- **`plan.md`** : Ajouter résumé du problème
- **`history.md`** : Ajouter hypothèses testées
- **`pitfalls.md`** : Ajouter piège si récurrent
- **`docs/resolutions/`** : Archiver template complet

---

## ✅ Checklist Express

### Début d'Analyse
- [ ] Consulter `pitfalls.md`
- [ ] Consulter `history.md`
- [ ] Copier `WORKFLOW_TEMPLATE.md`

### Pendant Résolution
- [ ] Reformuler (naturel + technique)
- [ ] Lister fichiers impactés
- [ ] Formuler 3+ hypothèses
- [ ] Proposer 2+ solutions
- [ ] Justifier le choix
- [ ] Ajouter logs pour tests

### Après Résolution
- [ ] Mettre à jour `plan.md`
- [ ] Mettre à jour `history.md`
- [ ] Mettre à jour `pitfalls.md` (si applicable)
- [ ] Archiver dans `docs/resolutions/`
- [ ] Nettoyer fichiers temporaires

---

## 🚨 Règles d'Or

### ❌ NE JAMAIS
1. Corriger sans analyser
2. Ignorer `pitfalls.md` et `history.md`
3. Proposer une seule solution
4. Modifier sans commenter l'ancien code
5. Oublier les logs de vérification

### ✅ TOUJOURS
1. Reformuler le problème
2. Consulter les pièges connus
3. Proposer plusieurs hypothèses
4. Expliquer en français simple
5. Documenter en continu

---

## 📊 Formats Standards

### plan.md
```markdown
## Problème n°X : [Titre]
- Date : JJ/MM/AAAA
- Symptôme : [Description]
- Cause : [Explication]
- Solution : [Résumé]
- État final : [Résultat]
```

### history.md
```markdown
## [Problème]
- Hypothèses : [Liste]
- Tests : [Résultats]
- Conclusion : [Validée/Rejetée]
```

### pitfalls.md
```markdown
### [Piège]
- Piège : [Description]
- Symptôme : [Détection]
- Cause : [Raison]
- Solution : [Prévention]
```

---

## 🎯 Commandes Rapides

### Nouveau Problème
```bash
# 1. Consulter les pièges
cat pitfalls.md

# 2. Consulter l'historique
cat history.md

# 3. Copier le template
cp WORKFLOW_TEMPLATE.md probleme-en-cours.md
```

### Après Résolution
```bash
# 1. Renommer le template
mv probleme-en-cours.md docs/resolutions/probleme-XXX-[titre].md

# 2. Mettre à jour l'index
# Éditer docs/resolutions/README.md
```

---

## 💡 Astuces

### Hypothèses
- Minimum 3 hypothèses
- Vérifier `pitfalls.md` pour éviter les pistes déjà explorées
- Évaluer probabilité : Haute / Moyenne / Faible

### Solutions
- Minimum 2 solutions
- Lister avantages ET inconvénients
- Hiérarchiser par complexité et risque
- Éviter la sur-ingénierie

### Documentation
- Documenter AU FUR ET À MESURE (pas à la fin)
- Expliquer en français simple
- Ajouter logs/commentaires pour tests
- Archiver rapidement

---

## 🔗 Navigation Rapide

| Besoin | Fichier |
|--------|---------|
| Comprendre la méthodologie | `AGENT_GUIDE.md` |
| Démarrer une analyse | `WORKFLOW_TEMPLATE.md` |
| Voir l'historique | `plan.md` |
| Éviter un piège | `pitfalls.md` |
| Vérifier hypothèse | `history.md` |
| Trouver une solution | `docs/resolutions/` |
| Vue d'ensemble projet | `projet.md` |
| Guide système doc | `DOCUMENTATION_SYSTEM.md` |

---

## 📞 Communication

### Ton
- Pédagogique et structuré
- Français clair
- Technique mais expliqué

### Alertes
- ⚠️ Si correction complexe
- ⚠️ Si impact multi-systèmes
- ⚠️ Si information manquante

### Validation
- Demander si incertitude
- Proposer alternatives
- Expliquer les choix

---

## 🎯 Objectif Final

**Laisser une trace claire et exploitable** pour :
1. ✅ Comprendre ce qui s'est passé
2. ✅ Reproduire la correction
3. ✅ Éviter le même problème
4. ✅ Apprendre des patterns

---

**Mémo** : Analyse → Documentation → Archivage
