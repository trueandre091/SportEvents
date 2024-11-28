function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function createSquaresGrid() {
    const container = document.getElementById('square-container');
    const containerWidth = container.offsetWidth;
    const gap = 10;
    
    let baseSize;
    if (containerWidth <= 480) {
        baseSize = 60;
    } else if (containerWidth <= 768) {
        baseSize = 80;
    } else if (containerWidth <= 1024) {
        baseSize = 100;
    } else {
        const aspectRatio = window.innerWidth / window.innerHeight;
        if (aspectRatio > 1.3) {
            baseSize = 100;
        } else {
            baseSize = Math.min(120, Math.floor(containerWidth / 12));
        }
    }
    
    const unitsPerRow = Math.floor(containerWidth / (baseSize + gap));
    
    container.style.opacity = '0';
    
    setTimeout(() => {
        container.innerHTML = '';
        container.style.gridTemplateColumns = `repeat(${unitsPerRow}, 1fr)`;
        container.style.gap = `${gap}px`;
        
        const colors = {
            darkGray: '#0f0f0f',
            white: '#ffffff',
            orange: '#f79423',
            blue: '#307ef2'
        };
        
        // Создаем две строки
        for (let row = 0; row < 2; row++) {
            let remainingUnits = unitsPerRow;
            
            while (remainingUnits > 0) {
                const isDouble = Math.random() < 0.3 && remainingUnits >= 2;
                const square = document.createElement('button');
                square.className = 'rounded-square';
                square.style.height = `${baseSize}px`;
                
                if (isDouble && remainingUnits >= 2) {
                    square.classList.add('double-square');
                    remainingUnits -= 2;
                } else {
                    remainingUnits -= 1;
                }
                
                const colorValues = Object.values(colors);
                square.style.backgroundColor = colorValues[Math.floor(Math.random() * colorValues.length)];
                container.appendChild(square);
            }
        }
        
        addDatesToSquares();
        
        requestAnimationFrame(() => {
            container.style.opacity = '1';
        });
    }, 200);
}

const debouncedCreateSquares = debounce(createSquaresGrid, 400);

window.addEventListener('load', createSquaresGrid);
window.addEventListener('resize', debouncedCreateSquares);