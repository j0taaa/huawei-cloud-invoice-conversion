function getULs(){
    return Array.from(document.getElementsByClassName("tiny-group-item"))
}

function openService(service){
    window.location.href = "https://www.huaweicloud.com/intl/en-us/pricing/calculator-old.html#/"+service
}

function getIndexFromUL(ulIndex, element){
    let uls = getULs()
    ul = uls[ulIndex]
    children = ul.children
    for(let i=0;i<children.length;i++){
        if(children[i].children[0].innerText.toLowerCase() == element.toLowerCase()){
            return i
        }
    }
}

async function clickElementFromUL(uls, ulIndex, element) {
    const ul = uls[ulIndex];
    const children = ul.children;

    for (let i = 0; i < children.length; i++) {
        if (children[i].children[0].innerText.toLowerCase().replaceAll("-", "").replaceAll(" ", "") == element.toLowerCase().replaceAll("-", "").replaceAll(" ", "")) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            children[i].children[0].click();
            return;
        }
    }
}

async function clickAddToCartButton(){
    await new Promise(resolve => setTimeout(resolve, 3000));
    let btn = document.getElementsByClassName("tiny-button tiny-button--primary tiny-button--medium")[0]
    btn.click()
}

async function changeAmount(amount){
    let inputs = document.getElementsByClassName("tiny-numeric__input-inner")
    let input = inputs[inputs.length-1]

    input.focus()
    input.value = amount

    const event = new Event('change', { bubbles: true });
    input.dispatchEvent(event);
}

async function addECS(region, billingMode, arch, type, family, vcpus, memory, amount = 1){
    openService("ecs")
    await new Promise(resolve => setTimeout(resolve, 2000));
    let uls = getULs()
    await clickElementFromUL(uls, 0, region)
    await new Promise(resolve => setTimeout(resolve, 5000));
    await clickElementFromUL(uls, 2, billingMode)
    await clickElementFromUL(uls, 3,arch)
    await clickElementFromUL(uls, 4,type)
    await clickElementFromUL(uls, 5,family)
    await clickElementFromUL(uls, 6,vcpus + ((vcpus == 1)? "vcpu" : " vcpus" ))
    await clickElementFromUL(uls, 7,memory + "gib")

    await changeAmount(amount)

    await clickAddToCartButton()
}

async function clickSelectOption(optionText){
    await new Promise(resolve => setTimeout(resolve, 1000));
    let options = document.getElementsByClassName("tiny-option-wrapper")
    let option
    for(let i=0;i<options.length;i++){
        if(options[i].innerText == optionText){
            option = options[i]
        }
    }

    option.click()
}

async function changeNumericInput(index, amount){
    let inputs = document.getElementsByClassName("tiny-numeric__input-inner")
    let input = inputs[index]

    input.focus()
    input.value = amount

    const event = new Event('change', { bubbles: true });
    input.dispatchEvent(event);
}

async function addEVS(region, type, storage, amount = 1){
    openService("evs")
    await new Promise(resolve => setTimeout(resolve, 2000));
    let uls = getULs()
    await clickElementFromUL(uls, 0, region)
    await new Promise(resolve => setTimeout(resolve, 5000));
    await clickElementFromUL(uls, 2, "Pay-per-use")
    await clickSelectOption(type)
    await changeNumericInput(0, storage)
    await changeNumericInput(3, 744)
    await clickElementFromUL(uls, 3, "1 year")
    await changeAmount(amount)

    await clickAddToCartButton()
}

async function addFlexus(region, vcpus, memory, amount = 1){
    openService("hecs")
    await new Promise(resolve => setTimeout(resolve, 2000));
    let uls = getULs()
    await clickElementFromUL(uls, 0, region)
    await new Promise(resolve => setTimeout(resolve, 5000));
    await clickElementFromUL(uls, 2, "payperuse")
    await clickElementFromUL(uls, 5,vcpus + ((vcpus == 1)? "vcpu" : "vcpus" ))
    await clickElementFromUL(uls, 6,memory + "gb")
    await clickElementFromUL(uls, 7, "not required")
    
    
    await changeNumericInput(5, 744)
    await changeNumericInput(6, amount)

    await clickAddToCartButton()
}