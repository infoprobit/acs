import { ClosureComponent, Component } from 'mithril';
import deviceActions from './device-actions.ts';
import { m } from '../components.ts';
import ping from './ping.ts';
import tags from './tags.ts';

const component: ClosureComponent = (): Component => {
    return {
        view: (vnode) => {
            const device = vnode.attrs['device'];
            return m('.col-lg-6', [
                m('.card.info-card', m('.card-body', [m('h5.card-title', 'Device Action'), m(deviceActions)])),
                m('.row', [
                      m('.col-lg-6', m('.card.info-card', m('.card-body', [m('h5.card-title', 'Tags'), m(tags)]))),
                      m('.col-lg-6', m('.card.info-card', m('.card-body', [m('h5.card-title', 'Online'), m(ping)]))),
                  ],
                ),
            ]);
        },
    };
};

export default component;
