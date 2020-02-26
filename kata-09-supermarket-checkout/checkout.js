const R = require('ramda');
const util = require('util');

const assert = (a, b) => {
    if(a === b) {
        console.log(`${a === b} ${a} is equal to ${b}`);
    } else {
        console.log(`expected ${a} to equal ${b}`);
    }
}

const skuToPrice = {
    'A' : { 
        unitPrice: 50.0, 
        pricingRules: [
            {threshold:3, price:130}
        ]
    },
    'B' : { 
        unitPrice: 30.0, 
        pricingRules: [
            {threshold:2, price:45}
        ]
    }
}

const getAmountToAdd = (unitPrice, specialOffer) => {
    const unitPriceBelowThreshold = (specialOffer.threshold - 1) * unitPrice;
    return (specialOffer.price - unitPriceBelowThreshold);
}

const scan = (numOfItems, pricingRule) => {
    if(pricingRule.pricingRules.length > 0 && 
       numOfItems >= pricingRule.pricingRules[0].threshold) {
        return getAmountToAdd(pricingRule.unitPrice, pricingRule.pricingRules[0]);
    }
    return pricingRule.unitPrice;
}

const getItemCounts = (sku, itemCounts) => {
    if(sku in itemCounts) {
        return {...itemCounts, [`${sku}`]: itemCounts[sku] + 1};
    } else {
        return {...itemCounts, [`${sku}`]: 1};
    }
}

const goodsWithCatalogue = R.curry((pC, goods) => {
    const skus = goods.split('');
    let itemCounts = {};
    return skus.reduce((t, sku) => {
        itemCounts = getItemCounts(sku, itemCounts);
        t += scan(itemCounts[sku], pC[sku]);
        return t;
    }, 0);
});

const price = goodsWithCatalogue(skuToPrice);

assert(scan(2, {unitPrice: 45, pricingRules : []}), 45);
assert(scan(2, {unitPrice: 45, pricingRules : [ {threshold : 2, price: 60} ]}), 15);

assert(price('A'), 50.0);
assert(price('AB'), 80.0);
assert(price('AA'), 100.0);
assert(price('AAA'), 130.0);
assert(price('AAABB'), 175.0);