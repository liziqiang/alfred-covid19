const alfy = require('alfy');

async function getData() {
    let list = [];
    let covidList = alfy.cache.get('covidList');
    if (covidList) {
        list = covidList;
    } else {
        const response = await alfy.fetch(`https://interface.sina.cn/news/wap/fymap2020_data.d.json?_=${+new Date()}`);
        const isValid = response && response.data;
        if (isValid) {
            let data = response.data;
            list = data.list;
            let totalData = { name: '全国', value: data.gntotal, susNum: data.sustotal, cureNum: data.curetotal, deathNum: data.deathtotal };
            list = [totalData, ...list];
            alfy.cache.set('covidList', list, { maxAge: 60 * 1 * 1000 });
        }
    }

    if (alfy.input) {
        let matched = list.filter((v) => v.name.includes(alfy.input));
        if (matched.length === 1) {
            let city = matched[0] && matched[0].city || [];
            if (city.length) {
                list = city.map((v) => {
                    v.value = v.conNum;
                    return v;
                });
            }
        } else {
            list = matched;
        }
    }
    
    return list;
}

function renderItems(list) {
    let items = list.map((v) => {
        return {
            title: v.name,
            arg: v.name,
            subtitle: `确诊：${v.value} 疑似：${v.susNum} 治愈：${v.cureNum} 死亡：${v.deathNum}`,
            autocomplete: v.name,
            valid: false,
            icon: {
                path: alfy.icon.info
            }
        }
    });
    if (items.length) {
        alfy.output(items);
    } else {
        items = [{ title: '暂无数据', icon: { path: alfy.icon.error } }];
    }
};

getData().then(renderItems);
