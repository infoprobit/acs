import m, { ClosureComponent } from 'mithril';
import * as store from './store.ts';
import devicesChart from './components/devices-chart.ts';
import devicesGroup from './components/devices-group.ts';

function queryGroup(group: Record<string, unknown>): Record<string, unknown> {
    group = Object.assign({}, group);
    for (let [grName, gr] of Object.entries(group)) {
        group[grName]          = gr = Object.assign({}, gr);
        group[grName]['label'] = gr['_id'];
        group[grName]['count'] = store.count('devices', ['AND', ['=', ['PARAM', 'DeviceID.ProductClass'], gr['_id']]]);
    }
    return group;
}

function queryChart(chart: Record<string, unknown>): Record<string, unknown> {
    chart = Object.assign({}, chart);
    for (let [chName, ch] of Object.entries(chart)) {
        chart[chName]          = ch = Object.assign({}, ch);
        chart[chName]['label'] = ch['_id'];

        chart[chName]['count']            = {};
        chart[chName]['count']['online']  = store.count('devices', [
            'AND',
            ['>', ['PARAM', 'Events.Inform'], (Date.now() - (5 * 60 * 1000))],
            ['=', ['PARAM', 'DeviceID.ProductClass'], ch['_id']],
        ]);
        chart[chName]['count']['offline'] = store.count('devices', [
            'AND',
            ['>', ['PARAM', 'Events.Inform'], Date.now() - (5 * 60 * 1000) - (24 * 60 * 60 * 1000)],
            ['<', ['PARAM', 'Events.Inform'], Date.now() - (5 * 60 * 1000)],
            ['=', ['PARAM', 'DeviceID.ProductClass'], ch['_id']],
        ]);
        chart[chName]['count']['other']   = store.count('devices', [
            'AND',
            ['<', ['PARAM', 'Events.Inform'], Date.now() - (5 * 60 * 1000) - (24 * 60 * 60 * 1000)],
            ['=', ['PARAM', 'DeviceID.ProductClass'], ch['_id']],
        ]);
    }

    return chart;
}

async function fetchProductClass() {
    try {
        return await store.groupResult('devices', '_deviceId._ProductClass');
    } catch (error) {
        new Error('Error during get a data: ' + error)
    }
}

export async function init(): Promise<Record<string, unknown>> {
    if (!window.authorizer.hasAccess('devices', 1)) {
        return Promise.reject(
            new Error('You are not authorized to view this page'),
        );
    }

    const chart            = await fetchProductClass();
    const [devices, group] = await Promise.all([queryChart(chart), queryGroup(chart)]);

    return Promise.resolve({devices: devices, group: group});
}

export const component: ClosureComponent = (): { view: (vnode) => any[] } => {
    return {
        view: (vnode) => {
            document.title = 'Overview - ProACS';
            const children = [];

            const group   = {};
            group['data'] = vnode.attrs['group'];

            children.push(m(devicesGroup, group));

            const devices    = vnode.attrs['devices'];
            let charts       = {};
            const categories = [];
            const series     = [
                {name: 'Online Now', data: []},
                {name: 'Past 24 hours', data: []},
                {name: 'Others', data: []},
            ];

            for (const ch of Object.values(devices)) {
                categories.push(ch['label']);
                series[0].data.push(ch['count']['online']['value'] || 0);
                series[1].data.push(ch['count']['offline']['value'] || 0);
                series[2].data.push(ch['count']['other']['value'] || 0);
            }

            charts['data'] = {
                categories: categories,
                series    : series,
            };
            children.push(m(devicesChart, charts));

            return children;
        },
    };
};
