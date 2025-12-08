const container = document.getElementById("container");
const newArrayBtn = document.getElementById("new-array-btn");
const bubbleSortBtn = document.getElementById("bubble-sort-btn");
const mergeSortBtn = document.getElementById("merge-sort-btn");
const quickSortBtn = document.getElementById("quick-sort-btn");
const speedSlider = document.getElementById("speed");
const sizeSlider = document.getElementById("size");

let isSorting = false;

// Helper function to pause execution for animation
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Get delay based on speed slider (inverted: higher value = faster)
function getDelay() {
    return 101 - speedSlider.value;
}

// Generate random array and create bars
function generateArray(size = parseInt(sizeSlider.value)) {
    if (isSorting) return;

    container.innerHTML = "";
    const barWidth = Math.max(4, Math.floor(800 / size) - 2);

    for (let i = 0; i < size; i++) {
        const value = Math.floor(Math.random() * 350) + 10;
        const bar = document.createElement("div");
        bar.classList.add("bar");
        bar.style.height = `${value}px`;
        bar.style.width = `${barWidth}px`;
        container.appendChild(bar);
    }
}

// Disable/enable buttons during sorting
function setButtonsState(disabled) {
    isSorting = disabled;
    newArrayBtn.disabled = disabled;
    bubbleSortBtn.disabled = disabled;
    mergeSortBtn.disabled = disabled;
    quickSortBtn.disabled = disabled;
    sizeSlider.disabled = disabled;
}

// Bubble Sort
async function bubbleSort() {
    setButtonsState(true);
    const bars = document.getElementsByClassName("bar");

    for (let i = 0; i < bars.length; i++) {
        for (let j = 0; j < bars.length - i - 1; j++) {
            // Highlight bars being compared
            bars[j].classList.add("comparing");
            bars[j + 1].classList.add("comparing");

            await sleep(getDelay());

            const h1 = parseInt(bars[j].style.height);
            const h2 = parseInt(bars[j + 1].style.height);

            if (h1 > h2) {
                // Swap heights
                bars[j].style.height = `${h2}px`;
                bars[j + 1].style.height = `${h1}px`;
            }

            // Reset color
            bars[j].classList.remove("comparing");
            bars[j + 1].classList.remove("comparing");
        }
        // Mark sorted element
        bars[bars.length - i - 1].classList.add("sorted");
    }

    // Mark first element as sorted
    if (bars.length > 0) {
        bars[0].classList.add("sorted");
    }

    setButtonsState(false);
}

// Merge Sort
async function mergeSort() {
    setButtonsState(true);
    const bars = document.getElementsByClassName("bar");
    await mergeSortHelper(bars, 0, bars.length - 1);

    // Mark all as sorted
    for (let i = 0; i < bars.length; i++) {
        bars[i].classList.add("sorted");
        await sleep(20);
    }

    setButtonsState(false);
}

async function mergeSortHelper(bars, left, right) {
    if (left >= right) return;

    const mid = Math.floor((left + right) / 2);
    await mergeSortHelper(bars, left, mid);
    await mergeSortHelper(bars, mid + 1, right);
    await merge(bars, left, mid, right);
}

async function merge(bars, left, mid, right) {
    const leftArr = [];
    const rightArr = [];

    // Copy heights to temp arrays
    for (let i = left; i <= mid; i++) {
        leftArr.push(parseInt(bars[i].style.height));
    }
    for (let i = mid + 1; i <= right; i++) {
        rightArr.push(parseInt(bars[i].style.height));
    }

    let i = 0, j = 0, k = left;

    while (i < leftArr.length && j < rightArr.length) {
        bars[k].classList.add("comparing");
        await sleep(getDelay());

        if (leftArr[i] <= rightArr[j]) {
            bars[k].style.height = `${leftArr[i]}px`;
            i++;
        } else {
            bars[k].style.height = `${rightArr[j]}px`;
            j++;
        }

        bars[k].classList.remove("comparing");
        k++;
    }

    while (i < leftArr.length) {
        bars[k].classList.add("comparing");
        await sleep(getDelay());
        bars[k].style.height = `${leftArr[i]}px`;
        bars[k].classList.remove("comparing");
        i++;
        k++;
    }

    while (j < rightArr.length) {
        bars[k].classList.add("comparing");
        await sleep(getDelay());
        bars[k].style.height = `${rightArr[j]}px`;
        bars[k].classList.remove("comparing");
        j++;
        k++;
    }
}

// Quick Sort
async function quickSort() {
    setButtonsState(true);
    const bars = document.getElementsByClassName("bar");
    await quickSortHelper(bars, 0, bars.length - 1);

    // Mark all as sorted
    for (let i = 0; i < bars.length; i++) {
        bars[i].classList.add("sorted");
        await sleep(20);
    }

    setButtonsState(false);
}

async function quickSortHelper(bars, low, high) {
    if (low < high) {
        const pivotIndex = await partition(bars, low, high);
        await quickSortHelper(bars, low, pivotIndex - 1);
        await quickSortHelper(bars, pivotIndex + 1, high);
    }
}

async function partition(bars, low, high) {
    const pivotHeight = parseInt(bars[high].style.height);
    bars[high].classList.add("pivot");

    let i = low - 1;

    for (let j = low; j < high; j++) {
        bars[j].classList.add("comparing");
        await sleep(getDelay());

        const currentHeight = parseInt(bars[j].style.height);

        if (currentHeight < pivotHeight) {
            i++;
            // Swap bars[i] and bars[j]
            const tempHeight = bars[i].style.height;
            bars[i].style.height = bars[j].style.height;
            bars[j].style.height = tempHeight;
        }

        bars[j].classList.remove("comparing");
    }

    // Swap bars[i+1] and bars[high] (pivot)
    const tempHeight = bars[i + 1].style.height;
    bars[i + 1].style.height = bars[high].style.height;
    bars[high].style.height = tempHeight;

    bars[high].classList.remove("pivot");

    return i + 1;
}

// Event Listeners
newArrayBtn.addEventListener("click", () => generateArray());
bubbleSortBtn.addEventListener("click", bubbleSort);
mergeSortBtn.addEventListener("click", mergeSort);
quickSortBtn.addEventListener("click", quickSort);

sizeSlider.addEventListener("input", () => {
    if (!isSorting) {
        generateArray();
    }
});

// Initialize
generateArray();
