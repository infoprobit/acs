import { ClosureComponent } from 'mithril';
import { m } from '../components.ts';
import * as taskQueue from '../task-queue.ts';
import { parse } from '../../lib/common/expression/parser.ts';
import memoize from '../../lib/common/memoize.ts';
import { evaluateExpression, QueryResponse } from '../store.ts';
import debounce from '../../lib/common/debounce.ts';
import { Expression } from '../../lib/types.ts';
import { FlatDevice } from '../../lib/ui/db.ts';

const memoizedParse = memoize(parse);

function escapeRegExp(str): string {
    return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}

const keysByDepth: WeakMap<Record<string, unknown>, string[][]> = new WeakMap();

function orderKeysByDepth(device: Record<string, unknown>): string[][] {
    if (keysByDepth.has(device)) return keysByDepth.get(device);
    const res: string[][] = [];
    for (const key of Object.keys(device)) {
        let count = 0;
        for (let i = key.lastIndexOf('.', key.length - 2); i >= 0; i = key.lastIndexOf('.', i - 1))
            ++count;
        while (res.length <= count) res.push([]);
        res[count].push(key);
    }
    keysByDepth.set(device, res);
    return res;
}

interface Attrs {
    device: FlatDevice;
    limit: Expression;
    deviceQuery: QueryResponse;
}

const component: ClosureComponent<Attrs> = () => {
    let queryString: string;
    const formQueryString = debounce((args: string[]) => {
        queryString = args[args.length - 1];
        m.redraw();
    }, 500);

    return {
        view: (vnode) => {
            const device = vnode.attrs.device;
            const limit  = (evaluateExpression(vnode.attrs.limit, device) as number) || 100;

            const search = m('.col-md-3', m('input', {
                type       : 'text',
                placeholder: 'Search parameters',
                class      : 'form-control',
                oninput    : (e) => {
                    formQueryString(e.target.value);
                    e.redraw = false;
                },
            }));

            const instanceRegex = /\.[0-9]+$/;
            let re;
            if (queryString) {
                const keywords = queryString.split(' ').filter((s) => s);
                if (keywords.length)
                    re = new RegExp(keywords.map((s) => escapeRegExp(s)).join('.*'), 'i');
            }

            const filteredKeys: string[] = [];
            const allKeys                = orderKeysByDepth(device);
            let count                    = 0;
            for (const keys of allKeys) {
                let c = 0;
                for (const k of keys) {
                    const p   = device[k];
                    const str = p.value?.[0] ? `${k} ${p.value[0]}` : k;
                    if (re && !re.test(str)) continue;
                    ++c;
                    if (count < limit) filteredKeys.push(k);
                }
                count += c;
            }

            filteredKeys.sort();

            const rows = filteredKeys.map((k) => {
                const p     = device[k];
                const val   = [];
                const attrs = {key: k};

                if (p.object === false) {
                    val.push(
                        m('parameter', Object.assign({device: device, parameter: memoizedParse(k)})),
                    );
                } else if (p.object && p.writable) {
                    if (instanceRegex.test(k)) {
                        val.push(m('span.parameter', {
                            title  : 'Delete this Instance',
                            onclick: () => {
                                taskQueue.queueTask({
                                                        name      : 'deleteObject',
                                                        device    : device['DeviceID.ID'].value[0] as string,
                                                        objectName: k,
                                                    });
                            },
                        }, [m.trust('&nbsp;'), m('i.bi.bi-trash')]));
                    } else {
                        val.push(m('span.parameter', {
                            title  : 'Create a New Instance',
                            onclick: () => {
                                taskQueue.queueTask({
                                                        name      : 'addObject',
                                                        device    : device['DeviceID.ID'].value[0] as string,
                                                        objectName: k,
                                                    });
                            },
                        }, [m.trust('&nbsp;'), m('i.bi.bi-plus-circle')]));
                    }
                }

                val.push(m('span.parameter', {
                    title  : 'Refresh Tree',
                    onclick: () => {
                        taskQueue.queueTask({
                                                name          : 'getParameterValues',
                                                device        : device['DeviceID.ID'].value[0] as string,
                                                parameterNames: [k],
                                            });
                    },
                }, [m.trust('&nbsp;'), m('i.bi.bi-arrow-clockwise')]));

                return m('tr', attrs, m('td', k), m('td', val));
            });

            const footerElements = [
                m('span.p-2', `Displaying ${filteredKeys.length} out of ${count} parameters.`),
                m('span.p-1', m('a.btn.btn-secondary', {
                      href: `api/devices/${encodeURIComponent(device['DeviceID.ID'].value[0])}.csv`, download: '',
                  }, 'Download'),
                ),
            ];

            return m('.col-lg-12', m('.card', m('.card-body', [
                m('h5.card-title', 'All Parameters'),
                m('loading', {queries: [vnode.attrs.deviceQuery]}, m('table.table.table-hover', [
                    m('thead', m('tr', m('td', {colspan: 2}, search))),
                    m('tbody', rows),
                    m('tfoot', m('tr', m('td', {colspan: 2}, footerElements))),
                ])),
            ])));
        },
    };
};

export default component;
