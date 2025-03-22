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
    const pauseButtonSelector = 'button.navBtn.glyphicon.glyphicon-pause';
    const nextButtonSelector  = 'button.navBtn.glyphicon.glyphicon-chevron-right';

    // État du monitoring et du clic en attente
    let monitoringActive = true;
    let clickScheduled   = false;

    // Une variable pour stocker l'indicateur (null tant qu'on ne l'a pas créé)
    let monitorIndicator = null;

    // Met à jour le texte si l'indicateur existe
    function updateIndicator() {
        if (monitorIndicator) {
            monitorIndicator.textContent = `Auto Click (p): ${monitoringActive ? 'ON' : 'OFF'}`;
        }
    }

    // Fonction pour créer l'indicateur (si nécessaire)
    function createIndicator() {
        if (!monitorIndicator) {
            monitorIndicator = document.createElement('div');
            monitorIndicator.id = 'monitorIndicator';
            monitorIndicator.textContent = `Auto Click (p): ${monitoringActive ? 'ON' : 'OFF'}`;
            Object.assign(monitorIndicator.style, {
                position: 'fixed',
                top: '10px',
                left: '10px',
                backgroundColor: 'rgba(0,0,0,0.8)',
                color: 'white',
                padding: '5px 10px',
                zIndex: '999999',
                fontSize: '14px',
                borderRadius: '4px',
                fontFamily: 'sans-serif'
            });
            document.body.appendChild(monitorIndicator);
        }
    }

    // Fonction pour retirer l'indicateur (si présent)
    function removeIndicator() {
        if (monitorIndicator) {
            monitorIndicator.remove();
            monitorIndicator = null;
        }
    }

    // Simule un clic gauche
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
        // Récupérer le bouton pause et next
        const pauseButton = document.querySelector(pauseButtonSelector);
        const nextButton  = document.querySelector(nextButtonSelector);

        // 1) S'il n'y a pas de bouton next, on enlève l'indicateur et on arrête
        if (!nextButton) {
            removeIndicator();
            clickScheduled = false;
            return;
        }

        // 2) S'il y a un bouton next, on s'assure d'avoir un indicateur
        if (!monitorIndicator) {
            createIndicator();
        }

        // 3) Si le monitoring est OFF, on réinitialise juste le flag
        if (!monitoringActive) {
            clickScheduled = false;
            updateIndicator();
            return;
        }
        updateIndicator();

        // 4) Vérifier si on a un bouton pause
        if (!pauseButton) {
            console.log("[Tampermonkey] Bouton pause introuvable.");
            clickScheduled = false;
            return;
        }

        // Condition de déclenchement : pauseButton disabled et nextButton enabled
        if (pauseButton.disabled && !nextButton.disabled && !clickScheduled) {
            console.log("[Tampermonkey] Bouton pause disabled, next enabled => auto-click dans 2s...");
            clickScheduled = true;
            setTimeout(() => {
                // Re-vérification avant de cliquer
                const currentPause = document.querySelector(pauseButtonSelector);
                const currentNext  = document.querySelector(nextButtonSelector);
                if (
                    monitoringActive &&
                    currentPause && currentPause.disabled &&
                    currentNext  && !currentNext.disabled
                ) {
                    simulateLeftClick(currentNext);
                } else {
                    console.log("[Tampermonkey] Conditions non remplies au moment du clic.");
                }
                clickScheduled = false;
            }, 2000);
        } else if (!pauseButton.disabled) {
            // Si le bouton pause redevient enabled, on annule tout
            clickScheduled = false;
        }
    }, 500);

    // Touche "p" pour activer/pause le monitoring
    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'p') {
            monitoringActive = !monitoringActive;
            console.log("[Tampermonkey] Auto Click " + (monitoringActive ? "activé" : "en pause") + " via la touche 'p'.");
            updateIndicator();
        }
    });

})();
