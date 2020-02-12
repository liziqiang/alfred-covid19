const alfy = require('alfy');

const PAGE_URL = 'https://static.iqiyi.com/gzbd/index.html';

async function getData() {
    let list = [];
    let covidList = alfy.cache.get('covidList');
    if (covidList) {
        list = covidList;
    } else {
        const response = await alfy.fetch('https://toutiao.iqiyi.com/api/route/haoduo/nCoV/detail');
        const data = response && response.code === 'A00000' && response.data;
        if (data) {
            list = data.detail || [];
            let totalData = {
                name: '全国',
                deadCount: data.totalDeadCount,
                curedCount: data.totalCuredCount,
                confirmedCount: data.totalConfirmedCount,
                suspectedCount: data.totalSuspectedCount,
            };
            list = [totalData, ...list].map((v) => {
                v.name = v.name || v.provinceName || v.cityName;
                return v;
            });
            alfy.cache.set('covidList', list, { maxAge: 60 * 1 * 1000 });
        }
    }

    if (alfy.input) {
        let matched = list.filter((v) => v.name.includes(alfy.input));
        if (matched.length === 1) {
            let cities = matched[0] && matched[0].cities || [];
            if (cities.length) {
                list = cities;
            }
        } else {
            list = matched;
        }
    }
    list = list.map((v) => {
        v.name = v.name || v.provinceName || v.cityName;
        return v;
    });
    return list;
}

function renderItems(list) {
    let items = list.map((v) => {
        return {
            title: v.name,
            arg: v.name,
            subtitle: `确诊：${v.confirmedCount} 疑似：${v.suspectedCount} 治愈：${v.curedCount} 死亡：${v.deadCount}`,
            autocomplete: v.name,
            valid: false,
            icon: {
                path: alfy.icon.info
            },
            mods: {
                'cmd': {
                    arg: PAGE_URL,
                    subtitle: `打开数据页面: ${PAGE_URL}`
                }
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
