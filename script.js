const $ = id => document.getElementById(id)
const el = {
    area: $("area"),
    depth: $("depth"),
    paverType: $("paverType"),
    tphRate: $("tphRate"),
    manualRate: $("manualRate"),
    extraRate: $("extraRate"),
    tackArea: $("tackArea"),
    price: $("price"),
    waste: $("waste"),
    markup: $("markup"),
    result: $("result")
};
function money(num) {
    return num.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}
function flashField(field) {
    field.style.background = "#802020";
    setTimeout(() => field.style.background = "#222", 700);
}
function validate(field, min, fallback) {
    let val = parseFloat(field.value);
    if (isNaN(val) || val < min) {
        val = fallback;
        field.value = fallback;
        flashField(field);
    }
    return val;
}
function updatePaverRate() {
    const presets = {
        little: { tph: 75, rate: 850 },
        big: { tph: 100, rate: 1450 }
    };
    const current = presets[el.paverType.value];
    el.tphRate.value = current.tph;
    el.manualRate.value = current.rate;
}
function calculate() {
    const area = validate(el.area, 1, 1);
    let tackArea = parseFloat(el.tackArea.value);
    if (isNaN(tackArea) || tackArea <= 0) {
        tackArea = area;
        el.tackArea.value = area;
    }

    const depth = parseFloat(el.depth.value);
    const price = validate(el.price, 93.5, 100);
    const waste = validate(el.waste, 2.5, 5) / 100;
    const markup = validate(el.markup, 16, 18) / 100;
    let tph = parseFloat(el.tphRate.value);
    let rate = parseFloat(el.manualRate.value);
    const preset = {
        little: { tph: 75, rate: 850 },
        big: { tph: 100, rate: 1450 }
    }[el.paverType.value];
    if (!tph || tph <= 0) {
        tph = preset.tph;
        el.tphRate.value = tph;
    }
    if (!rate || rate <= 0) {
        rate = preset.rate;
        el.manualRate.value = rate;
    }
    let extra = parseFloat(el.extraRate.value);
    if (isNaN(extra) || extra < 0) extra = 0;
    const sqft = area * 9;
    const depthFeet = depth / 12;
    const baseTons = (sqft * depthFeet * 145) / 2000;
    const tons = Math.ceil(baseTons * (1 + waste));
    const hours = Math.ceil(tons / tph);
    const totalHours = hours + extra;
    
    const rawTackCost = tackArea * 0.88;
    const tackCost = Math.max(rawTackCost, 100);

    const productionCost = totalHours * rate;
    const materialCost = tons * price;
    const total = productionCost + materialCost + tackCost;
    const finalPrice = total * (1 + markup);
    const profit = finalPrice - total;



    el.result.innerHTML = `
        Base Tons: ${baseTons.toFixed(2)}<br>
        With Waste: ${tons}<br>
        Paving Hours: ${totalHours}<br>
        <span class="randomText">Speed: ${tph} TPH</span><br>
        <span class="randomText">Paver Rate: $${money(rate)}/hr</span><br>
        Paver Cost: $${money(productionCost)}<br>
        Material: $${money(materialCost)}<br>
        Tack Cost: $${money(tackCost)}<br>
        Cost: $${money(total)}<br>
        <span class="profit">Profit: $${money(profit)}</span><br><br>
        <span class="final">Final Price: $${money(finalPrice)}</span>
    `;
}
let timer;
Object.values(el).forEach(field => {
    if (!field) return;
    if (field.tagName === "INPUT") {
        field.addEventListener("input", () => {
            clearTimeout(timer);
            timer = setTimeout(calculate, 4000);
        });
    }
    if (field.tagName === "SELECT") {
        field.addEventListener("change", () => {
            updatePaverRate();
            calculate();
        });
    }
});

const fields = document.querySelectorAll("input, select");
fields.forEach((field, index) => {
    field.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            e.preventDefault();
            const next = fields[index + 1];
            if (next) next.focus();
            else calculate();
        }
    });
});
updatePaverRate();
calculate();
el.area.focus();
