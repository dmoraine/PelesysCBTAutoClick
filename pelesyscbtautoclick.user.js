// ==UserScript==
// @name         Pelesys CBT - Auto Click & Text Saver
// @namespace    http://tampermonkey.net/
// @sandbox      DOM
// @version      1.2
// @description  Auto-clicks 'Next', saves slide audio text to localStorage per session, allows viewing/copying/deleting saved sessions via 't' key. 'p' toggles auto-click.
// @match        https://www.pelesys.com/cbt/typecourses/*
// @match        https://www.pelesys.com/cbt/specialtycourses/*
// @author       Didier Moraine
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log("[Tampermonkey] Script injection démarrée (Auto Click & Text Saver v1.2).");

    // Sélecteurs
    const nextButtonSelector  = 'button.navBtn.glyphicon.glyphicon-chevron-right';
    const canvasContainerId   = 'canvasOuterContainer';
    const audioTextSelector   = 'span[data-bind="html: audioText"]';

    // Constantes localStorage
    const STORAGE_PREFIX = 'pelesysText_';
    const TEXT_SEPARATOR = '\\n\\n---\\n\\n'; // Separator between texts

    // État
    let monitoringActive = true;
    let clickScheduled   = false;
    let currentSessionKey = ''; // Key for the current browser session
    let lastAddedText = ''; // To prevent rapid duplicates from interval

    // Indicateur de statut
    let monitorIndicator = null;
    // UI Gestion stockage
    let storageUI = null;

    // Génère une clé unique pour la session actuelle
    function generateSessionKey() {
        const now = new Date();
        const dateString = now.toISOString().slice(0, 10); // YYYY-MM-DD
        const timeString = now.toTimeString().slice(0, 8).replace(/:/g, '-'); // HH-MM-SS
        currentSessionKey = `${STORAGE_PREFIX}${dateString}_${timeString}`;
        console.log(`[Tampermonkey] Session key: ${currentSessionKey}`);
    }

    // Initialise la clé de session
    generateSessionKey();

    // Fonction utilitaire : vérifie si un élément est visible (basé sur offsetParent)
    function isElementVisible(el) {
        return el && el.offsetParent !== null;
    }

    // Crée l'indicateur de statut et l'insère dans #canvasOuterContainer
    function createIndicator() {
        if (!monitorIndicator) {
            monitorIndicator = document.createElement('div');
            monitorIndicator.id = 'monitorIndicator';
            monitorIndicator.textContent = `Auto Click (p): ${monitoringActive ? 'ON' : 'OFF'}`;
            Object.assign(monitorIndicator.style, {
                position: 'absolute',
                top: '55px',
                left: '5px',
                backgroundColor: 'rgba(0,0,0,0.8)',
                color: 'white',
                padding: '3px 8px',
                fontSize: '13px',
                borderRadius: '4px',
                fontFamily: 'sans-serif',
                zIndex: '9999'
            });
            const container = document.getElementById(canvasContainerId);
            if (container) {
                // S'assurer que le conteneur est positionné pour que l'indicateur en position absolute soit correctement placé
                if (getComputedStyle(container).position === 'static') {
                    container.style.position = 'relative';
                }
                container.insertBefore(monitorIndicator, container.firstChild);
            } else {
                // Fallback: insérer dans le body
                document.body.appendChild(monitorIndicator);
            }
        }
    }

    // Met à jour le texte de l'indicateur
    function updateIndicator() {
        if (monitorIndicator) {
            monitorIndicator.textContent = `Auto Click (p): ${monitoringActive ? 'ON' : 'OFF'}`;
        }
    }

    // Retire l'indicateur
    function removeIndicator() {
        if (monitorIndicator) {
            monitorIndicator.remove();
            monitorIndicator = null;
        }
    }

    // Simule un clic gauche complet sur l'élément passé en argument
    function simulateLeftClick(element) {
        console.log("[Tampermonkey] Simulation du clic gauche sur :", element);
        ["mousedown", "mouseup", "click"].forEach(evtType => {
            const evt = new MouseEvent(evtType, {
                bubbles: true,
                cancelable: true,
                view: window,
                button: 0 // bouton gauche
            });
            element.dispatchEvent(evt);
        });
    }

    // --- Nouvelle fonction pour afficher les textes collectés ---
    function displayCollectedTexts() {
        // Remove any existing display first
        const existingDisplay = document.getElementById('collectedAudioTextsDisplay');
        if (existingDisplay) {
            existingDisplay.remove();
        }

        if (collectedTexts.size === 0) return; // Ne rien afficher si vide

        const displayContainer = document.createElement('div');
        displayContainer.id = 'collectedAudioTextsDisplay';
        Object.assign(displayContainer.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            maxWidth: '600px',
            maxHeight: '70vh',
            backgroundColor: 'rgba(240, 240, 240, 0.98)',
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '20px',
            zIndex: '10000',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        });

        const title = document.createElement('h3');
        title.textContent = 'Textes Audio Collectés (Fin de Chapitre)';
        title.style.marginTop = '0';
        title.style.textAlign = 'center';
        title.style.color = '#333';
        displayContainer.appendChild(title);

        const textArea = document.createElement('textarea');
        textArea.readOnly = true;
        textArea.value = Array.from(collectedTexts).join('\n\n---\n\n'); // Séparateur clair
        Object.assign(textArea.style, {
            width: '100%',
            flexGrow: '1',
            minHeight: '200px',
            maxHeight: 'calc(70vh - 120px)', // Adjusted for padding/title/buttons
            boxSizing: 'border-box',
            fontSize: '14px',
            fontFamily: 'monospace', // Monospace for better readability maybe
            border: '1px solid #ddd',
            padding: '10px'
        });
        displayContainer.appendChild(textArea);

        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'space-around'; // Space out buttons
        buttonContainer.style.paddingTop = '10px';


        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copier le Texte';
        Object.assign(copyButton.style, {
            padding: '10px 20px',
            cursor: 'pointer',
            border: 'none',
            borderRadius: '5px',
            backgroundColor: '#4CAF50',
            color: 'white',
            fontSize: '14px'
        });
        copyButton.onclick = () => {
            textArea.select();
             // Attempt to use navigator.clipboard first (more modern)
             if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(textArea.value).then(() => {
                    copyButton.textContent = 'Copié !';
                    copyButton.style.backgroundColor = '#367c39';
                    setTimeout(() => {
                        copyButton.textContent = 'Copier le Texte';
                        copyButton.style.backgroundColor = '#4CAF50';
                     }, 2000);
                }).catch(err => {
                    console.error("[Tampermonkey] Erreur de copie (navigator):", err);
                    // Fallback or alert user
                    alert("Erreur de copie. Vous pouvez sélectionner et copier manuellement (Ctrl+C).");
                });
             } else {
                 // Fallback for older browsers or insecure contexts
                 try {
                     document.execCommand('copy');
                     copyButton.textContent = 'Copié !';
                     copyButton.style.backgroundColor = '#367c39';
                     setTimeout(() => {
                         copyButton.textContent = 'Copier le Texte';
                         copyButton.style.backgroundColor = '#4CAF50';
                      }, 2000);
                 } catch (err) {
                    console.error("[Tampermonkey] Erreur de copie (execCommand):", err);
                    alert("Erreur de copie. Vous pouvez sélectionner et copier manuellement (Ctrl+C).");
                 }
             }
        };
        buttonContainer.appendChild(copyButton);


        const closeButton = document.createElement('button');
        closeButton.textContent = 'Fermer';
        Object.assign(closeButton.style, {
            padding: '10px 20px',
            cursor: 'pointer',
            border: 'none',
            borderRadius: '5px',
            backgroundColor: '#f44336',
            color: 'white',
            fontSize: '14px'
        });
        closeButton.onclick = () => {
            displayContainer.remove();
        };
        buttonContainer.appendChild(closeButton);


        displayContainer.appendChild(buttonContainer);

        document.body.appendChild(displayContainer);
        console.log("[Tampermonkey] Textes affichés.");
    }

    // --- UI de gestion du stockage ---
    function createStorageManagementUI() {
        // Empêcher la création multiple
        if (storageUI) {
            storageUI.remove();
            storageUI = null;
            return; // Si l'UI existe, la touche 't' la ferme
        }

        storageUI = document.createElement('div');
        storageUI.id = 'pelesysStorageManager';
        Object.assign(storageUI.style, {
            position: 'fixed',
            top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '90%', maxWidth: '700px', maxHeight: '80vh',
            backgroundColor: 'rgba(250, 250, 250, 0.98)', border: '1px solid #aaa',
            borderRadius: '8px', padding: '20px', zIndex: '10001',
            boxShadow: '0 5px 20px rgba(0,0,0,0.3)', display: 'flex',
            flexDirection: 'column', gap: '15px', fontFamily: 'sans-serif'
        });

        const title = document.createElement('h3');
        title.textContent = 'Gestion des Textes Sauvegardés';
        title.style.marginTop = '0'; title.style.textAlign = 'center'; title.style.color = '#333';
        storageUI.appendChild(title);

        const sessionSelect = document.createElement('select');
        sessionSelect.style.padding = '8px'; sessionSelect.style.fontSize = '14px';

        const textArea = document.createElement('textarea');
        textArea.readOnly = true;
        Object.assign(textArea.style, {
            width: '100%', flexGrow: '1', minHeight: '200px', boxSizing: 'border-box',
            fontSize: '14px', fontFamily: 'monospace', border: '1px solid #ccc', padding: '10px'
        });

        // Populate dropdown
        const keys = Object.keys(localStorage)
            .filter(key => key.startsWith(STORAGE_PREFIX))
            .sort((a, b) => b.localeCompare(a)); // Sort descending (newest first)

        if (keys.length === 0) {
            const noDataOption = document.createElement('option');
            noDataOption.textContent = "Aucune session sauvegardée";
            noDataOption.disabled = true;
            sessionSelect.appendChild(noDataOption);
            textArea.value = "Aucun texte à afficher.";
        } else {
            keys.forEach(key => {
                const option = document.createElement('option');
                // Format key for display: "YYYY-MM-DD HH:MM:SS"
                try {
                   const parts = key.substring(STORAGE_PREFIX.length).split('_');
                   const datePart = parts[0];
                   const timePart = parts[1].replace(/-/g, ':');
                   option.textContent = `${datePart} ${timePart}`;
                } catch(e) {
                   option.textContent = key; // Fallback display
                }
                option.value = key;
                sessionSelect.appendChild(option);
            });

            // Load text for the initially selected (newest) session
            textArea.value = localStorage.getItem(keys[0]) || "Erreur: clé vide ?";
        }

        sessionSelect.onchange = () => {
            const selectedKey = sessionSelect.value;
            textArea.value = localStorage.getItem(selectedKey) || "";
        };
        storageUI.appendChild(sessionSelect);
        storageUI.appendChild(textArea);

        // Button container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'space-between';
        buttonContainer.style.gap = '10px';

        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copier le Texte';
        copyButton.style.padding = '10px 15px'; copyButton.style.cursor = 'pointer';
        copyButton.style.backgroundColor = '#4CAF50'; copyButton.style.color = 'white';
        copyButton.style.border = 'none'; copyButton.style.borderRadius = '5px';
        copyButton.onclick = () => {
            if (!textArea.value) return;
            navigator.clipboard.writeText(textArea.value).then(() => {
                copyButton.textContent = 'Copié !';
                copyButton.style.backgroundColor = '#367c39';
                setTimeout(() => {
                    copyButton.textContent = 'Copier le Texte';
                    copyButton.style.backgroundColor = '#4CAF50';
                }, 2000);
            }).catch(err => {
                console.error("[Tampermonkey] Erreur de copie:", err);
                alert("Erreur de copie. Copiez manuellement (Ctrl+C).");
            });
        };
        buttonContainer.appendChild(copyButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Supprimer Session';
        deleteButton.style.padding = '10px 15px'; deleteButton.style.cursor = 'pointer';
        deleteButton.style.backgroundColor = '#f44336'; deleteButton.style.color = 'white';
        deleteButton.style.border = 'none'; deleteButton.style.borderRadius = '5px';
        deleteButton.onclick = () => {
            const selectedKey = sessionSelect.value;
            const selectedOption = sessionSelect.options[sessionSelect.selectedIndex];
            if (selectedKey && selectedOption && !selectedOption.disabled) {
                 if (confirm(`Voulez-vous vraiment supprimer la session :\\n${selectedOption.textContent} ?`)) {
                    localStorage.removeItem(selectedKey);
                    sessionSelect.remove(sessionSelect.selectedIndex);
                    textArea.value = "";
                    // Select the next available option if possible
                    if (sessionSelect.options.length > 0 && sessionSelect.selectedIndex >= 0) {
                       textArea.value = localStorage.getItem(sessionSelect.value) || "";
                    } else if (sessionSelect.options.length === 0) {
                       const noDataOption = document.createElement('option');
                       noDataOption.textContent = "Aucune session sauvegardée";
                       noDataOption.disabled = true;
                       sessionSelect.appendChild(noDataOption);
                    }
                    console.log(`[Tampermonkey] Session supprimée: ${selectedKey}`);
                 }
            } else {
                alert("Veuillez sélectionner une session à supprimer.");
            }
        };
        buttonContainer.appendChild(deleteButton);

        const closeButton = document.createElement('button');
        closeButton.textContent = 'Fermer';
        closeButton.style.padding = '10px 15px'; closeButton.style.cursor = 'pointer';
        closeButton.style.backgroundColor = '#aaa'; closeButton.style.color = 'white';
        closeButton.style.border = 'none'; closeButton.style.borderRadius = '5px';
        closeButton.onclick = () => {
            if (storageUI) storageUI.remove();
            storageUI = null;
        };
        buttonContainer.appendChild(closeButton);

        storageUI.appendChild(buttonContainer);
        document.body.appendChild(storageUI);
    }

    // Boucle de vérification toutes les 500 ms
    setInterval(() => {
        // Récupérer le bouton next (chevron droit)
        const nextButton = document.querySelector(nextButtonSelector);

        // Si le bouton next n'existe pas, retirer l'indicateur et annuler
        if (!nextButton) {
            removeIndicator();
            clickScheduled = false;
            return;
        } else {
            // S'assurer de la présence de l'indicateur dans le conteneur principal
            createIndicator();
        }

        // Si le monitoring est désactivé, annuler toute programmation et mettre à jour l'indicateur
        if (!monitoringActive) {
            clickScheduled = false;
            updateIndicator();
            return;
        }
        updateIndicator();

        // --- Sauvegarder le texte audio dans localStorage ---
        if (monitoringActive) {
            const audioTextElement = document.querySelector(audioTextSelector);
            if (audioTextElement) {
                const newText = audioTextElement.textContent.trim();
                // Ajouter seulement si le texte est non vide ET différent du dernier texte ajouté
                if (newText && newText !== lastAddedText) {
                    const currentStoredText = localStorage.getItem(currentSessionKey) || "";
                    // Vérification simple pour éviter d'ajouter exactement le même texte consécutivement
                    // (Ne prévient pas les doublons si la page recharge ou si le script redémarre)
                    if (!currentStoredText.endsWith(newText)) { // Basic check
                         const textToStore = currentStoredText ? currentStoredText + TEXT_SEPARATOR + newText : newText;
                         localStorage.setItem(currentSessionKey, textToStore);
                         console.log(`[Tampermonkey] Texte ajouté à ${currentSessionKey}:`, newText);
                         lastAddedText = newText; // Mettre à jour le dernier texte ajouté
                    }
                } else if (!newText) {
                    // Si le texte disparaît, réinitialiser lastAddedText pour permettre l'ajout suivant
                    lastAddedText = '';
                }
            } else {
                 // Si l'élément disparaît, réinitialiser aussi
                 lastAddedText = '';
            }
        }
        // ---------------------------------------------

        // Déclenchement : si le bouton next possède la classe "nextCompleted" et qu'aucun clic n'est déjà programmé
        if (nextButton.classList.contains('nextCompleted') && !clickScheduled) {
            console.log("[Tampermonkey] nextCompleted détecté sur le bouton next => auto-click dans 2s...");
            clickScheduled = true;
            setTimeout(() => {
                const currentNext = document.querySelector(nextButtonSelector);
                if (monitoringActive && currentNext && currentNext.classList.contains('nextCompleted')) {
                    simulateLeftClick(currentNext);
                } else {
                    console.log("[Tampermonkey] Conditions non remplies au moment de l'auto-click.");
                }
                clickScheduled = false;
            }, 2000);
        } else if (!nextButton.classList.contains('nextCompleted')) {
            // Si la classe nextCompleted disparaît, réinitialiser le flag
            clickScheduled = false;
            // Réinitialiser lastAddedText pour la prochaine slide/section
            lastAddedText = '';
        }
    }, 500);

    // Écoute de la touche "p" pour activer/pause le monitoring
    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'p') {
            monitoringActive = !monitoringActive;
            console.log("[Tampermonkey] Auto Click " + (monitoringActive ? "activé" : "en pause") + " via la touche 'p'.");
            updateIndicator();
            // Si on désactive, on ne veut pas ajouter de texte juste après
             if (!monitoringActive) {
                 lastAddedText = '';
             }
        }
         // Écoute de la touche "t" pour afficher/masquer l'UI de gestion
         else if (e.key.toLowerCase() === 't') {
             console.log("[Tampermonkey] Touche 't' pressée, affichage/masquage UI stockage.");
             createStorageManagementUI();
         }
    });

})();
