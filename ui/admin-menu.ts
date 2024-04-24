import m, { ClosureComponent, Component } from 'mithril';

const component: ClosureComponent = (): Component => {
    return {
        view: (vnode) => {
            const active = (page: string) => {
                return vnode.attrs['page'] === page ? ' active' : '';
            };
            const items  = [];

            if (window.authorizer.hasAccess('presets', 1)) {
                items.push(
                    m(
                        'li',
                        m(
                            'a',
                            {href: '#!/admin/presets', class: 'nav-link' + active('presets')},
                            [m('i.bi.bi-circle'), m('span', 'Presets')],
                        ),
                    ),
                );
            }

            if (window.authorizer.hasAccess('provisions', 1)) {
                items.push(
                    m(
                        'li',
                        m(
                            'a',
                            {href: '#!/admin/provisions', class: 'nav-link' + active('provisions')},
                            [m('i.bi.bi-circle'), m('span', 'Provisions')],
                        ),
                    ),
                );
            }

            if (window.authorizer.hasAccess('virtualParameters', 1)) {
                items.push(
                    m(
                        'li',
                        m(
                            'a',
                            {href: '#!/admin/virtualParameters', class: 'nav-link' + active('virtualParameters')},
                            [m('i.bi.bi-circle'), m('span', 'Virtual Parameters')],
                        ),
                    ),
                );
            }

            if (window.authorizer.hasAccess('files', 1)) {
                items.push(
                    m(
                        'li',
                        m(
                            'a',
                            {href: '#!/admin/files', class: 'nav-link' + active('files')},
                            [m('i.bi.bi-circle'), m('span', 'Files')],
                        ),
                    ),
                );
            }

            if (window.authorizer.hasAccess('config', 1)) {
                items.push(
                    m(
                        'li',
                        m(
                            'a',
                            {href: '#!/admin/config', class: 'nav-link' + active('config')},
                            [m('i.bi.bi-circle'), m('span', 'Config')],
                        ),
                    ),
                );
            }

            if (window.authorizer.hasAccess('permissions', 1)) {
                items.push(
                    m(
                        'li',
                        m(
                            'a',
                            {href: '#!/admin/permissions', class: 'nav-link' + active('permissions')},
                            [m('i.bi.bi-circle'), m('span', 'Permissions')],
                        ),
                    ),
                );
            }

            if (window.authorizer.hasAccess('users', 1)) {
                items.push(
                    m(
                        'li',
                        m(
                            'a',
                            {href: '#!/admin/users', class: 'nav-link' + active('users')},
                            [m('i.bi.bi-circle'), m('span', 'Users')],
                        ),
                    ),
                );
            }

            return m('ul', {class: 'nav-content'}, items);
        },
    };
};

export default component;
