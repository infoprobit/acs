import { ClosureComponent, VnodeDOM } from 'mithril';
import { m } from '../components.ts';
import { evaluateExpression, QueryResponse } from '../store.ts';
import { FlatDevice } from '../../lib/ui/db.ts';
import { Expression } from '../../lib/types.ts';

interface Attrs {
    device: FlatDevice;
    parameters: Record<string, { type?: Expression; label: Expression; parameter: Expression }>;
    deviceQuery: QueryResponse;
}

const component: ClosureComponent<Attrs> = () => {
    return {
        view: (vnode) => {
            const device = vnode.attrs.device;

            const rows = Object.values(vnode.attrs.parameters).map((parameter) => {

                const type = evaluateExpression(parameter.type, device);
                const p    = m.context(
                    {device   : device, parameter: parameter.parameter},
                    (type as string) || 'parameter',
                    parameter,
                );

                return m(
                    'tr',
                    {
                        oncreate: (vn) => {
                            (vn.dom as HTMLElement).style.display = (p as VnodeDOM).dom ? '' : 'none';
                        },
                        onupdate: (vn) => {
                            (vn.dom as HTMLElement).style.display = (p as VnodeDOM).dom ? '' : 'none';
                        },
                    },
                    m('th', evaluateExpression(parameter.label, device)),
                    m('td', p),
                );
            });

            return m('.col-lg-6', m('.card.info-card', m('.card-body', [
                m('h5.card-title', 'List Info'),
                m('loading', {queries: [vnode.attrs.deviceQuery]}, m('table.table.table-borderless', rows)),
            ])));
        },
    };
};

export default component;
