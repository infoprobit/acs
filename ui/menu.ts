import m, { ClosureComponent, Component } from 'mithril';
import adminMenu from './admin-menu.ts';
import { LOGO_WHITE_PNG } from '../build/assets.ts';

const adminPages = [
    'presets',
    'provisions',
    'virtualParameters',
    'files',
    'config',
    'permissions',
    'users',
];

const component: ClosureComponent = (): Component => {
    return {
        view: (vnode) => {
            const active = (page: string) => {
                return vnode.attrs['page'] === page ? '' : ' collapsed';
            };

            let sideMenu, group;

            if (adminPages.includes(vnode.attrs['page'])) {
                group         = 'admin';
                const attrs   = {};
                attrs['page'] = vnode.attrs['page'];
                sideMenu      = m(adminMenu, attrs);
            }

            const items = [];
            if (window.authorizer.hasAccess('devices', 1)) {
                items.push(
                    m(
                        'li.nav-item',
                        m(
                            'a', {class: 'nav-link' + active('overview'), href: '#!/overview'},
                            [m('i.bi.bi-grid'), m('span', 'Dashboard')],
                        ),
                    ),
                );
            }

            if (window.authorizer.hasAccess('devices', 2)) {
                items.push(
                    m(
                        'li.nav-item',
                        m(
                            'a', {class: 'nav-link' + active('devices'), href: '#!/devices'},
                            [m('i.bi.bi-router'), m('span', 'Devices')],
                        ),
                    ),
                );
            }

            if (window.authorizer.hasAccess('faults', 2)) {
                items.push(
                    m(
                        'li.nav-item',
                        m(
                            'a', {class: 'nav-link' + active('faults'), href: '#!/faults'},
                            [m('i.bi.bi-ban'), m('span', 'Faults')],
                        ),
                    ),
                );
            }

            for (const page of adminPages) {
                if (window.authorizer.hasAccess(page, 2)) {
                    items.push(
                        m(
                            'li.nav-item',
                            m(
                                'a', {class: 'nav-link' + active('admin'), href: '#!/admin'},
                                [m('i.bi.bi-sliders2'), m('span', 'Admin')],
                            ),
                            sideMenu,
                        ),
                    );
                    break;
                }
            }

            return m(
                'aside', {id: 'sidebar', class: 'sidebar'},
                m('ul', {id: 'sidebar-nav', class: 'sidebar-nav'}, items),
                m(
                    'div.bottom-logo.d-flex.justify-content-center',
                    m('img', {width: '150px', src: LOGO_WHITE_PNG}),
                ),
            );
        },
    };
};

export default component;
