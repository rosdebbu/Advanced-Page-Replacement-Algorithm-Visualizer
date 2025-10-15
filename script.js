document.addEventListener('DOMContentLoaded', () => {
    // --- Element References ---
    const pagesInput = document.getElementById('pages');
    const frameCountInput = document.getElementById('frames');
    const fifoBtn = document.getElementById('fifoBtn');
    const lruBtn = document.getElementById('lruBtn');
    const optimalBtn = document.getElementById('optimalBtn');
    const randomBtn = document.getElementById('randomBtn');
    const resetBtn = document.getElementById('resetBtn');
    const compareBtn = document.getElementById('compareBtn');
    const beladyBtn = document.getElementById('beladyBtn');
    const speedSlider = document.getElementById('speed');

    const frameContainer = document.getElementById('frameContainer');
    const logContainer = document.getElementById('log');
    const currentPageEl = document.getElementById('currentPage');
    const hitsEl = document.getElementById('hits');
    const faultsEl = document.getElementById('faults');
    const comparisonResultEl = document.getElementById('comparisonResult');
    const beladyChartCanvas = document.getElementById('beladyChart');
    const timelineContainerEl = document.getElementById('timelineContainer');

    let isSimulating = false;
    let beladyChartInstance = null;

    // --- Event Listeners ---
    fifoBtn.addEventListener('click', () => runAnimatedSimulation('FIFO'));
    lruBtn.addEventListener('click', () => runAnimatedSimulation('LRU'));
    optimalBtn.addEventListener('click', () => runAnimatedSimulation('Optimal'));
    compareBtn.addEventListener('click', compareAll);
    beladyBtn.addEventListener('click', analyzeBelady);
    resetBtn.addEventListener('click', resetUI);
    randomBtn.addEventListener('click', generateRandomString);

    // --- Core Simulation Logic (No UI) ---
    function runSimulationLogic(type, pages, frameCount) {
        let frames = [];
        let hits = 0;
        let faults = 0;
        let fifoPointer = 0;
        const timelineSteps = [];

        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            let hit = frames.includes(page);
            let event = '';

            if (hit) {
                hits++;
                event = 'hit';
                if (type === 'LRU') {
                    const index = frames.indexOf(page);
                    frames.splice(index, 1);
                    frames.push(page);
                }
            } else {
                faults++;
                event = 'fault';
                if (frames.length < frameCount) {
                    frames.push(page);
                } else {
                    if (type === 'FIFO') {
                        frames[fifoPointer] = page;
                        fifoPointer = (fifoPointer + 1) % frameCount;
                    } else if (type === 'LRU') {
                        frames.shift();
                        frames.push(page);
                    } else if (type === 'Optimal') {
                        const future = pages.slice(i + 1);
                        let victimIndex = -1;
                        let farthest = -1;

                        frames.forEach((f, idx) => {
                            const futureIndex = future.indexOf(f);
                            if (futureIndex === -1) {
                                victimIndex = idx;
                                return;
                            }
                            if (futureIndex > farthest) {
                                farthest = futureIndex;
                                victimIndex = idx;
                            }
                        });
                        if (victimIndex !== -1) {
                            frames[victimIndex] = page;
                        } else {
                             frames[0] = page; // fallback
                        }
                    }
                }
            }
            // Record state for timeline
            const stepState = {
                page: page,
                frames: [...frames],
                event: event
            };
            timelineSteps.push(stepState);
        }
        return { hits, faults, timelineSteps };
    }

    // --- Animated Simulation (With UI) ---
    async function runAnimatedSimulation(type) {
        if (isSimulating) return;

        const { pages, frameCount } = getInputs();
        if (!pages) return;

        isSimulating = true;
        toggleControls(false);
        resetUI(false);

        const simulationResult = runSimulationLogic(type, pages, frameCount);
        const timelineSteps = simulationResult.timelineSteps;

        logMessage(`--- Starting ${type} Simulation ---`, 'info');
        await sleep();

        let currentHits = 0;
        let currentFaults = 0;

        for (let i = 0; i < timelineSteps.length; i++) {
            const step = timelineSteps[i];
            currentPageEl.textContent = step.page;
            
            if (step.event === 'hit') {
                currentHits++;
                logMessage(`\nStep ${i+1}: Page ${step.page} -> Hit`, 'hit');
            } else {
                currentFaults++;
                logMessage(`\nStep ${i+1}: Page ${step.page} -> Fault`, 'fault');
            }

            hitsEl.textContent = currentHits;
            faultsEl.textContent = currentFaults;
            updateFramesUI(step.frames, step.page, step.event === 'hit');
            await sleep();
        }

        logMessage(`\n--- Simulation Complete ---`, 'info');
        logMessage(`Total Hits: ${currentHits}, Total Faults: ${currentFaults}`);
        
        generateTimeline(pages, timelineSteps, frameCount);
        currentPageEl.textContent = 'Done';
        toggleControls(true);
        isSimulating = false;
    }

    // --- New Analysis Functions ---
    function compareAll() {
        const { pages, frameCount } = getInputs();
        if (!pages) return;

        logMessage("\n--- Running Full Comparison ---", 'info');

        const results = [
            { name: 'FIFO', ...runSimulationLogic('FIFO', pages, frameCount) },
            { name: 'LRU', ...runSimulationLogic('LRU', pages, frameCount) },
            { name: 'Optimal', ...runSimulationLogic('Optimal', pages, frameCount) },
        ];

        let best = results.reduce((prev, current) => (prev.faults < current.faults) ? prev : current);

        let tableHTML = `
            <table>
                <tr><th>Algorithm</th><th>Page Faults</th><th>Hits</th><th>Hit Ratio</th></tr>
        `;
        results.forEach(res => {
            const hitRatio = (res.hits / pages.length * 100).toFixed(2);
            const isBest = res.name === best.name ? 'class="best"' : '';
            tableHTML += `
                <tr ${isBest}>
                    <td>${res.name}</td>
                    <td>${res.faults}</td>
                    <td>${res.hits}</td>
                    <td>${hitRatio}%</td>
                </tr>`;
        });
        tableHTML += '</table>';
        comparisonResultEl.innerHTML = tableHTML;
    }

    function analyzeBelady() {
        const { pages } = getInputs(false); // No frame count needed
        if (!pages) return;

        logMessage("\n--- Analyzing Belady's Anomaly for FIFO ---", 'info');
        const maxFrames = Math.max(10, new Set(pages).size + 2);
        const labels = [];
        const data = [];

        for (let i = 1; i <= maxFrames; i++) {
            const result = runSimulationLogic('FIFO', pages, i);
            labels.push(i);
            data.push(result.faults);
        }

        if (beladyChartInstance) {
            beladyChartInstance.destroy();
        }

        beladyChartInstance = new Chart(beladyChartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Page Faults',
                    data: data,
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.5)',
                    tension: 0.1,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { display: true, text: "FIFO: Page Faults vs. Number of Frames" }
                },
                scales: {
                    x: { title: { display: true, text: 'Number of Frames' } },
                    y: { title: { display: true, text: 'Total Page Faults' } }
                }
            }
        });
    }
    
    function generateTimeline(pages, timelineSteps, frameCount) {
        let tableHTML = `<table class="timeline-table"><thead><tr><th>Frame #</th>`;
        pages.forEach(p => tableHTML += `<th>${p}</th>`);
        tableHTML += `</tr></thead><tbody>`;

        for (let i = 0; i < frameCount; i++) {
            tableHTML += `<tr><td class="header">Frame ${i}</td>`;
            timelineSteps.forEach(step => {
                const pageInFrame = step.frames[i];
                let cellClass = '';
                if (pageInFrame !== undefined) {
                    if (step.page === pageInFrame && step.event === 'hit') {
                        cellClass = 'hit';
                    } else if (step.page === pageIn-Frame && step.event === 'fault') {
                        cellClass = 'fault';
                    } else {
                        cellClass = 'stale';
                    }
                    tableHTML += `<td class="${cellClass}">${pageInFrame}</td>`;
                } else {
                    tableHTML += `<td>-</td>`;
                }
            });
            tableHTML += `</tr>`;
        }
        tableHTML += `</tbody></table>`;
        timelineContainerEl.innerHTML = tableHTML;
    }


    // --- UI and Helper Functions ---
    function getInputs(requireFrameCount = true) {
        const pagesStr = pagesInput.value;
        const frameCount = parseInt(frameCountInput.value);

        if (requireFrameCount && (isNaN(frameCount) || frameCount <= 0)) {
             logMessage('Error: A positive number of frames is required for this action.', 'error');
             return {};
        }

        if (!pagesStr) {
            logMessage('Error: Please enter a valid page reference string.', 'error');
            return {};
        }

        const pages = pagesStr.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
        if (pages.length === 0) {
            logMessage('Error: The page reference string is invalid.', 'error');
            return {};
        }
        return { pages, frameCount };
    }

    function updateFramesUI(currentFrames, currentPage, isHit) {
        frameContainer.innerHTML = '';
        currentFrames.forEach(f => {
            const div = document.createElement('div');
            div.classList.add('frame');
            div.innerText = f;
            if (f === currentPage) {
                div.classList.add(isHit ? 'hit' : 'fault');
            }
            frameContainer.appendChild(div);
        });
    }
    
    function logMessage(message, type = 'default') {
        const entry = document.createElement('div');
        entry.textContent = message;
        if (type === 'hit') entry.style.color = 'var(--green)';
        if (type === 'fault') entry.style.color = 'var(--red)';
        if (type === 'info') entry.style.color = 'var(--primary-light)';
        if (type === 'error') entry.style.color = 'var(--yellow)';
        logContainer.appendChild(entry);
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    function toggleControls(enable) {
        const buttons = document.querySelectorAll('button');
        buttons.forEach(btn => btn.disabled = !enable);
        pagesInput.disabled = !enable;
        frameCountInput.disabled = !enable;
    }

    function resetUI(clearInputs = true) {
        if (clearInputs) {
            pagesInput.value = '';
            frameCountInput.value = '';
        }
        frameContainer.innerHTML = '';
        logContainer.innerHTML = 'Welcome! Enter data, then select a simulation or analysis option.';
        hitsEl.textContent = '0';
        faultsEl.textContent = '0';
        currentPageEl.textContent = '-';
        comparisonResultEl.innerHTML = '';
        timelineContainerEl.innerHTML = 'Select a simulation to generate its timeline view here.';
        if (beladyChartInstance) {
            beladyChartInstance.destroy();
            beladyChartInstance = null;
        }
    }
    
    function generateRandomString() {
        const length = 20;
        const pageRange = 10;
        const randomPages = Array.from({ length }, () => Math.floor(Math.random() * pageRange));
        pagesInput.value = randomPages.join(',');
        frameCountInput.value = Math.floor(Math.random() * 3) + 3;
    }

    function sleep() {
        const ms = 1550 - speedSlider.value;
        return new Promise(resolve => setTimeout(resolve, ms));
    }
});
