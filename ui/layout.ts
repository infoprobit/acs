import m, { ClosureComponent, Component } from 'mithril';
import menu from './menu.ts';
import drawerComponent from './drawer-component.ts';
import userMenu from './user-menu.ts';
import * as overlay from './overlay.ts';
import datalist from './datalist.ts';

const simplePages = [
    'login',
];

const component: ClosureComponent = (): Component => {
    return {
        view: (vnode) => {
            const attrs = {};
            attrs['page'] = vnode.attrs['page'];

            if (simplePages.includes(vnode.attrs['page'])) {
                return [
                    m(drawerComponent),
                    m(
                        'main',
                        m(
                            'div.container', {class: `page-${vnode.attrs['page']}`},
                            m(
                                'section.section.register.min-vh-100.d-flex.flex-column.align-items-center.justify-content-center.py-4',
                                m(
                                    'div.container',
                                    m(
                                        'div.row.justify-content-center',
                                        m(
                                            '#content.col-lg-4.col-md-6.d-flex.flex-column.align-items-center.justify-content-center',
                                            [vnode.children],
                                        ),
                                    ),
                                ),
                            ),
                        ),
                    ),
                    overlay.render(),
                ];
            }

            return [
                m(
                    '#header.header.fixed-top.d-flex.align-items-center',
                    m(
                        'div.d-flex.justify-content-between',
                        m('a.logo.d-flex.align-items-center', {href: '/'}, m('span.d-lg-block', 'Pro ACS')),
                    ),
                    m('i.bi.bi-list.toggle-sidebar-btn', {
                        onclick: () => {
                            document.body.classList.toggle('toggle-sidebar');
                        },
                    }),
                    m(userMenu),
                ),
                m(menu, attrs),
                m(drawerComponent),
                m('main', {id: 'main', class: 'main'},
                  m('section', {class: `section page-${vnode.attrs['page']}`}, [vnode.children]),
                ),
                overlay.render(),
                m(datalist),
            ];
        },
    };
};

export default component;
