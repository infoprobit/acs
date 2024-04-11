import { ClosureComponent, Component } from 'mithril';
import { m } from './components.ts';
import config from './config.ts';
import * as store from './store.ts';

export function init(args: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (!window.authorizer.hasAccess('devices', 2)) {
        return Promise.reject(
            new Error('You are not authorized to view this page'),
        );
    }

    return Promise.resolve({deviceId: args.id, deviceFilter: ['=', ['PARAM', 'DeviceID.ID'], args.id]});
}

export const component: ClosureComponent = (): Component => {
    return {
        view: (vnode) => {
            document.title = `${vnode.attrs['deviceId']} - Devices - ProACS`;

            const dev = store.fetch('devices', vnode.attrs['deviceFilter']);
            if (!dev.value.length) {
                if (!dev.fulfilling) {
                    return [
                        m('.pagetitle', m('h1', 'No Device Found')),
                        m('.row', m('.col-lg-12', m('.card', m('.card-body', [
                            m('.card-title', ''),
                            m(
                                'div',
                                {class: 'alert alert-danger text-center bg-danger text-light'},
                                `No such device ${vnode.attrs['deviceId']}`,
                            ),
                        ])))),

                    ];
                }

                return m('loading', {queries: [dev]}, m('div', {style: 'height: 200px;'}));
            }

            const conf = config.ui.device;
            const cmps = [];

            for (const c of Object.values(conf)) {
                cmps.push(m.context({device: dev.value[0], deviceQuery: dev}, c['type'], c));
            }

            return [
                m('.pagetitle', m('h1', `Device: ${vnode.attrs['deviceId']}`)),
                m('.row', m('.col-lg-12', m('.card', m('.card-body', [cmps])))),
            ];
        },
    };
};
