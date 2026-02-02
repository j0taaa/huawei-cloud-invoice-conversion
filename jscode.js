let stopFlag2 = false; // This will be used to control whether to stop the execution

let configs = []

function select(category, index) {
    let ul = uls[category];
    let element = ul.children[index].children[0];

    return new Promise(resolve => {
        setTimeout(() => {
            if (!stopFlag2) {
                element.click();
                resolve();
            } else {
                resolve(); // Resolve immediately if stopFlag2 is true
            }
        }, 1000); // 1 second delay
    });
}
function getConfig(category){
    let flavorInfo = document.getElementsByClassName("tiny-form-item__content")[9].innerText.split(": ")[1].split(" | ")

    let flavor = flavorInfo[0]
    let amountVCpus = flavorInfo[1]
    let amountMem = flavorInfo[2]

    return {
        "category": category,
        "flavor": flavor,
        "vCPUs": amountVCpus,
        "memory": amountMem
    }
}

async function executeSelects() {
    for (let i = 0; i < getLength(3); i++) {
        if (stopFlag2) break; // Exit if stopFlag2 is true
        await select(3, i);

        for (let j = 0; j < getLength(4); j++) {
            if (stopFlag2) break; // Exit if stopFlag2 is true
            await select(4, j);

            for (let k = 0; k < getLength(5); k++) {
                if (stopFlag2) break; // Exit if stopFlag2 is true
                await select(5, k);

                for (let l = 0; l < getLength(6); l++) {
                    if (stopFlag2) break; // Exit if stopFlag2 is true
                    await select(6, l);

                    for (let m = 0; m < getLength(7); m++) {
                        if (stopFlag2) break; // Exit if stopFlag2 is true
                        await select(7, m);

                        configs.push(getConfig(j))
                    }
                }
            }
        }
    }
}

// To stop the function, you can set the stopFlag2 to true
function stopExecution() {
    stopFlag2 = true;
}

// Call the function to start the sequence
executeSelects();
