const { calculateSaju } = require('ssaju');

const res = calculateSaju({
    year: 1991, month: 1, day: 13, hour: 3, minute: 10,
    calendar: 'solar'
});
console.log('--- Pillar Details ---');
console.log(JSON.stringify(res.pillarDetails, null, 2));
console.log('--- Sals Object ---');
console.log(JSON.stringify(res.sals, null, 2));
console.log('--- Stages12 Object ---');
console.log(JSON.stringify(res.stages12, null, 2));
