import { Children, ClosureComponent, Component } from 'mithril';
import { m } from '../components.ts';

function drawGroups(groups): Children {
    const paths  = ~~(12 / Object.keys(groups).length);
    const legend = [];

    for (const gr of Object.values(groups)) {
        legend.push(m('div', {class: 'col-lg-' + paths}, m('.card.info-card', m('.card-body', [
            m('h5.card-title', gr['label']),
            m('.d-flex.align-items-center.justify-content-center', m('h6.ps-3', gr['count']['value'] || 0)),
        ]))));
    }

    return m('.row', legend);
}

const component: ClosureComponent = (): Component => {
    return {
        view: (vnode) => {
            return drawGroups(vnode.attrs['data']);
        },
    };
};

export default component;
