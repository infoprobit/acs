import { Children, ClosureComponent } from 'mithril';
import { m } from './components.ts';
import * as store from './store.ts';
import devicesChart from './components/devices-chart.ts';
import devicesGroup from './components/devices-group.ts';
import indexTableComponent from './index-table-component.ts';
import memoize from '../lib/common/memoize.ts';
import { map, parse } from '../lib/common/expression/parser.ts';
import * as smartQuery from './smart-query.ts';
import config from './config.ts';
import filterComponent from './filter-component.ts';

const PAGE_SIZE = config.ui.pageSize || 10;

const memoizedParse    = memoize(parse);
const unpackSmartQuery = memoize((query) => {
    return map(query, (e) => {
        if (Array.isArray(e) && e[0] === 'FUNC' && e[1] === 'Q')
            return smartQuery.unpack('devices', e[2], e[3]);
        return e;
    });
});

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

export async function init(args: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (!window.authorizer.hasAccess('devices', 1)) {
        return Promise.reject(new Error('You are not authorized to view this page!'));
    }

    const filter           = args.hasOwnProperty('filter') ? '' + args['filter'] : '';
    const sort             = args.hasOwnProperty('sort') ? '' + args['sort'] : '';
    const chart            = await fetchProductClass();
    const [devices, group] = await Promise.all([queryChart(chart), queryGroup(chart)]);

    return Promise.resolve({devices, group, filter, sort});
}

export const component: ClosureComponent = (): { view: (vnode) => any[] } => {
    return {
        view: (vnode) => {
            document.title = 'Pro ACS: Dashboard';
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

            const attributes = [
                {label: 'Serial Number', parameter: ['PARAM', 'DeviceID.SerialNumber']},
                {label: 'Product Class', parameter: ['PARAM', 'DeviceID.ProductClass']},
                {label: 'Software Version', parameter: ['PARAM', 'InternetGatewayDevice.DeviceInfo.SoftwareVersion']},
                {
                    label    : 'IP Address',
                    parameter: ['PARAM', 'InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANIPConnection.1.ExternalIPAddress'],
                },
                {label: 'Up Time', parameter: ['PARAM', 'InternetGatewayDevice.DeviceInfo.UpTime']},
            ];

            function showMore(): void {
                vnode.state['showCount'] = (vnode.state['showCount'] || PAGE_SIZE) + PAGE_SIZE;
                m.redraw();
            }

            function onFilterChanged(filter: any): void {
                const ops = {filter};
                if (vnode.attrs['sort']) ops['sort'] = vnode.attrs['sort'];
                vnode.attrs['filter'] = filter;
                m.redraw();
            }

            const sortAttributes = {};

            let filter          = vnode.attrs['filter'] ? memoizedParse(vnode.attrs['filter']) : true;
            filter              = unpackSmartQuery(filter);
            const count         = store.count('devices', filter);
            const devs          = store.fetch('devices', filter, {
                limit: vnode.state['showCount'] || PAGE_SIZE,
            });
            const valueCallback = (attr: any, device: any): Children => {
                return m.context({device: device, parameter: attr.parameter}, attr.type || 'parameter', attr);
            };

            const attrs               = {};
            attrs['attributes']       = attributes;
            attrs['sortAttributes']   = sortAttributes;
            attrs['data']             = devs.value;
            attrs['total']            = count.value;
            attrs['valueCallback']    = valueCallback;
            attrs['showMoreCallback'] = showMore;

            const filterAttrs = {
                resource: 'devices',
                filter  : vnode.attrs['filter'],
                onChange: onFilterChanged,
            };

            children.push(m('.col-lg-12', m('.card', m('.card-body', [
                m('.card-title', m(filterComponent, filterAttrs)),
                m('loading', {queries: [devs, count]}, m(indexTableComponent, attrs)),
            ]))));

            return children;
        },
    };
};
