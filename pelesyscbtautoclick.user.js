// ==UserScript==
// @name         Pelesys CBT - Auto Click
// @namespace    http://tampermonkey.net/
// @sandbox      DOM
// @version      1.0
// @description  Simulate a left-click on the next button 2s after the end of a slide. The ‘p’ button is used to activate/pause the auto-click
// @match        https://www.pelesys.com/cbt/typecourses/*
// @author       Didier Moraine
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log("[Tampermonkey] Script injection démarrée.");

    // Sélecteurs
    const nextButtonSelector  = 'button.navBtn.glyphicon.glyphicon-chevron-right';
    const canvasContainerId   = 'canvasOuterContainer';

    // État
    let monitoringActive = true;
    let clickScheduled   = false;

    // Indicateur de statut (sera inséré dans #canvasOuterContainer)
    let monitorIndicator = null;

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
        }
    }, 500);

    // Écoute de la touche "p" pour activer/pause le monitoring
    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'p') {
            monitoringActive = !monitoringActive;
            console.log("[Tampermonkey] Auto Click " + (monitoringActive ? "activé" : "en pause") + " via la touche 'p'.");
            updateIndicator();
        }
    });

})();
