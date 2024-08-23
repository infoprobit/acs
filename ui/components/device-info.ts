import { ClosureComponent, Component } from 'mithril';
import deviceActions from './device-actions.ts';
import { m } from '../components.ts';
import ping from './ping.ts';
import tags from './tags.ts';

const component: ClosureComponent = (): Component => {
    return {
        view: (vnode) => {
            const info = [];
            if (window.authorizer.hasAccess('devices', 3)) {
                info.push(
                    m('.card.info-card', m('.card-body', [m('h5.card-title', 'Device Action'), m(deviceActions)])),
                    m('.col-lg-6', m('.card.info-card', m('.card-body', [m('h5.card-title', 'Tags'), m(tags)]))),
                );
            }
            info.push(
                m('.col-lg-6', m('.card.info-card', m('.card-body', [m('h5.card-title', 'Online'), m(ping)]))),
            );

            return m('.col-lg-6.row', info);
        },
    };
};

export default component;
